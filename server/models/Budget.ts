import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  _id: string;
  user_id: string;
  category: string;
  target_amount: number;
  spent_amount: number;
  period: string;
  color: string;
  icon_name: string;
  created_at: string;
}

const BudgetSchema = new Schema<IBudget>(
  {
    _id: { type: String, required: true },
    user_id: { type: String, required: true, index: true },
    category: { type: String, required: true, trim: true },
    target_amount: { type: Number, required: true },
    spent_amount: { type: Number, default: 0 },
    period: { type: String, default: 'monthly' },
    color: { type: String, required: true },
    icon_name: { type: String, required: true },
    created_at: { type: String, required: true },
  },
  {
    _id: false,
    collection: 'budgets',
  }
);

export const Budget = mongoose.model<IBudget>('Budget', BudgetSchema);
