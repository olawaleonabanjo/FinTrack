import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const JWT_SECRET = process.env.JWT_SECRET || 'fintrack_super_secret_jwt_key_2026';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  monthly_budget_limit: number;
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
      .select('_id name email avatar currency monthly_budget_limit')
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
