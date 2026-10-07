import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';

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

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };

    const user = db
      .prepare('SELECT id, name, email, avatar, currency, monthly_budget_limit FROM users WHERE id = ?')
      .get(decoded.id) as AuthenticatedUser | undefined;

    if (!user) {
      return res.status(401).json({ error: 'User associated with token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}
