// src/app/api/auth/login/route.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import { markUserActive } from '@/app/api/admin/users/[id]/route'; // Import from your user route

export async function POST(req) {
  await connectDB();

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ message: 'Username and password are required' }), 
        { status: 400 }
      );
    }

    // Find user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'Invalid credentials' }), 
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ message: 'Invalid credentials' }), 
        { status: 401 }
      );
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return new Response(
      JSON.stringify({ 
        token, 
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      }), 
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ message: 'Internal Server Error' }), 
      { status: 500 }
    );
  }
} 