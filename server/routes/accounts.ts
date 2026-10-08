import { Router, Response } from 'express';
import { Account } from '../models/Account';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const accountsRouter = Router();

accountsRouter.use(requireAuth);

function formatAccount(doc: any) {
  return {
    id: doc._id,
    name: doc.name,
    type: doc.type,
    balance: Number(doc.balance),
    accountNumber: doc.account_number,
    institution: doc.institution,
    color: doc.color,
    currency: doc.currency,
    updatedAt: doc.updated_at,
  };
}

// GET /api/accounts
accountsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const docs = await Account.find({ user_id: userId }).sort({ balance: -1 }).lean();

    console.log('[ACCOUNTS:GET] ✅ Fetched accounts.', { userId, count: docs.length });
    return res.json(docs.map(formatAccount));
  } catch (err: any) {
    console.error('[ACCOUNTS:GET] ❌ Failed to fetch accounts.', {
      userId: req.user?.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// POST /api/accounts
accountsRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, type, balance, accountNumber, institution, color, currency } = req.body;

    if (!name || !type || balance === undefined || !accountNumber || !institution) {
      console.warn('[ACCOUNTS:POST] ⚠️ Missing required fields.', { name, type, balance, accountNumber, institution });
      return res.status(400).json({ error: 'Missing required account fields' });
    }

    const id = `acc_${Date.now()}`;
    const now = new Date().toISOString();
    const finalColor = color || (type === 'checking' ? '#6366f1' : type === 'savings' ? '#10b981' : type === 'credit' ? '#f43f5e' : '#06b6d4');
    const finalCurrency = currency || req.user!.currency || 'USD';

    const created = await Account.create({
      _id: id,
      user_id: userId,
      name: name.trim(),
      type,
      balance: Number(balance),
      account_number: accountNumber.trim(),
      institution: institution.trim(),
      color: finalColor,
      currency: finalCurrency,
      updated_at: now,
    });

    console.log('[ACCOUNTS:POST] ✅ Account created.', { userId, accountId: id });
    return res.status(201).json(formatAccount(created));
  } catch (err: any) {
    console.error('[ACCOUNTS:POST] ❌ Failed to create account.', {
      userId: req.user?.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to create account' });
  }
});

// DELETE /api/accounts/:id
accountsRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const result = await Account.deleteOne({ _id: id, user_id: userId });

    if (result.deletedCount === 0) {
      console.warn('[ACCOUNTS:DELETE] ⚠️ Account not found.', { userId, accountId: id });
      return res.status(404).json({ error: 'Account not found' });
    }

    console.log('[ACCOUNTS:DELETE] ✅ Account deleted.', { userId, accountId: id });
    return res.json({ message: 'Account deleted successfully' });
  } catch (err: any) {
    console.error('[ACCOUNTS:DELETE] ❌ Failed to delete account.', {
      userId: req.user?.id,
      accountId: req.params.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});
