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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [products, setProducts] = useState([]);
  const router = useRouter();

  const refreshInventory = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();  // The response should now be an object containing "products"
      console.log('Fetched products:', data);  // Verify the structure of the response
      setProducts(data.products);  // Access the products inside the returned object
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    }
  };
  

  const handleProductSaved = () => {
    fetchProducts(); // Refresh product list on new product save
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.role === 'user') {
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

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!isAuthorized) return <div className="p-6 text-red-600">You are not authorized to access this page.</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
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

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-500 text-white py-2 px-4 rounded-lg text-center">
          ✅ Inventory log submitted successfully!
        </div>
      )}

      {/* Forms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
          <ProductForm onProductSaved={handleProductSaved} />
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
          <InventoryForm products={products} onSubmitSuccess={refreshInventory} />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-4">
        <InventoryTable refreshKey={refreshKey} />
      </div>
    </div>
  );
}
