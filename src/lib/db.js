  import mongoose from 'mongoose';
  import User from '@/models/User';

  // Connection state tracking
  let isConnected = false;

  export const connectDB = async () => {
    if (isConnected) {
      console.log('Using existing database connection');
      return;
    }

    if (!process.env.MONGODB_URL) {
      throw new Error('MONGODB_URL environment variable not defined');
    }

    try {
      console.log('Establishing new database connection...');
      
      const conn = await mongoose.connect(process.env.MONGODB_URL, {
        serverSelectionTimeoutMS: 5000, // 5 seconds timeout for initial connection
        socketTimeoutMS: 45000, // 45 seconds timeout for queries
      });

      isConnected = conn.connections[0].readyState === 1;
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error('Database connection failed:', error.message);
      throw new Error('Database connection error');
    }
  };

  // Enhanced user operations with error handling
  export const getUserByEmail = async (email) => {
    try {
      await connectDB();
      return await User.findOne({ email }).select('+password').lean();
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new Error('Database operation failed');
    }
  };

  export const createUser = async (userData) => {
    try {
      await connectDB();
      const user = await User.create(userData);
      return user.toObject();
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Handle duplicate key errors specifically
      if (error.code === 11000) {
        throw new Error('User already exists');
      }
      
      throw new Error('Failed to create user');
    }
  };

  // Add connection event listeners
  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
    isConnected = false;
  });