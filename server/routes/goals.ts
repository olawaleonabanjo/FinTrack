import { Router, Response } from 'express';
import { db } from '../db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const goalsRouter = Router();

goalsRouter.use(requireAuth);

function formatGoal(row: any) {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    deadline: row.deadline,
    category: row.category,
    color: row.color,
    iconName: row.icon_name,
    notes: row.notes || undefined,
  };
}

// GET /api/goals
goalsRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const rows = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    return res.json(rows.map(formatGoal));
  } catch (err: any) {
    console.error('Error fetching goals:', err);
    return res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// POST /api/goals
goalsRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
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
      return res.status(400).json({ error: 'Missing required goal fields' });
    }

    const id = `gl_${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO goals (id, user_id, name, target_amount, current_amount, deadline, category, color, icon_name, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      name.trim(),
      Number(targetAmount),
      Number(currentAmount),
      deadline,
      category,
      color,
      iconName,
      notes ? notes.trim() : null,
      now
    );

    const created = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    return res.status(201).json(formatGoal(created));
  } catch (err: any) {
    console.error('Error creating goal:', err);
    return res.status(500).json({ error: 'Failed to create goal' });
  }
});

// POST /api/goals/:id/deposit
goalsRouter.post('/:id/deposit', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const { amount, accountId } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Deposit amount must be a positive number' });
    }

    const goal = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Optional: deduct from linked account if accountId is passed
    if (accountId) {
      const account = db.prepare('SELECT balance FROM accounts WHERE id = ? AND user_id = ?').get(String(accountId), userId) as any;
      if (account) {
        db.prepare('UPDATE accounts SET balance = balance - ?, updated_at = ? WHERE id = ? AND user_id = ?')
          .run(numAmount, new Date().toISOString(), String(accountId), userId);
      }
    }

    const newCurrent = Math.min(goal.target_amount, goal.current_amount + numAmount);
    db.prepare('UPDATE goals SET current_amount = ? WHERE id = ? AND user_id = ?').run(newCurrent, id, userId);

    const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    return res.json(formatGoal(updated));
  } catch (err: any) {
    console.error('Error adding goal deposit:', err);
    return res.status(500).json({ error: 'Failed to update goal deposit' });
  }
});

// PUT /api/goals/:id
goalsRouter.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const { name, targetAmount, deadline, category, color, iconName, notes } = req.body;

    const goal = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const updatedName = name ?? goal.name;
    const updatedTarget = targetAmount !== undefined ? Number(targetAmount) : goal.target_amount;
    const updatedDeadline = deadline ?? goal.deadline;
    const updatedCategory = category ?? goal.category;
    const updatedColor = color ?? goal.color;
    const updatedIcon = iconName ?? goal.icon_name;
    const updatedNotes = notes !== undefined ? notes : goal.notes;

    db.prepare(`
      UPDATE goals
      SET name = ?, target_amount = ?, deadline = ?, category = ?, color = ?, icon_name = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `).run(updatedName, updatedTarget, updatedDeadline, updatedCategory, updatedColor, updatedIcon, updatedNotes, id, userId);

    const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    return res.json(formatGoal(updated));
  } catch (err: any) {
    console.error('Error updating goal:', err);
    return res.status(500).json({ error: 'Failed to update goal' });
  }
});

// DELETE /api/goals/:id
goalsRouter.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const goal = db.prepare('SELECT id FROM goals WHERE id = ? AND user_id = ?').get(id, userId);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(id, userId);
    return res.json({ message: 'Goal deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting goal:', err);
    return res.status(500).json({ error: 'Failed to delete goal' });
  }
});
