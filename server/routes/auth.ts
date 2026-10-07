import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { JWT_SECRET, requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const authRouter = Router();

// Map DB row to User frontend shape
function formatUser(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    currency: row.currency || 'USD',
    monthlyBudgetLimit: Number(row.monthly_budget_limit || 6500),
  };
}

// POST /api/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const userId = `usr_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, avatar, currency, monthly_budget_limit, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name.trim(), normalizedEmail, passwordHash, avatar, 'USD', 5000, now);

    // Provide helpful starter accounts and budgets for the new user
    const insertAccount = db.prepare(`
      INSERT INTO accounts (id, user_id, name, type, balance, account_number, institution, color, currency, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const mainAccountId = `acc_${Date.now()}_1`;
    insertAccount.run(mainAccountId, userId, 'Primary Checking', 'checking', 3500, '•••• 1010', 'Primary Bank', '#6366f1', 'USD', now);
    insertAccount.run(`acc_${Date.now()}_2`, userId, 'Savings Vault', 'savings', 8200, '•••• 2020', 'High Yield Reserve', '#10b981', 'USD', now);

    // Default budgets
    const insertBudget = db.prepare(`
      INSERT INTO budgets (id, user_id, category, target_amount, spent_amount, period, color, icon_name, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertBudget.run(`bdg_${Date.now()}_1`, userId, 'Housing', 1800, 0, 'monthly', '#6366f1', 'Home', now);
    insertBudget.run(`bdg_${Date.now()}_2`, userId, 'Food & Dining', 750, 0, 'monthly', '#f59e0b', 'Utensils', now);
    insertBudget.run(`bdg_${Date.now()}_3`, userId, 'Transportation', 350, 0, 'monthly', '#06b6d4', 'Car', now);
    insertBudget.run(`bdg_${Date.now()}_4`, userId, 'Entertainment', 300, 0, 'monthly', '#ec4899', 'Film', now);

    // Default goal
    db.prepare(`
      INSERT INTO goals (id, user_id, name, target_amount, current_amount, deadline, category, color, icon_name, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`gl_${Date.now()}_1`, userId, 'Emergency Reserve', 15000, 4200, '2026-12-31', 'Savings', '#10b981', 'ShieldCheck', 'Initial emergency safety cushion', now);

    // Issue JWT token
    const token = jwt.sign({ id: userId, email: normalizedEmail }, JWT_SECRET, { expiresIn: '7d' });

    const newUser = db.prepare('SELECT id, name, email, avatar, currency, monthly_budget_limit FROM users WHERE id = ?').get(userId);

    return res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: formatUser(newUser),
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error while registering user' });
  }
});

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as any;

    if (!userRow) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, userRow.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: userRow.id, email: userRow.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      message: 'Logged in successfully',
      token,
      user: formatUser(userRow),
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

// GET /api/auth/me (Protected route)
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    user: formatUser(req.user),
  });
});

// PUT /api/auth/profile (Protected route)
authRouter.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, currency, monthlyBudgetLimit, avatar } = req.body;

    const current = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!current) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedName = name ?? current.name;
    const updatedCurrency = currency ?? current.currency;
    const updatedLimit = monthlyBudgetLimit !== undefined ? Number(monthlyBudgetLimit) : current.monthly_budget_limit;
    const updatedAvatar = avatar ?? current.avatar;

    db.prepare(`
      UPDATE users
      SET name = ?, currency = ?, monthly_budget_limit = ?, avatar = ?
      WHERE id = ?
    `).run(updatedName, updatedCurrency, updatedLimit, updatedAvatar, userId);

    const updated = db.prepare('SELECT id, name, email, avatar, currency, monthly_budget_limit FROM users WHERE id = ?').get(userId);

    return res.json({
      message: 'Profile updated successfully',
      user: formatUser(updated),
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});
