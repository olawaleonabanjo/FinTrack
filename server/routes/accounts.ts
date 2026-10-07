import { Router, Response } from 'express';
import { db } from '../db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const accountsRouter = Router();

accountsRouter.use(requireAuth);

function formatAccount(row: any) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    balance: Number(row.balance),
    accountNumber: row.account_number,
    institution: row.institution,
    color: row.color,
    currency: row.currency,
    updatedAt: row.updated_at,
  };
}

// GET /api/accounts
accountsRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const rows = db
      .prepare('SELECT * FROM accounts WHERE user_id = ? ORDER BY balance DESC')
      .all(userId);

    const accounts = rows.map(formatAccount);
    return res.json(accounts);
  } catch (err: any) {
    console.error('Error fetching accounts:', err);
    return res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// POST /api/accounts
accountsRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, type, balance, accountNumber, institution, color, currency } = req.body;

    if (!name || !type || balance === undefined || !accountNumber || !institution) {
      return res.status(400).json({ error: 'Missing required account fields' });
    }

    const id = `acc_${Date.now()}`;
    const now = new Date().toISOString();
    const finalColor = color || (type === 'checking' ? '#6366f1' : type === 'savings' ? '#10b981' : type === 'credit' ? '#f43f5e' : '#06b6d4');
    const finalCurrency = currency || req.user!.currency || 'USD';

    db.prepare(`
      INSERT INTO accounts (id, user_id, name, type, balance, account_number, institution, color, currency, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      name.trim(),
      type,
      Number(balance),
      accountNumber.trim(),
      institution.trim(),
      finalColor,
      finalCurrency,
      now
    );

    const created = db.prepare('SELECT * FROM accounts WHERE id = ?').get(id);
    return res.status(201).json(formatAccount(created));
  } catch (err: any) {
    console.error('Error creating account:', err);
    return res.status(500).json({ error: 'Failed to create account' });
  }
});

// DELETE /api/accounts/:id
accountsRouter.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const account = db.prepare('SELECT id FROM accounts WHERE id = ? AND user_id = ?').get(id, userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    db.prepare('DELETE FROM accounts WHERE id = ? AND user_id = ?').run(id, userId);
    return res.json({ message: 'Account deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting account:', err);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});
