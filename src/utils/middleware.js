import jwt from 'jsonwebtoken';

export const authenticate = (handler, requiredRole = 'user') => async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user to the request object

    // Ensure the user has the correct role
    if (req.user.role !== requiredRole && requiredRole !== 'user') {
      return res.status(403).json({ message: 'Forbidden: You do not have access to this resource' });
    }

    return handler(req, res); // Proceed to the actual API route handler
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
