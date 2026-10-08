import { Router, Response } from 'express';
import { Goal } from '../models/Goal';
import { Account } from '../models/Account';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const goalsRouter = Router();

goalsRouter.use(requireAuth);

function formatGoal(doc: any) {
  return {
    id: doc._id,
    name: doc.name,
    targetAmount: Number(doc.target_amount),
    currentAmount: Number(doc.current_amount),
    deadline: doc.deadline,
    category: doc.category,
    color: doc.color,
    iconName: doc.icon_name,
    notes: doc.notes || undefined,
  };
}

// GET /api/goals
goalsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const docs = await Goal.find({ user_id: userId }).sort({ created_at: -1 }).lean();

    console.log('[GOALS:GET] ✅ Fetched goals.', { userId, count: docs.length });
    return res.json(docs.map(formatGoal));
  } catch (err: any) {
    console.error('[GOALS:GET] ❌ Failed to fetch goals.', {
      userId: req.user?.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// POST /api/goals
goalsRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      targetAmount,
      currentAmount = 0,
      deadline,
      category,
      color = '#10b981',
      iconName = 'Target',
      notes,
    } = req.body;

    if (!name || targetAmount === undefined || !deadline || !category) {
      console.warn('[GOALS:POST] ⚠️ Missing required fields.', { name, targetAmount, deadline, category });
      return res.status(400).json({ error: 'Missing required goal fields' });
    }

    const id = `gl_${Date.now()}`;
    const now = new Date().toISOString();

    const created = await Goal.create({
      _id: id,
      user_id: userId,
      name: name.trim(),
      target_amount: Number(targetAmount),
      current_amount: Number(currentAmount),
      deadline,
      category,
      color,
      icon_name: iconName,
      notes: notes ? notes.trim() : null,
      created_at: now,
    });

    console.log('[GOALS:POST] ✅ Goal created.', { userId, goalId: id, name });
    return res.status(201).json(formatGoal(created));
  } catch (err: any) {
    console.error('[GOALS:POST] ❌ Failed to create goal.', {
      userId: req.user?.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to create goal' });
  }
});

// POST /api/goals/:id/deposit
goalsRouter.post('/:id/deposit', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const { amount, accountId } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Deposit amount must be a positive number' });
    }

    const goal = await Goal.findOne({ _id: id, user_id: userId }).lean();
    if (!goal) {
      console.warn('[GOALS:DEPOSIT] ⚠️ Goal not found.', { userId, goalId: id });
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Optional: deduct from linked account if accountId is passed
    if (accountId) {
      const account = await Account.findOne({ _id: String(accountId), user_id: userId });
      if (account) {
        await Account.updateOne(
          { _id: String(accountId), user_id: userId },
          { $inc: { balance: -numAmount }, $set: { updated_at: new Date().toISOString() } }
        );
        console.log('[GOALS:DEPOSIT] 💳 Deducted from account.', { accountId, amount: numAmount });
      }
    }

    const newCurrent = Math.min(goal.target_amount, goal.current_amount + numAmount);
    await Goal.updateOne({ _id: id, user_id: userId }, { $set: { current_amount: newCurrent } });

    const updated = await Goal.findById(id).lean();

    console.log('[GOALS:DEPOSIT] ✅ Deposit added.', { userId, goalId: id, deposited: numAmount, newCurrent });
    return res.json(formatGoal(updated));
  } catch (err: any) {
    console.error('[GOALS:DEPOSIT] ❌ Failed to add deposit.', {
      userId: req.user?.id,
      goalId: req.params.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to update goal deposit' });
  }
});

// PUT /api/goals/:id
goalsRouter.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const { name, targetAmount, deadline, category, color, iconName, notes } = req.body;

    const goal = await Goal.findOne({ _id: id, user_id: userId }).lean();
    if (!goal) {
      console.warn('[GOALS:PUT] ⚠️ Goal not found.', { userId, goalId: id });
      return res.status(404).json({ error: 'Goal not found' });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (targetAmount !== undefined) updates.target_amount = Number(targetAmount);
    if (deadline !== undefined) updates.deadline = deadline;
    if (category !== undefined) updates.category = category;
    if (color !== undefined) updates.color = color;
    if (iconName !== undefined) updates.icon_name = iconName;
    if (notes !== undefined) updates.notes = notes;

    await Goal.updateOne({ _id: id, user_id: userId }, { $set: updates });
    const updated = await Goal.findById(id).lean();

    console.log('[GOALS:PUT] ✅ Goal updated.', { userId, goalId: id });
    return res.json(formatGoal(updated));
  } catch (err: any) {
    console.error('[GOALS:PUT] ❌ Failed to update goal.', {
      userId: req.user?.id,
      goalId: req.params.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to update goal' });
  }
});

// DELETE /api/goals/:id
goalsRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const result = await Goal.deleteOne({ _id: id, user_id: userId });
    if (result.deletedCount === 0) {
      console.warn('[GOALS:DELETE] ⚠️ Goal not found.', { userId, goalId: id });
      return res.status(404).json({ error: 'Goal not found' });
    }

    console.log('[GOALS:DELETE] ✅ Goal deleted.', { userId, goalId: id });
    return res.json({ message: 'Goal deleted successfully' });
  } catch (err: any) {
    console.error('[GOALS:DELETE] ❌ Failed to delete goal.', {
      userId: req.user?.id,
      goalId: req.params.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to delete goal' });
  }
});
