'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SalesSummary from '@/components/SalesSummary';

export default function AdminDashboard({ setIsLoggedIn }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.role === 'admin') {
          setIsAuthorized(true);
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false); // Update the parent state to reflect logout
    // router.push('/login'); // Redirect to the login page
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return <div>You are not authorized to access this page.</div>;
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold text-white">Admin Dashboard</h2>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700 transition duration-300"
        >
          Logout
        </button>
      </div>
      <div className="bg-gray-800 shadow-lg rounded-xl p-6 text-white">
        <SalesSummary />
      </div>
    </div>
  );
}