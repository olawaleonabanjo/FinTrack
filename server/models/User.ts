import mongoose, { Schema, Document } from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar?: string;
  currency: string;
  monthly_budget_limit: number;
  phone_number?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  country?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  bank_name?: string;
  account_holder_name?: string;
  account_number?: string;
  bank_code?: string;
  iban?: string;
  account_type?: string;
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
    phone_number: { type: String },
    date_of_birth: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    emergency_contact: { type: String },
    emergency_phone: { type: String },
    bank_name: { type: String },
    account_holder_name: { type: String },
    account_number: { type: String },
    bank_code: { type: String },
    iban: { type: String },
    account_type: { type: String },
    created_at: { type: String, required: true },
  },
  {
    _id: false, // We manage _id ourselves
    collection: 'users',
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
