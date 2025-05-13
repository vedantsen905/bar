import jwt from 'jsonwebtoken';
import User from "@/models/User";
import { connectDB } from "@/lib/db";

const verifyAdminToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Debug decoded token
    console.log('Decoded token:', decoded);

    // Flexible field resolution
    const userId = decoded.id || decoded._id || decoded.userId;
    const userRole = decoded.role || decoded.userRole;

    if (!userId) {
      throw new Error('User identification missing in token');
    }

    return {
      id: userId,
      role: userRole || 'user'
    };
  } catch (err) {
    console.error('Token verification failed:', err.message);
    throw err;
  }
};

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header:', authHeader);

    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Authorization header must be Bearer token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { id, role } = verifyAdminToken(token);

    if (role !== 'admin') {
      return Response.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    await connectDB();

    // Verify user still exists and is admin
    const currentUser = await User.findById(id);
    if (!currentUser || currentUser.role !== 'admin') {
      return Response.json({ error: 'User no longer has admin privileges' }, { status: 403 });
    }

    // Pagination and search logic
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';

    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const [totalUsers, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query).select('-password').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean()
    ]);

    return Response.json({
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page
    });

  } catch (err) {
    console.error('[Admin Users] Error:', err);

    if (err instanceof jwt.JsonWebTokenError) {
      return Response.json({ error: 'Invalid token', code: 'TOKEN_INVALID' }, { status: 401 });
    }

    if (err.message.includes('User identification missing')) {
      return Response.json({ error: 'Token missing required fields', code: 'TOKEN_MALFORMED' }, { status: 401 });
    }

    return Response.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
