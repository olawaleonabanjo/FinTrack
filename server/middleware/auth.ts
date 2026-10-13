import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const DEV_FALLBACK_JWT_SECRET = 'fintrack-dev-jwt-secret-change-me-in-vercel';

export const JWT_SECRET = process.env.JWT_SECRET || DEV_FALLBACK_JWT_SECRET;

if (!process.env.JWT_SECRET) {
  console.warn('[AUTH:CONFIG] ⚠️ JWT_SECRET is not set. Using local fallback secret. Set JWT_SECRET in Vercel for production.');
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
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
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('[AUTH:MIDDLEWARE] ⚠️ Missing or malformed Authorization header.', {
      path: req.originalUrl,
      method: req.method,
    });
    return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };

    const user = await User.findById(decoded.id)
      .select('_id name email avatar currency monthly_budget_limit phone_number date_of_birth address city country emergency_contact emergency_phone bank_name account_holder_name account_number bank_code iban account_type')
      .lean();

    if (!user) {
      console.warn('[AUTH:MIDDLEWARE] ⚠️ Token valid but user no longer exists.', {
        userId: decoded.id,
        email: decoded.email,
      });
      return res.status(401).json({ error: 'User associated with token no longer exists.' });
    }

    req.user = {
      id: user._id as string,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      currency: user.currency,
      monthly_budget_limit: user.monthly_budget_limit,
      phone_number: user.phone_number,
      date_of_birth: user.date_of_birth,
      address: user.address,
      city: user.city,
      country: user.country,
      emergency_contact: user.emergency_contact,
      emergency_phone: user.emergency_phone,
      bank_name: user.bank_name,
      account_holder_name: user.account_holder_name,
      account_number: user.account_number,
      bank_code: user.bank_code,
      iban: user.iban,
      account_type: user.account_type,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      console.warn('[AUTH:MIDDLEWARE] ⚠️ Token expired.', { path: req.originalUrl });
    } else if (err.name === 'JsonWebTokenError') {
      console.warn('[AUTH:MIDDLEWARE] ⚠️ Invalid token signature.', { path: req.originalUrl });
    } else {
      console.error('[AUTH:MIDDLEWARE] ❌ Unexpected token verification error:', err.message);
    }
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}
