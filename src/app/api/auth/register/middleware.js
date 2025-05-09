import { NextResponse } from 'next/server';

export async function middleware(request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: '/api/auth/register',
};