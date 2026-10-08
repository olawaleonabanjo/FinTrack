import mongoose, { Schema, Document } from 'mongoose';

export interface IAccount extends Document {
  _id: string;
  user_id: string;
  name: string;
  type: string;
  balance: number;
  account_number: string;
  institution: string;
  color: string;
  currency: string;
  updated_at: string;
}

const AccountSchema = new Schema<IAccount>(
  {
    _id: { type: String, required: true },
    user_id: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    balance: { type: Number, required: true },
    account_number: { type: String, required: true },
    institution: { type: String, required: true },
    color: { type: String, required: true },
    currency: { type: String, default: 'USD' },
    updated_at: { type: String, required: true },
  },
  {
    _id: false,
    collection: 'accounts',
  }
);

export const Account = mongoose.model<IAccount>('Account', AccountSchema);
