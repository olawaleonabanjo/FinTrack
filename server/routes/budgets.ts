import { Router, Response } from 'express';
import { Budget } from '../models/Budget';
import { Transaction } from '../models/Transaction';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const budgetsRouter = Router();

budgetsRouter.use(requireAuth);

function formatBudget(doc: any, currentSpent?: number) {
  return {
    id: doc._id,
    category: doc.category,
    targetAmount: Number(doc.target_amount),
    spentAmount: currentSpent !== undefined ? currentSpent : Number(doc.spent_amount),
    period: doc.period || 'monthly',
    color: doc.color || '#6366f1',
    iconName: doc.icon_name || 'Tag',
  };
}

// GET /api/budgets
budgetsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const docs = await Budget.find({ user_id: userId }).lean();

    // Calculate current month's actual spent amount from transactions
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const spentAggregation = await Transaction.aggregate([
      {
        $match: {
          user_id: userId,
          type: 'expense',
          date: { $regex: `^${currentMonthPrefix}` },
        },
      },
      {
        $group: {
          _id: '$category',
          total_spent: { $sum: '$amount' },
        },
      },
    ]);

    const spentMap: Record<string, number> = {};
    spentAggregation.forEach((s: any) => {
      spentMap[s._id] = Number(s.total_spent || 0);
    });

    const budgets = docs.map((b: any) => {
      const calculatedSpent = spentMap[b.category] !== undefined ? spentMap[b.category] : Number(b.spent_amount || 0);
      return formatBudget(b, calculatedSpent);
    });

    console.log('[BUDGETS:GET] ✅ Fetched budgets.', { userId, count: budgets.length });
    return res.json(budgets);
  } catch (err: any) {
    console.error('[BUDGETS:GET] ❌ Failed to fetch budgets.', {
      userId: req.user?.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// POST /api/budgets
budgetsRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { category, targetAmount, period = 'monthly', color = '#6366f1', iconName = 'Tag' } = req.body;

    if (!category || targetAmount === undefined) {
      console.warn('[BUDGETS:POST] ⚠️ Missing required fields.', { category, targetAmount });
      return res.status(400).json({ error: 'Category and target amount are required' });
    }

    const numTarget = Math.abs(Number(targetAmount));
    if (isNaN(numTarget) || numTarget <= 0) {
      return res.status(400).json({ error: 'Target amount must be a positive number' });
    }

    // Check if category already has a budget
    const existing = await Budget.findOne({ user_id: userId, category: category.trim() }).lean();
    if (existing) {
      console.warn('[BUDGETS:POST] ⚠️ Duplicate budget category.', { userId, category });
      return res.status(400).json({ error: `A budget envelope for ${category} already exists.` });
    }

    const id = `bdg_${Date.now()}`;
    const now = new Date().toISOString();

    const created = await Budget.create({
      _id: id,
      user_id: userId,
      category: category.trim(),
      target_amount: numTarget,
      spent_amount: 0,
      period,
      color,
      icon_name: iconName,
      created_at: now,
    });

    console.log('[BUDGETS:POST] ✅ Budget created.', { userId, budgetId: id, category });
    return res.status(201).json(formatBudget(created));
  } catch (err: any) {
    console.error('[BUDGETS:POST] ❌ Failed to create budget.', {
      userId: req.user?.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to create budget' });
  }
});

// PUT /api/budgets/:id
budgetsRouter.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const { targetAmount, period, color, iconName } = req.body;

    const existing = await Budget.findOne({ _id: id, user_id: userId }).lean();
    if (!existing) {
      console.warn('[BUDGETS:PUT] ⚠️ Budget not found.', { userId, budgetId: id });
      return res.status(404).json({ error: 'Budget not found' });
    }

    const updates: any = {};
    if (targetAmount !== undefined) updates.target_amount = Number(targetAmount);
    if (period !== undefined) updates.period = period;
    if (color !== undefined) updates.color = color;
    if (iconName !== undefined) updates.icon_name = iconName;

    await Budget.updateOne({ _id: id, user_id: userId }, { $set: updates });
    const updated = await Budget.findById(id).lean();

    console.log('[BUDGETS:PUT] ✅ Budget updated.', { userId, budgetId: id });
    return res.json(formatBudget(updated));
  } catch (err: any) {
    console.error('[BUDGETS:PUT] ❌ Failed to update budget.', {
      userId: req.user?.id,
      budgetId: req.params.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to update budget' });
  }
});

// DELETE /api/budgets/:id
budgetsRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const result = await Budget.deleteOne({ _id: id, user_id: userId });
    if (result.deletedCount === 0) {
      console.warn('[BUDGETS:DELETE] ⚠️ Budget not found.', { userId, budgetId: id });
      return res.status(404).json({ error: 'Budget not found' });
    }

    console.log('[BUDGETS:DELETE] ✅ Budget deleted.', { userId, budgetId: id });
    return res.json({ message: 'Budget deleted successfully' });
  } catch (err: any) {
    console.error('[BUDGETS:DELETE] ❌ Failed to delete budget.', {
      userId: req.user?.id,
      budgetId: req.params.id,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Failed to delete budget' });
  }
});
