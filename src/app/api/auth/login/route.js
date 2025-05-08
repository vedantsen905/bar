// src/app/api/auth/login/route.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export async function POST(req) {
  await connectDB();

  try {
    const { username, password } = await req.json();  // ✅ we expect username + password

    if (!username || !password) {
      return new Response(JSON.stringify({ message: 'Username and password are required' }), { status: 400 });
    }

    const user = await User.findOne({ username });   // ✅ search by username
    if (!user) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },  // ✅ store username + role inside token
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Return only username + role (no password, no email)
    const responseUser = {
      username: user.username,
      role: user.role
    };

    return new Response(JSON.stringify({ token, user: responseUser }), { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
