import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database/init';

// Rotas
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import salesRoutes from './routes/sales';
import categoriesRoutes from './routes/categories';
import reportsRoutes from './routes/reports';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializar banco de dados
initDatabase();

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/reports', reportsRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Mix Papelaria funcionando!' });
});

// Tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em: http://localhost:${PORT}/api`);
  console.log(`\n✨ Mix Papelaria e Presentes - Sistema de Gestão\n`);
});
