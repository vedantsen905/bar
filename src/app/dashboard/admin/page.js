'use client';
import Link from 'next/link';
import SalesSummary from '@/components/SalesSummary';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    // Verify the token by decoding it
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
          router.push('/login'); // Redirect to login if unauthorized
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading state while checking auth
  }

  if (!isAuthorized) {
    return <div>You are not authorized to access this page.</div>;
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold text-white">Admin Dashboard</h2>
        <nav className="space-x-6">
          <Link href="/dashboard/admin" className="text-blue-500 hover:text-blue-700 transition duration-300">
            Dashboard
          </Link>
          <Link href="/dashboard/user" className="text-blue-500 hover:text-blue-700 transition duration-300">
            User View
          </Link>
        </nav>
      </div>

      <div className="bg-gray-800 shadow-lg rounded-xl p-6 text-white">
        <SalesSummary />
      </div>
    </div>
  );
}
