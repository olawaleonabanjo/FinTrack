import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'finance.db');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys for performance and integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  // Create Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      currency TEXT DEFAULT 'USD',
      monthly_budget_limit REAL DEFAULT 6500,
      created_at TEXT NOT NULL
    );
  `);

  // Create Accounts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance REAL NOT NULL,
      account_number TEXT NOT NULL,
      institution TEXT NOT NULL,
      color TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create Budgets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      target_amount REAL NOT NULL,
      spent_amount REAL NOT NULL DEFAULT 0,
      period TEXT NOT NULL DEFAULT 'monthly',
      color TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create Goals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL DEFAULT 0,
      deadline TEXT NOT NULL,
      category TEXT NOT NULL,
      color TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      account_name TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      merchant TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );
  `);

  // Seed default demo user if not present
  seedDemoUser();
}

function seedDemoUser() {
  const checkUser = db.prepare('SELECT id FROM users WHERE email = ?').get('alex.morgan@fintrack.app') as { id: string } | undefined;

  if (checkUser) {
    return; // Already seeded
  }

  console.log('Seeding initial demo user: alex.morgan@fintrack.app...');
  const demoUserId = 'usr_alex_morgan';
  const hashedPassword = bcrypt.hashSync('password123', 10);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, avatar, currency, monthly_budget_limit, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    demoUserId,
    'Alex Morgan',
    'alex.morgan@fintrack.app',
    hashedPassword,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    'USD',
    6500,
    now
  );

  // Accounts
  const insertAccount = db.prepare(`
    INSERT INTO accounts (id, user_id, name, type, balance, account_number, institution, color, currency, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAccount.run('acc_1', demoUserId, 'Primary Checking', 'checking', 12450.80, '•••• 4821', 'Chase Bank', '#6366f1', 'USD', now);
  insertAccount.run('acc_2', demoUserId, 'High-Yield Savings', 'savings', 45890.50, '•••• 8912', 'Marcus Goldman Sachs', '#10b981', 'USD', now);
  insertAccount.run('acc_3', demoUserId, 'Sapphire Reserve Credit', 'credit', -2150.40, '•••• 3094', 'Chase Bank', '#f43f5e', 'USD', now);
  insertAccount.run('acc_4', demoUserId, 'Vanguard Index Portfolio', 'investment', 78400.00, '•••• 7710', 'Vanguard', '#06b6d4', 'USD', now);

  // Budgets
  const insertBudget = db.prepare(`
    INSERT INTO budgets (id, user_id, category, target_amount, spent_amount, period, color, icon_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBudget.run('bdg_1', demoUserId, 'Housing', 2200, 2200, 'monthly', '#6366f1', 'Home', now);
  insertBudget.run('bdg_2', demoUserId, 'Food & Dining', 900, 645.20, 'monthly', '#f59e0b', 'Utensils', now);
  insertBudget.run('bdg_3', demoUserId, 'Shopping', 600, 520.00, 'monthly', '#a855f7', 'ShoppingBag', now);
  insertBudget.run('bdg_4', demoUserId, 'Transportation', 450, 310.80, 'monthly', '#06b6d4', 'Car', now);
  insertBudget.run('bdg_5', demoUserId, 'Entertainment', 350, 280.50, 'monthly', '#ec4899', 'Film', now);
  insertBudget.run('bdg_6', demoUserId, 'Utilities', 300, 240.00, 'monthly', '#64748b', 'Zap', now);

  // Goals
  const insertGoal = db.prepare(`
    INSERT INTO goals (id, user_id, name, target_amount, current_amount, deadline, category, color, icon_name, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertGoal.run('gl_1', demoUserId, 'Emergency Reserve (6 Months)', 30000, 24500, '2026-12-31', 'Savings', '#10b981', 'ShieldCheck', 'Goal to cover 6 months of living expenses in HYSA.', now);
  insertGoal.run('gl_2', demoUserId, 'Japan Autumn Trip', 6500, 4800, '2026-10-15', 'Travel', '#14b8a6', 'Plane', 'Flight, Ryokan stays, and culinary tour.', now);
  insertGoal.run('gl_3', demoUserId, 'Tesla Model Y Down Payment', 15000, 8900, '2027-03-30', 'Vehicle', '#06b6d4', 'Car', 'Targeting 20% down payment.', now);
  insertGoal.run('gl_4', demoUserId, 'Tech Stack & Setup Refresh', 3500, 3500, '2026-08-30', 'Gadgets', '#6366f1', 'Laptop', 'Completed M3 Max MacBook & Dual 4K monitors!', now);

  // Transactions
  const insertTx = db.prepare(`
    INSERT INTO transactions (id, user_id, account_id, account_name, title, amount, type, category, date, status, merchant, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTx.run('tx_1', demoUserId, 'acc_1', 'Primary Checking', 'Senior Software Tech Corp Salary', 8500.00, 'income', 'Salary', '2026-09-28', 'completed', 'Acme Corp', 'Bi-weekly payroll direct deposit', now);
  insertTx.run('tx_2', demoUserId, 'acc_1', 'Primary Checking', 'Luxury Apartment Rent', 2200.00, 'expense', 'Housing', '2026-09-27', 'completed', 'Skyline Properties', 'October rent payment', now);
  insertTx.run('tx_3', demoUserId, 'acc_3', 'Sapphire Reserve Credit', 'Whole Foods Organic Groceries', 184.20, 'expense', 'Food & Dining', '2026-09-26', 'completed', 'Whole Foods', 'Weekly grocery haul', now);
  insertTx.run('tx_4', demoUserId, 'acc_1', 'Primary Checking', 'Freelance React Consultation', 1750.00, 'income', 'Freelance', '2026-09-25', 'completed', 'Venture Labs LLC', 'Dashboard architecture advisory sprint', now);
  insertTx.run('tx_5', demoUserId, 'acc_3', 'Sapphire Reserve Credit', 'Apple Store Silicon Valley', 429.00, 'expense', 'Shopping', '2026-09-24', 'completed', 'Apple Inc', 'Magic Keyboard & USB-C hub', now);
  insertTx.run('tx_6', demoUserId, 'acc_3', 'Sapphire Reserve Credit', 'Uber Technologies Ride', 38.50, 'expense', 'Transportation', '2026-09-23', 'completed', 'Uber', 'Ride to SFO airport', now);
  insertTx.run('tx_7', demoUserId, 'acc_1', 'Primary Checking', 'Cloud Hosting & OpenAI Subscription', 62.00, 'expense', 'Subscriptions', '2026-09-22', 'completed', 'Vercel / OpenAI', 'Monthly API usage & Pro tiers', now);
  insertTx.run('tx_8', demoUserId, 'acc_3', 'Sapphire Reserve Credit', 'Michelin Star Bistro Dinner', 215.00, 'expense', 'Food & Dining', '2026-09-20', 'completed', 'Atelier Crenn', 'Anniversary celebration', now);
  insertTx.run('tx_9', demoUserId, 'acc_1', 'Primary Checking', 'High-Yield Monthly Savings Interest', 142.30, 'income', 'Investments', '2026-09-18', 'completed', 'Marcus Goldman Sachs', '5.1% APY compounded monthly yield', now);
  insertTx.run('tx_10', demoUserId, 'acc_3', 'Sapphire Reserve Credit', 'Pacific Gas & Electric Utility', 145.00, 'expense', 'Utilities', '2026-09-15', 'completed', 'PG&E', 'Electricity & Gas bill', now);

  console.log('Demo user and initial financial data seeded successfully!');
}
