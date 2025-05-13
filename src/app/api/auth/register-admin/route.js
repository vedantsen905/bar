import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  const { username, email, password, role } = await req.json();

  // Validate required fields
  if (!username || !email || !password || !role) {
    return NextResponse.json({ message: 'All fields (username, email, password, role) are required' }, { status: 400 });
  }

  // Connect to the database
  await connectDB();

  try {
    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Email is already registered' }, { status: 400 });
    }

    // If role is admin, check if there's already an admin
    if (role === 'admin') {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return NextResponse.json({ message: 'An admin already exists' }, { status: 400 });
      }
    }

    // Create a new user or admin
    const user = new User({ username, email, password, role });
    await user.save();

    return NextResponse.json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully` }, { status: 201 });
  } catch (error) {
    // Log the error for debugging
    console.error(error);

    // Send a generic error message to the client
    return NextResponse.json({ message: 'An error occurred while registering the user' }, { status: 500 });
  }
}
