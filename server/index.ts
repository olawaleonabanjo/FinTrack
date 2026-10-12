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
const PORT = Number(process.env.PORT) || 5000;
const isLocal = !process.env.VERCEL;

// Middleware
app.use(cors({
  origin: isLocal ? true : [/\.vercel\.app$/, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true,
}));
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

// Start standalone HTTP listener only in local development.
// On Vercel, the platform provides the host and executes this app automatically.
if (isLocal) {
  (async () => {
    try {
      await connectDB();
      app.listen(PORT, '0.0.0.0', () => {
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
