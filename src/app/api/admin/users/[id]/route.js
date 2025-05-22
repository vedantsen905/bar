  import { connectDB } from '@/lib/db';
  import User from '@/models/User';
  import { isValidObjectId } from 'mongoose';
  import { NextResponse } from 'next/server';
  import bcrypt from 'bcryptjs';

  // Track active users (in-memory, consider Redis for production)
  let activeUsers = new Set();

  // Helper function to validate password
  const validatePassword = (password) => {
    if (password && password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (password && !/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (password && !/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (password && !/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  // Helper functions to manage active users
  export function markUserActive(userId) {
    if (!activeUsers) activeUsers = new Set();
    activeUsers.add(userId.toString());
  }

  export function markUserInactive(userId) {
    if (activeUsers) {
      activeUsers.delete(userId.toString());
    }
  }

  export function getActiveUsers() {
    return Array.from(activeUsers || []);
  }

  // GET - Get user details (including active status)
  export async function GET(request, { params }) {
    try {
      const { id } = params;
      
      if (!isValidObjectId(id)) {
        return NextResponse.json(
          { error: 'Invalid user ID format' },
          { status: 400 }
        );
      }

      await connectDB();

      const user = await User.findById(id).select('-password');
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Add active status to response
      const userWithStatus = {
        ...user.toObject(),
        isActive: activeUsers.has(id.toString())
      };

      return NextResponse.json(userWithStatus, { status: 200 });

    } catch (error) {
      console.error('[ADMIN_USER_GET_ERROR]', error);
      return NextResponse.json(
        { 
          error: 'Internal Server Error',
          message: error.message 
        },
        { status: 500 }
      );
    }
  }

  // PUT - Update user email and/or password
  // PUT - Update user password and email
  export async function PUT(request, { params }) {
    try {
      const { id } = params;
      
      if (!isValidObjectId(id)) {
        return NextResponse.json(
          { error: 'Invalid user ID format' },
          { status: 400 }
        );
      }

      await connectDB();

      const { username, email, role, newPassword } = await request.json();

      // Prepare update data
      const updateData = { 
        username,
        email,
        role
      };

      // Only update password if provided
      if (newPassword) {
        updateData.password = await bcrypt.hash(newPassword, 10);
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: 'User updated successfully',
        user: updatedUser
      }, { status: 200 });

    } catch (error) {
      console.error('[USER_UPDATE_ERROR]', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }
  // DELETE - Delete user
  export async function DELETE(request, { params }) {
    try {
      const { id } = params;
      
      if (!isValidObjectId(id)) {
        return NextResponse.json(
          { error: 'Invalid user ID format' },
          { status: 400 }
        );
      }

      await connectDB();

      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      markUserInactive(id);

      return NextResponse.json(
        { message: 'User deleted successfully' },
        { status: 200 }
      );

    } catch (error) {
      console.error('[ADMIN_USER_DELETE_ERROR]', error);
      return NextResponse.json(
        { 
          error: 'Internal Server Error',
          message: error.message 
        },
        { status: 500 }
      );
    }
  }