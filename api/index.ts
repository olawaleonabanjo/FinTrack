import { connectDB } from '../server/db.js';
import app from '../server/index.js';

let isDBConnected = false;

export default async function handler(req: any, res: any) {
  try {
    if (!isDBConnected) {
      await connectDB();
      isDBConnected = true;
    }
    return app(req, res);
  } catch (error: any) {
    console.error('[SERVERLESS:HANDLER] ❌ Failed to handle request.', {
      method: req.method,
      url: req.url,
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Server initialization failed' });
  }
}
