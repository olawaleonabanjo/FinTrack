import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  _id: string;
  user_id: string;
  account_id: string;
  account_name: string;
  title: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  status: string;
  merchant?: string;
  notes?: string;
  created_at: string;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    _id: { type: String, required: true },
    user_id: { type: String, required: true, index: true },
    account_id: { type: String, required: true },
    account_name: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true }, // 'income' | 'expense'
    category: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, default: 'completed' },
    merchant: { type: String },
    notes: { type: String },
    created_at: { type: String, required: true },
  },
  {
    _id: false,
    collection: 'transactions',
  }
);

// Compound index for user + date queries
TransactionSchema.index({ user_id: 1, date: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
