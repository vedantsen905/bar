import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return new NextResponse(JSON.stringify({ message: 'Authorization token required' }), { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return new NextResponse(JSON.stringify(decoded), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: 'Invalid or expired token' }), { status: 401 });
  }
}

export async function GET(req) {
  return new NextResponse(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
}
