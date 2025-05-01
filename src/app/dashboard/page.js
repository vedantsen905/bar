'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // If no token is found, redirect to login page
      router.push('/login');
      return;
    }

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

    setIsAuthenticated(true);
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

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        {/* You can customize this content as needed */}
        <h1 className="text-2xl mb-4">Welcome to the Dashboard!</h1>
        
      </div>
    );
  }

  return null;  // Return nothing if the user is not authenticated and it's still loading
}