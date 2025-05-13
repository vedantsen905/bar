import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { connectDB } from '@/lib/db';
import User from '@/models/User';

async function createUser({ username, email, password, role }) {
  await connectDB();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    email,
    password,
    role,
  });

  const userObj = newUser.toObject();
  delete userObj.password;

  return userObj;
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ message: 'Unauthorized: No token provided' }), {
        status: 401,
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return new Response(JSON.stringify({ message: 'Forbidden: Only admins can create users' }), {
        status: 403,
      });
    }

    const body = await request.json();
    const { username, email, password, role } = body;

    if (!username || !email || !password || !role) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
      });
    }

    const newUser = await createUser({ username, email, password, role });

    return new Response(
      JSON.stringify({ message: 'User created successfully', user: newUser }),
      { status: 201 }
    );
  } catch (err) {
    console.error(err);

    let status = 500;
    let message = 'Internal Server Error';

    if (err.message === 'User already exists') {
      status = 400;
      message = 'User with this email already exists';
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      status = 401;
      message = 'Invalid or expired token';
    }

    return new Response(JSON.stringify({ message }), { status });
  }
}
