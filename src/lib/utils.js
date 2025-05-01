// lib/utils.js
import jwt from 'jsonwebtoken';

export async function verifyToken(token) {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Additional validation
    if (!decoded.userId || !decoded.role) {
      throw new Error('Invalid token payload');
    }

    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw new Error('Your session has expired. Please login again.');
  }
}