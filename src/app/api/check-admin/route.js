// src/app/api/auth/checkAdmin/route.js

import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    const adminExists = await User.findOne({ role: 'admin' });

    return NextResponse.json({ adminExists: !!adminExists });
  } catch (error) {
    console.error('Error checking admin:', error);
    return NextResponse.json({ adminExists: false });
  }
}
