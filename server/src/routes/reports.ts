import { Router } from 'express';
import db from '../database/init';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Dashboard - estatísticas gerais
router.get('/dashboard', authenticateToken, (req: AuthRequest, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Vendas de hoje
    const salesToday = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(final_total), 0) as total
      FROM sales 
      WHERE DATE(created_at) = DATE(?)
    `).get(today) as any;

    // Vendas do mês
    const salesMonth = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(final_total), 0) as total
      FROM sales 
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).get() as any;

    // Produtos com estoque baixo
    const lowStock = db.prepare(`
      SELECT COUNT(*) as count
      FROM products 
      WHERE stock <= min_stock AND active = 1
    `).get() as any;

    // Total de produtos ativos
    const totalProducts = db.prepare(`
      SELECT COUNT(*) as count
      FROM products 
      WHERE active = 1
    `).get() as any;

    // Produtos mais vendidos (últimos 30 dias)
    const topProducts = db.prepare(`
      SELECT 
        si.product_name,
        SUM(si.quantity) as total_quantity,
        SUM(si.subtotal) as total_revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE DATE(s.created_at) >= DATE('now', '-30 days')
      GROUP BY si.product_id, si.product_name
      ORDER BY total_quantity DESC
      LIMIT 5
    `).all();

    // Vendas por dia (últimos 7 dias)
    const salesByDay = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(final_total) as total
      FROM sales
      WHERE DATE(created_at) >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `).all();

    // Vendas por método de pagamento (últimos 30 dias)
    const salesByPayment = db.prepare(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(final_total) as total
      FROM sales
      WHERE DATE(created_at) >= DATE('now', '-30 days')
      GROUP BY payment_method
    `).all();

    res.json({
      today: {
        sales: salesToday.count,
        revenue: salesToday.total
      },
      month: {
        sales: salesMonth.count,
        revenue: salesMonth.total
      },
      products: {
        total: totalProducts.count,
        lowStock: lowStock.count
      },
      topProducts,
      salesByDay,
      salesByPayment
    });
  } catch (error) {
    console.error('Erro ao gerar dashboard:', error);
    res.status(500).json({ error: 'Erro ao gerar dashboard' });
  }
});

// Relatório de vendas por período
router.get('/sales', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Datas de início e fim são obrigatórias' });
    }

    const sales = db.prepare(`
      SELECT 
        DATE(s.created_at) as date,
        COUNT(*) as total_sales,
        SUM(s.final_total) as revenue,
        SUM(s.discount) as total_discount,
        AVG(s.final_total) as avg_sale
      FROM sales s
      WHERE DATE(s.created_at) BETWEEN DATE(?) AND DATE(?)
      GROUP BY DATE(s.created_at)
      ORDER BY date
    `).all(startDate, endDate);

    const summary = db.prepare(`
      SELECT 
        COUNT(*) as total_sales,
        SUM(final_total) as total_revenue,
        SUM(discount) as total_discount,
        AVG(final_total) as avg_sale,
        MIN(final_total) as min_sale,
        MAX(final_total) as max_sale
      FROM sales
      WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate);

    res.json({ sales, summary });
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// Relatório de produtos
router.get('/products', authenticateToken, (req: AuthRequest, res) => {
  try {
    const products = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        COALESCE(SUM(si.quantity), 0) as total_sold,
        COALESCE(SUM(si.subtotal), 0) as total_revenue
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sale_items si ON p.id = si.product_id
      WHERE p.active = 1
      GROUP BY p.id
      ORDER BY total_sold DESC
    `).all();

    res.json(products);
  } catch (error) {
    console.error('Erro ao gerar relatório de produtos:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

export default router;
