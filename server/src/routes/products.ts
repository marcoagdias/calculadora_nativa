import { Router } from 'express';
import db from '../database/init';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = Router();

// Listar todos os produtos
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { search, category, lowStock } = req.query;
    
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.active = 1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (p.name LIKE ? OR p.barcode LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ` AND p.category_id = ?`;
      params.push(category);
    }

    if (lowStock === 'true') {
      query += ` AND p.stock <= p.min_stock`;
    }

    query += ` ORDER BY p.name`;

    const products = db.prepare(query).all(...params);
    res.json(products);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

// Buscar produto por ID
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `).get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// Buscar produto por código de barras
router.get('/barcode/:barcode', authenticateToken, (req: AuthRequest, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.barcode = ? AND p.active = 1
    `).get(req.params.barcode);

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// Criar produto
router.post('/',
  authenticateToken,
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('sale_price').isFloat({ min: 0 }).withMessage('Preço de venda inválido'),
  body('cost_price').isFloat({ min: 0 }).withMessage('Preço de custo inválido'),
  (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, barcode, category_id, cost_price, sale_price, stock, min_stock, description } = req.body;

    try {
      const result = db.prepare(`
        INSERT INTO products (name, barcode, category_id, cost_price, sale_price, stock, min_stock, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, barcode || null, category_id || null, cost_price, sale_price, stock || 0, min_stock || 5, description || null);

      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(product);
    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Código de barras já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }
);

// Atualizar produto
router.put('/:id',
  authenticateToken,
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('sale_price').isFloat({ min: 0 }).withMessage('Preço de venda inválido'),
  body('cost_price').isFloat({ min: 0 }).withMessage('Preço de custo inválido'),
  (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, barcode, category_id, cost_price, sale_price, stock, min_stock, description } = req.body;

    try {
      db.prepare(`
        UPDATE products 
        SET name = ?, barcode = ?, category_id = ?, cost_price = ?, sale_price = ?, 
            stock = ?, min_stock = ?, description = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(name, barcode || null, category_id || null, cost_price, sale_price, stock, min_stock, description || null, req.params.id);

      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
      res.json(product);
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Código de barras já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }
);

// Deletar produto (soft delete)
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    db.prepare('UPDATE products SET active = 0 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

export default router;
