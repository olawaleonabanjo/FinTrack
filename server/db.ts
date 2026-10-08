import mongoose from 'mongoose';

// Connection state tracking
let isConnected = false;

/**
 * Connect to MongoDB Atlas. Reuses existing connection if already connected
 * (important for serverless environments like Vercel where the process may persist).
 */
export async function connectDB(): Promise<void> {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('[DATABASE:INIT] ✅ Reusing existing MongoDB connection.');
    return;
  }

  // Read MONGODB_URI here (after dotenv.config() has been called)
  const MONGODB_URI = process.env.MONGODB_URI || '';

  if (!MONGODB_URI) {
    console.error('[DATABASE:INIT] ❌ MONGODB_URI environment variable is not set!');
    console.error('[DATABASE:INIT] Add MONGODB_URI to your .env file or Vercel environment variables.');
    process.exit(1);
  }

  try {
    console.log('[DATABASE:INIT] 🔌 Connecting to MongoDB Atlas...');

    await mongoose.connect(MONGODB_URI, {
      dbName: 'fintrack',
      // Recommended production options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('[DATABASE:INIT] ✅ Successfully connected to MongoDB Atlas (database: fintrack)');
  } catch (error: any) {
    isConnected = false;
    console.error('[DATABASE:INIT] ❌ Failed to connect to MongoDB Atlas.');
    console.error(`[DATABASE:INIT] Error: ${error.message}`);
    if (error.code) {
      console.error(`[DATABASE:INIT] Error Code: ${error.code}`);
    }
    console.error('[DATABASE:INIT] Stack:', error.stack);
    throw error;
  }
}

// Handle connection events for logging
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[DATABASE:EVENT] ⚠️ MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('[DATABASE:EVENT] ❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[DATABASE:EVENT] ✅ MongoDB reconnected.');
});

export default mongoose;
