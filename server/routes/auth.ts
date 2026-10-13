import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Account } from '../models/Account.js';
import { Budget } from '../models/Budget.js';
import { Goal } from '../models/Goal.js';
import { JWT_SECRET, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

// Map DB document to User frontend shape
function formatUser(row: any) {
  return {
    id: row._id || row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    currency: row.currency || 'NGN',
    monthlyBudgetLimit: Number(row.monthly_budget_limit || 6500),
    phoneNumber: row.phone_number || '',
    dateOfBirth: row.date_of_birth || '',
    address: row.address || '',
    city: row.city || '',
    country: row.country || '',
    emergencyContact: row.emergency_contact || '',
    emergencyPhone: row.emergency_phone || '',
    bankName: row.bank_name || '',
    accountHolderName: row.account_holder_name || '',
    accountNumber: row.account_number || '',
    bankCode: row.bank_code || '',
    iban: row.iban || '',
    accountType: row.account_type || '',
  };
}

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
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
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
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
      currency: 'NGN',
      monthly_budget_limit: 5000,
      created_at: now,
    });

    // Provide helpful starter accounts and budgets for the new user
    const mainAccountId = `acc_${Date.now()}_1`;
    await Account.insertMany([
      { _id: mainAccountId, user_id: userId, name: 'Primary Checking', type: 'checking', balance: 3500, account_number: '•••• 1010', institution: 'Primary Bank', color: '#6366f1', currency: 'NGN', updated_at: now },
      { _id: `acc_${Date.now()}_2`, user_id: userId, name: 'Savings Vault', type: 'savings', balance: 8200, account_number: '•••• 2020', institution: 'High Yield Reserve', color: '#10b981', currency: 'NGN', updated_at: now },
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
      _id: `gl_${Date.now()}_1`, user_id: userId, name: 'Emergency Reserve', target_amount: 15000, current_amount: 4200, deadline: '2026-12-31', category: 'Savings', color: '#10b981', icon_name: 'ShieldCheck', notes: 'Initial emergency safety cushion', created_at: now,
    });

    // Issue JWT token
    const token = jwt.sign({ id: userId, email: normalizedEmail }, JWT_SECRET, { expiresIn: '7d' });

    const newUser = await User.findById(userId).select('_id name email avatar currency monthly_budget_limit').lean();

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
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userRow = await User.findOne({ email: normalizedEmail }).lean();

    if (!userRow) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, userRow.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: userRow._id, email: userRow.email }, JWT_SECRET, { expiresIn: '7d' });

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
authRouter.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      currency,
      monthlyBudgetLimit,
      avatar,
      phoneNumber,
      dateOfBirth,
      address,
      city,
      country,
      emergencyContact,
      emergencyPhone,
      bankName,
      accountHolderName,
      accountNumber,
      bankCode,
      iban,
      accountType,
    } = req.body;

    const current = await User.findById(userId).lean();
    if (!current) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (currency !== undefined) updates.currency = currency;
    if (monthlyBudgetLimit !== undefined) updates.monthly_budget_limit = Number(monthlyBudgetLimit);
    if (avatar !== undefined) updates.avatar = avatar;
    if (phoneNumber !== undefined) updates.phone_number = phoneNumber;
    if (dateOfBirth !== undefined) updates.date_of_birth = dateOfBirth;
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    if (country !== undefined) updates.country = country;
    if (emergencyContact !== undefined) updates.emergency_contact = emergencyContact;
    if (emergencyPhone !== undefined) updates.emergency_phone = emergencyPhone;
    if (bankName !== undefined) updates.bank_name = bankName;
    if (accountHolderName !== undefined) updates.account_holder_name = accountHolderName;
    if (accountNumber !== undefined) updates.account_number = accountNumber;
    if (bankCode !== undefined) updates.bank_code = bankCode;
    if (iban !== undefined) updates.iban = iban;
    if (accountType !== undefined) updates.account_type = accountType;

    await User.updateOne({ _id: userId }, { $set: updates });

    const updated = await User.findById(userId).select('_id name email avatar currency monthly_budget_limit phone_number date_of_birth address city country emergency_contact emergency_phone bank_name account_holder_name account_number bank_code iban account_type').lean();

    return res.json({
      message: 'Profile updated successfully',
      user: formatUser(updated),
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});
