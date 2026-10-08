import { Router, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { Account } from '../models/Account';
import { Budget } from '../models/Budget';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const transactionsRouter = Router();

transactionsRouter.use(requireAuth);

function formatTransaction(doc: any) {
  return {
    id: doc._id,
    title: doc.title,
    amount: Number(doc.amount),
    type: doc.type,
    category: doc.category,
    date: doc.date,
    accountId: doc.account_id,
    accountName: doc.account_name,
    status: doc.status,
    merchant: doc.merchant || undefined,
    notes: doc.notes || undefined,
  };
}

// GET /api/transactions
transactionsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { accountId, category, type, search } = req.query;

    const filter: any = { user_id: userId };

    if (accountId && accountId !== 'all') {
      filter.account_id = accountId;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (type && type !== 'all') {
      filter.type = type;
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { category: regex },
        { merchant: regex },
      ];
    }

    const docs = await Transaction.find(filter).sort({ date: -1, created_at: -1 }).lean();

    console.log('[TRANSACTIONS:GET] ✅ Fetched transactions.', { userId, count: docs.length });
    return res.json(docs.map(formatTransaction));
  } catch (err: any) {
    console.error('[TRANSACTIONS:GET] ❌ Failed to fetch transactions.', {
      userId: req.user?.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/transactions
transactionsRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
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
      console.warn('[TRANSACTIONS:POST] ⚠️ Missing required fields.', { title, type, category, date, accountId });
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }

    const numAmount = Math.abs(Number(amount));
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Verify account exists
    const account = await Account.findOne({ _id: accountId, user_id: userId }).lean();
    if (!account) {
      console.warn('[TRANSACTIONS:POST] ⚠️ Account not found.', { userId, accountId });
      return res.status(404).json({ error: 'Selected account not found' });
    }

    const finalAccountName = accountName || account.name;
    const id = `tx_${Date.now()}`;
    const now = new Date().toISOString();

    // 1. Insert Transaction
    const created = await Transaction.create({
      _id: id,
      user_id: userId,
      account_id: accountId,
      account_name: finalAccountName,
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      date,
      status,
      merchant: merchant ? merchant.trim() : null,
      notes: notes ? notes.trim() : null,
      created_at: now,
    });

    // 2. Automatically update Account Balance
    let balanceDelta = 0;
    if (type === 'income') balanceDelta = numAmount;
    else if (type === 'expense') balanceDelta = -numAmount;

    if (balanceDelta !== 0) {
      await Account.updateOne(
        { _id: accountId, user_id: userId },
        { $inc: { balance: balanceDelta }, $set: { updated_at: now } }
      );
    }

    // 3. Automatically update Budget Spent Amount for Expense
    if (type === 'expense') {
      await Budget.updateOne(
        { user_id: userId, category },
        { $inc: { spent_amount: numAmount } }
      );
    }

    console.log('[TRANSACTIONS:POST] ✅ Transaction created.', { userId, txId: id, type, amount: numAmount, category });
    return res.status(201).json(formatTransaction(created));
  } catch (err: any) {
    console.error('[TRANSACTIONS:POST] ❌ Failed to create transaction.', {
      userId: req.user?.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// DELETE /api/transactions/:id
transactionsRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const tx = await Transaction.findOne({ _id: id, user_id: userId }).lean();
    if (!tx) {
      console.warn('[TRANSACTIONS:DELETE] ⚠️ Transaction not found.', { userId, txId: id });
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const now = new Date().toISOString();
    const amount = Number(tx.amount);

    // Revert account balance
    let revertDelta = 0;
    if (tx.type === 'income') revertDelta = -amount;
    else if (tx.type === 'expense') revertDelta = +amount;

    if (revertDelta !== 0) {
      await Account.updateOne(
        { _id: tx.account_id, user_id: userId },
        { $inc: { balance: revertDelta }, $set: { updated_at: now } }
      );
    }

    // Revert budget spent amount if expense
    if (tx.type === 'expense') {
      const budget = await Budget.findOne({ user_id: userId, category: tx.category });
      if (budget) {
        const newSpent = Math.max(0, budget.spent_amount - amount);
        await Budget.updateOne(
          { _id: budget._id },
          { $set: { spent_amount: newSpent } }
        );
      }
    }

    // Delete transaction
    await Transaction.deleteOne({ _id: id, user_id: userId });

    console.log('[TRANSACTIONS:DELETE] ✅ Transaction deleted & balances reverted.', { userId, txId: id });
    return res.json({ message: 'Transaction deleted successfully' });
  } catch (err: any) {
    console.error('[TRANSACTIONS:DELETE] ❌ Failed to delete transaction.', {
      userId: req.user?.id,
      txId: req.params.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to delete transaction' });
  }
});
