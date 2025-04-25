// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.json({ message: 'Logout successful' });

  response.headers.set(
    'Set-Cookie',
    'auth_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict;'
  );

  return response;
}
