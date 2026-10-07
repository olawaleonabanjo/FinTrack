import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db';
import { authRouter } from './routes/auth';
import { accountsRouter } from './routes/accounts';
import { transactionsRouter } from './routes/transactions';
import { budgetsRouter } from './routes/budgets';
import { goalsRouter } from './routes/goals';
import { analyticsRouter } from './routes/analytics';

dotenv.config();

// Initialize Database & Seed data if necessary
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/analytics', analyticsRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 FinTrack Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints available at http://localhost:${PORT}/api`);
});
