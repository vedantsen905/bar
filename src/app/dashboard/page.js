'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // If no token is found, redirect to login page
      router.push('/login');
      return;
    }

    try {
      // Decode token to extract role information
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Check role and redirect to appropriate dashboard
      if (payload.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (payload.role === 'user') {
        router.push('/dashboard/user');
      } else {
        // If role is unknown or invalid, log out
        localStorage.removeItem('token');
        router.push('/login');
      }
    } catch (error) {
      // Handle case where the token is invalid or can't be decoded
      console.error('Invalid token', error);
      localStorage.removeItem('token');
      router.push('/login');
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    // Remove the token from localStorage to log out
    localStorage.removeItem('token');
    
    // Redirect to login page
    router.push('/login');
  };

  // Wait for loading to finish and token to be checked
  if (loading) {
    return <p>Loading...</p>;  // Show a loading message while checking token
  }

  return null;  // Return null as it will already have redirected if not authenticated
}
