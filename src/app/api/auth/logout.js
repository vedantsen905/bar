export default function handler(req, res) {
    if (req.method === 'POST') {
      // Clear the JWT token from the client side (handled in frontend)
      res.status(200).json({ message: 'Logged out successfully' });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  }
  