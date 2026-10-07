import { Router, Response } from 'express';
import { db } from '../db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const budgetsRouter = Router();

budgetsRouter.use(requireAuth);

function formatBudget(row: any, currentSpent?: number) {
  return {
    id: row.id,
    category: row.category,
    targetAmount: Number(row.target_amount),
    spentAmount: currentSpent !== undefined ? currentSpent : Number(row.spent_amount),
    period: row.period || 'monthly',
    color: row.color || '#6366f1',
    iconName: row.icon_name || 'Tag',
  };
}

// GET /api/budgets
budgetsRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const rows = db.prepare('SELECT * FROM budgets WHERE user_id = ?').all(userId) as any[];

    // Calculate current month's actual spent amount from transactions for each budget category
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const spentQuery = db.prepare(`
      SELECT category, SUM(amount) as total_spent
      FROM transactions
      WHERE user_id = ? AND type = 'expense' AND date LIKE ?
      GROUP BY category
    `);

    const spentMap: Record<string, number> = {};
    const spentResults = spentQuery.all(userId, `${currentMonthPrefix}%`) as any[];
    spentResults.forEach((s) => {
      spentMap[s.category] = Number(s.total_spent || 0);
    });

    const budgets = rows.map((b) => {
      const calculatedSpent = spentMap[b.category] !== undefined ? spentMap[b.category] : Number(b.spent_amount || 0);
      return formatBudget(b, calculatedSpent);
    });

    return res.json(budgets);
  } catch (err: any) {
    console.error('Error fetching budgets:', err);
    return res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// POST /api/budgets
budgetsRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { category, targetAmount, period = 'monthly', color = '#6366f1', iconName = 'Tag' } = req.body;

    if (!category || targetAmount === undefined) {
      return res.status(400).json({ error: 'Category and target amount are required' });
    }

    const numTarget = Math.abs(Number(targetAmount));
    if (isNaN(numTarget) || numTarget <= 0) {
      return res.status(400).json({ error: 'Target amount must be a positive number' });
    }

    // Check if category already has a budget
    const existing = db
      .prepare('SELECT id FROM budgets WHERE user_id = ? AND category = ?')
      .get(userId, category.trim());

    if (existing) {
      return res.status(400).json({ error: `A budget envelope for ${category} already exists.` });
    }

    const id = `bdg_${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO budgets (id, user_id, category, target_amount, spent_amount, period, color, icon_name, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, category.trim(), numTarget, 0, period, color, iconName, now);

    const created = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    return res.status(201).json(formatBudget(created));
  } catch (err: any) {
    console.error('Error creating budget:', err);
    return res.status(500).json({ error: 'Failed to create budget' });
  }
});

// PUT /api/budgets/:id
budgetsRouter.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const { targetAmount, period, color, iconName } = req.body;

    const existing = db
      .prepare('SELECT * FROM budgets WHERE id = ? AND user_id = ?')
      .get(id, userId) as any;

    if (!existing) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const updatedTarget = targetAmount !== undefined ? Number(targetAmount) : existing.target_amount;
    const updatedPeriod = period ?? existing.period;
    const updatedColor = color ?? existing.color;
    const updatedIcon = iconName ?? existing.icon_name;

    db.prepare(`
      UPDATE budgets
      SET target_amount = ?, period = ?, color = ?, icon_name = ?
      WHERE id = ? AND user_id = ?
    `).run(updatedTarget, updatedPeriod, updatedColor, updatedIcon, id, userId);

    const updated = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    return res.json(formatBudget(updated));
  } catch (err: any) {
    console.error('Error updating budget:', err);
    return res.status(500).json({ error: 'Failed to update budget' });
  }
});

// DELETE /api/budgets/:id
budgetsRouter.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const existing = db.prepare('SELECT id FROM budgets WHERE id = ? AND user_id = ?').get(id, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    db.prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?').run(id, userId);
    return res.json({ message: 'Budget deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting budget:', err);
    return res.status(500).json({ error: 'Failed to delete budget' });
  }
});
