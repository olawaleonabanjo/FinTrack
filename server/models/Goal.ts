import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
  _id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
  color: string;
  icon_name: string;
  notes?: string;
  created_at: string;
}

const GoalSchema = new Schema<IGoal>(
  {
    _id: { type: String, required: true },
    user_id: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    target_amount: { type: Number, required: true },
    current_amount: { type: Number, default: 0 },
    deadline: { type: String, required: true },
    category: { type: String, required: true },
    color: { type: String, required: true },
    icon_name: { type: String, required: true },
    notes: { type: String },
    created_at: { type: String, required: true },
  },
  {
    _id: false,
    collection: 'goals',
  }
);

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);
