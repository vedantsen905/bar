// lib/utils.js
import jwt from 'jsonwebtoken';

export const verifyAdminToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Use 'username' for identification if 'userId' is not present
    const userId = decoded.username || decoded.id || decoded._id; 
    const userRole = decoded.role || decoded.userRole;

    // Check if userId is missing
    if (!userId) {
      throw new Error('User identification missing in token');
    }

    return {
      id: userId,  // Now using 'username' or the available identifier
      role: userRole || 'user',  // Default to 'user' if no role is found
    };
  } catch (err) {
    console.error('Token verification failed:', err.message);
    throw err;  // Rethrow the error for the calling function to handle
  }
};
