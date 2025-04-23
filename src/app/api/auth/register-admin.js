import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  const { username, email, password } = await req.json();

  // Connect to the database
  await connectDB()

  try {
    // Create admin user
    const user = new User({ username, email, password, role: 'admin' });
    await user.save();

    return NextResponse.json({ message: 'Admin registered successfully' }, { status: 201 });
  } catch (error) {
    // If error occurs (e.g., only one admin allowed)
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
