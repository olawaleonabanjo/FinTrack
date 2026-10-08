import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { Budget } from '../models/Budget';
import { Goal } from '../models/Goal';
import { JWT_SECRET, requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const authRouter = Router();

// Map DB document to User frontend shape
function formatUser(doc: any) {
  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    avatar: doc.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    currency: doc.currency || 'USD',
    monthlyBudgetLimit: Number(doc.monthly_budget_limit || 6500),
  };
}

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.warn('[AUTH:REGISTER] ⚠️ Missing required fields.', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      console.warn('[AUTH:REGISTER] ⚠️ Duplicate email attempt.', { email: normalizedEmail });
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const userId = `usr_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    await User.create({
      _id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      avatar,
      currency: 'USD',
      monthly_budget_limit: 5000,
      created_at: now,
    });

    // Provide helpful starter accounts for the new user
    const mainAccountId = `acc_${Date.now()}_1`;
    await Account.insertMany([
      {
        _id: mainAccountId,
        user_id: userId,
        name: 'Primary Checking',
        type: 'checking',
        balance: 3500,
        account_number: '•••• 1010',
        institution: 'Primary Bank',
        color: '#6366f1',
        currency: 'USD',
        updated_at: now,
      },
      {
        _id: `acc_${Date.now()}_2`,
        user_id: userId,
        name: 'Savings Vault',
        type: 'savings',
        balance: 8200,
        account_number: '•••• 2020',
        institution: 'High Yield Reserve',
        color: '#10b981',
        currency: 'USD',
        updated_at: now,
      },
    ]);

    // Default budgets
    await Budget.insertMany([
      { _id: `bdg_${Date.now()}_1`, user_id: userId, category: 'Housing', target_amount: 1800, spent_amount: 0, period: 'monthly', color: '#6366f1', icon_name: 'Home', created_at: now },
      { _id: `bdg_${Date.now()}_2`, user_id: userId, category: 'Food & Dining', target_amount: 750, spent_amount: 0, period: 'monthly', color: '#f59e0b', icon_name: 'Utensils', created_at: now },
      { _id: `bdg_${Date.now()}_3`, user_id: userId, category: 'Transportation', target_amount: 350, spent_amount: 0, period: 'monthly', color: '#06b6d4', icon_name: 'Car', created_at: now },
      { _id: `bdg_${Date.now()}_4`, user_id: userId, category: 'Entertainment', target_amount: 300, spent_amount: 0, period: 'monthly', color: '#ec4899', icon_name: 'Film', created_at: now },
    ]);

    // Default goal
    await Goal.create({
      _id: `gl_${Date.now()}_1`,
      user_id: userId,
      name: 'Emergency Reserve',
      target_amount: 15000,
      current_amount: 4200,
      deadline: '2026-12-31',
      category: 'Savings',
      color: '#10b981',
      icon_name: 'ShieldCheck',
      notes: 'Initial emergency safety cushion',
      created_at: now,
    });

    // Issue JWT token
    const token = jwt.sign({ id: userId, email: normalizedEmail }, JWT_SECRET, { expiresIn: '7d' });

    const newUser = await User.findById(userId).select('_id name email avatar currency monthly_budget_limit').lean();

    console.log('[AUTH:REGISTER] ✅ New user registered successfully.', { userId, email: normalizedEmail });

    return res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: formatUser(newUser),
    });
  } catch (error: any) {
    console.error('[AUTH:REGISTER] ❌ Registration failed.', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return res.status(500).json({ error: 'Internal server error while registering user' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.warn('[AUTH:LOGIN] ⚠️ Missing email or password.');
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userDoc = await User.findOne({ email: normalizedEmail }).lean();

    if (!userDoc) {
      console.warn('[AUTH:LOGIN] ⚠️ No account found for email.', { email: normalizedEmail });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, userDoc.password_hash);
    if (!isMatch) {
      console.warn('[AUTH:LOGIN] ⚠️ Incorrect password attempt.', { email: normalizedEmail });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: userDoc._id, email: userDoc.email }, JWT_SECRET, { expiresIn: '7d' });

    console.log('[AUTH:LOGIN] ✅ User logged in.', { userId: userDoc._id });

    return res.json({
      message: 'Logged in successfully',
      token,
      user: formatUser(userDoc),
    });
  } catch (error: any) {
    console.error('[AUTH:LOGIN] ❌ Login failed.', {
      message: error.message,
      stack: error.stack,
    });
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
authRouter.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, currency, monthlyBudgetLimit, avatar } = req.body;

    const current = await User.findById(userId).lean();
    if (!current) {
      console.warn('[AUTH:PROFILE] ⚠️ User not found for profile update.', { userId });
      return res.status(404).json({ error: 'User not found' });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (currency !== undefined) updates.currency = currency;
    if (monthlyBudgetLimit !== undefined) updates.monthly_budget_limit = Number(monthlyBudgetLimit);
    if (avatar !== undefined) updates.avatar = avatar;

    await User.updateOne({ _id: userId }, { $set: updates });

    const updated = await User.findById(userId).select('_id name email avatar currency monthly_budget_limit').lean();

    console.log('[AUTH:PROFILE] ✅ Profile updated.', { userId });

    return res.json({
      message: 'Profile updated successfully',
      user: formatUser(updated),
    });
  } catch (error: any) {
    console.error('[AUTH:PROFILE] ❌ Profile update failed.', {
      userId: req.user?.id,
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});
