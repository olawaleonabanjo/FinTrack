import { Router, Response } from 'express';
import { db } from '../db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const transactionsRouter = Router();

transactionsRouter.use(requireAuth);

function formatTransaction(row: any) {
  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    date: row.date,
    accountId: row.account_id,
    accountName: row.account_name,
    status: row.status,
    merchant: row.merchant || undefined,
    notes: row.notes || undefined,
  };
}

// GET /api/transactions
transactionsRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { accountId, category, type, search } = req.query;

    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params: any[] = [userId];

    if (accountId && accountId !== 'all') {
      query += ' AND account_id = ?';
      params.push(accountId);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (type && type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      query += ' AND (title LIKE ? OR category LIKE ? OR merchant LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const rows = db.prepare(query).all(...params);
    return res.json(rows.map(formatTransaction));
  } catch (err: any) {
    console.error('Error fetching transactions:', err);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/transactions
transactionsRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      title,
      amount,
      type,
      category,
      date,
      accountId,
      accountName,
      status = 'completed',
      merchant,
      notes,
    } = req.body;

    if (!title || amount === undefined || !type || !category || !date || !accountId) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }

    const numAmount = Math.abs(Number(amount));
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Verify account exists
    const account = db
      .prepare('SELECT id, name, balance FROM accounts WHERE id = ? AND user_id = ?')
      .get(accountId, userId) as any;

    if (!account) {
      return res.status(404).json({ error: 'Selected account not found' });
    }

    const finalAccountName = accountName || account.name;
    const id = `tx_${Date.now()}`;
    const now = new Date().toISOString();

    // 1. Insert Transaction
    db.prepare(`
      INSERT INTO transactions (id, user_id, account_id, account_name, title, amount, type, category, date, status, merchant, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      accountId,
      finalAccountName,
      title.trim(),
      numAmount,
      type,
      category,
      date,
      status,
      merchant ? merchant.trim() : null,
      notes ? notes.trim() : null,
      now
    );

    // 2. Automatically update Account Balance
    let balanceDelta = 0;
    if (type === 'income') balanceDelta = numAmount;
    else if (type === 'expense') balanceDelta = -numAmount;

    if (balanceDelta !== 0) {
      db.prepare(`
        UPDATE accounts
        SET balance = balance + ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `).run(balanceDelta, now, accountId, userId);
    }

    // 3. Automatically update Budget Spent Amount for Expense
    if (type === 'expense') {
      db.prepare(`
        UPDATE budgets
        SET spent_amount = spent_amount + ?
        WHERE user_id = ? AND category = ?
      `).run(numAmount, userId, category);
    }

    const created = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    return res.status(201).json(formatTransaction(created));
  } catch (err: any) {
    console.error('Error creating transaction:', err);
    return res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// DELETE /api/transactions/:id
transactionsRouter.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const tx = db
      .prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
      .get(id, userId) as any;

    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const now = new Date().toISOString();
    const amount = Number(tx.amount);

    // Revert account balance
    let revertDelta = 0;
    if (tx.type === 'income') revertDelta = -amount;
    else if (tx.type === 'expense') revertDelta = +amount;

    if (revertDelta !== 0) {
      db.prepare(`
        UPDATE accounts
        SET balance = balance + ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `).run(revertDelta, now, tx.account_id, userId);
    }

    // Revert budget spent amount if expense
    if (tx.type === 'expense') {
      db.prepare(`
        UPDATE budgets
        SET spent_amount = MAX(0, spent_amount - ?)
        WHERE user_id = ? AND category = ?
      `).run(amount, userId, tx.category);
    }

    // Delete transaction row
    db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, userId);

    return res.json({ message: 'Transaction deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting transaction:', err);
    return res.status(500).json({ error: 'Failed to delete transaction' });
  }
});
