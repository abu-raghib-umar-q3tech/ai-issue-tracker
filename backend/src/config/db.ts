import mongoose from 'mongoose';
import { env } from './env.js';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('MongoDB connected');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown MongoDB connection error';

    console.error('MongoDB connection failed:', message);

    if (message.includes('ECONNREFUSED')) {
      console.error(
        `MongoDB is not running or not reachable at ${env.mongoUri}. ` +
          'Start a MongoDB server locally or update MONGO_URI in backend/.env to a valid MongoDB Atlas URI.'
      );
    }

    process.exit(1);
  }
};

export { connectDB };
