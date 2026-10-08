import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './db';
import { authRouter } from './routes/auth';
import { accountsRouter } from './routes/accounts';
import { transactionsRouter } from './routes/transactions';
import { budgetsRouter } from './routes/budgets';
import { goalsRouter } from './routes/goals';
import { analyticsRouter } from './routes/analytics';


export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger with tagged output
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const tag = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`[SERVER:REQUEST] ${tag} [${req.method}] ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check routes
app.get('/health', (req, res) => res.json({ status: 'ok', db: 'mongodb', timestamp: new Date().toISOString() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'mongodb', timestamp: new Date().toISOString() }));

// Mount routes with and without /api prefix for seamless Vercel serverless and local dev routing
app.use('/auth', authRouter);
app.use('/api/auth', authRouter);

app.use('/accounts', accountsRouter);
app.use('/api/accounts', accountsRouter);

app.use('/transactions', transactionsRouter);
app.use('/api/transactions', transactionsRouter);

app.use('/budgets', budgetsRouter);
app.use('/api/budgets', budgetsRouter);

app.use('/goals', goalsRouter);
app.use('/api/goals', goalsRouter);

app.use('/analytics', analyticsRouter);
app.use('/api/analytics', analyticsRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[SERVER:ERROR] ❌ Unhandled server error:', {
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start standalone HTTP listener only when run locally (not in serverless environment)
if (!process.env.VERCEL) {
  (async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`🚀 FinTrack Backend Server running on http://localhost:${PORT}`);
        console.log(`📡 API Endpoints available at http://localhost:${PORT}/api`);
        console.log(`🗄️  Database: MongoDB Atlas`);
      });
    } catch (error: any) {
      console.error('[SERVER:STARTUP] ❌ Failed to start server:', error.message);
      process.exit(1);
    }
  })();
}

export default app;
