import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar?: string;
  currency: string;
  monthly_budget_limit: number;
  created_at: string;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    avatar: { type: String },
    currency: { type: String, default: 'USD' },
    monthly_budget_limit: { type: Number, default: 6500 },
    created_at: { type: String, required: true },
  },
  {
    _id: false, // We manage _id ourselves
    collection: 'users',
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
