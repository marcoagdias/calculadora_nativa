import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/init';
import { body, validationResult } from 'express-validator';

const router = Router();

// Login
router.post('/login',
  body('username').notEmpty().withMessage('Username é obrigatório'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(username) as any;

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const validPassword = bcrypt.compareSync(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '8h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }
);

export default router;
