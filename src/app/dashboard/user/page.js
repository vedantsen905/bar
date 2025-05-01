'use client';
import Link from 'next/link';
import ProductForm from '@/components/ProductForm';
import InventoryForm from '@/components/InventoryForm';
import InventoryTable from '@/components/InventoryTable';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function UserDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // New state for success message
  const router = useRouter();

  const refreshInventory = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    setShowSuccessMessage(true); // Show success message when inventory is refreshed
    setTimeout(() => setShowSuccessMessage(false), 3000); // Hide message after 3 seconds
  }, []);

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
        if (data?.role === 'user') {
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Dashboard</h2>
        <nav className="space-x-4">
          <Link href="/dashboard/user" className="text-blue-600 hover:underline">
            Dashboard
          </Link>
          <Link href="/dashboard/admin" className="text-blue-600 hover:underline">
            Admin View
          </Link>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ProductForm />
        <InventoryForm onSubmitSuccess={refreshInventory} />
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-500 text-white py-2 px-4 rounded-lg mb-4">
          Inventory log submitted successfully!
        </div>
      )}

      <div className="bg-gray-700 shadow-md rounded-xl p-4">
        <InventoryTable refreshKey={refreshKey} />
      </div>
    </div>
  );
}
