
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
      router.push('/login');
      return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/user');
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
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      {isAuthenticated && (
        <>
          <h1 className="text-2xl mb-4">Welcome to the Dashboard!</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 shadow-lg"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}
