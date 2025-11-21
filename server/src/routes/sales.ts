import { Router } from 'express';
import db from '../database/init';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = Router();

// Listar vendas
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, limit } = req.query;
    
    let query = `
      SELECT s.*, u.name as user_name 
      FROM sales s 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (startDate) {
      query += ` AND DATE(s.created_at) >= DATE(?)`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND DATE(s.created_at) <= DATE(?)`;
      params.push(endDate);
    }

    query += ` ORDER BY s.created_at DESC`;

    if (limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(limit as string));
    }

    const sales = db.prepare(query).all(...params);
    res.json(sales);
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ error: 'Erro ao listar vendas' });
  }
});

// Buscar venda por ID com itens
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const sale = db.prepare(`
      SELECT s.*, u.name as user_name 
      FROM sales s 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE s.id = ?
    `).get(req.params.id);

    if (!sale) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(req.params.id);

    res.json({ ...sale, items });
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({ error: 'Erro ao buscar venda' });
  }
});

// Criar venda
router.post('/',
  authenticateToken,
  body('items').isArray({ min: 1 }).withMessage('Adicione pelo menos um item'),
  body('payment_method').notEmpty().withMessage('Método de pagamento é obrigatório'),
  (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, discount, payment_method, payment_received, notes } = req.body;
    const userId = req.user!.id;

    try {
      // Validar estoque
      for (const item of items) {
        const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(item.product_id) as any;
        
        if (!product) {
          return res.status(400).json({ error: `Produto ID ${item.product_id} não encontrado` });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            error: `Estoque insuficiente para o produto. Disponível: ${product.stock}` 
          });
        }
      }

      // Calcular totais
      const total = items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);
      const discountAmount = discount || 0;
      const finalTotal = total - discountAmount;
      const changeAmount = payment_received ? payment_received - finalTotal : 0;

      // Iniciar transação
      const insertSale = db.prepare(`
        INSERT INTO sales (user_id, total, discount, final_total, payment_method, payment_received, change_amount, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertItem = db.prepare(`
        INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const transaction = db.transaction(() => {
        const result = insertSale.run(
          userId, 
          total, 
          discountAmount, 
          finalTotal, 
          payment_method, 
          payment_received || null, 
          changeAmount,
          notes || null
        );

        const saleId = result.lastInsertRowid;

        for (const item of items) {
          const subtotal = item.unit_price * item.quantity;
          insertItem.run(
            saleId,
            item.product_id,
            item.product_name,
            item.quantity,
            item.unit_price,
            subtotal
          );
        }

        return saleId;
      });

      const saleId = transaction();

      const sale = db.prepare(`
        SELECT s.*, u.name as user_name 
        FROM sales s 
        LEFT JOIN users u ON s.user_id = u.id 
        WHERE s.id = ?
      `).get(saleId);

      const saleItems = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleId);

      res.status(201).json({ ...sale, items: saleItems });
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      res.status(500).json({ error: 'Erro ao criar venda' });
    }
  }
);

export default router;
