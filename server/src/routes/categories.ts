import { Router } from 'express';
import db from '../database/init';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Listar todas as categorias
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro ao listar categorias' });
  }
});

// Criar categoria
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  try {
    const result = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name, description || null);
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(category);
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Categoria já existe' });
    }
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

export default router;
