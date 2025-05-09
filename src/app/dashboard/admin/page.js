'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSun, FiMoon, FiLogOut, FiUserPlus, FiUsers, FiActivity } from 'react-icons/fi';
import SalesSummary from '@/components/SalesSummary'; // Placeholder for actual component
import UserCreationModal from '@/components/UserCreationModal'; // Placeholder for actual component
export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Check authentication status on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        if (data?.role === 'admin') {
          setIsAuthorized(true);
        } else {
          handleLogout(); // Automatically logout if not admin
        }
      } catch (error) {
        handleLogout(); // Logout on any error
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  // Theme handling
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Reliable logout function
  const handleLogout = () => {
    // 1. Clear all auth-related items
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // 2. Clear any other sensitive data if needed
    // localStorage.removeItem('userData');
    
    // 3. Force a hard redirect to ensure complete cleanup
    window.location.href = '/login'; // Or your home page if different
    
    // Note: Using window.location.href instead of router.push()
    // ensures all states are completely reset
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-6 max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Unauthorized Access
          </h2>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header with logout button */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button 
            onClick={() => setShowUserModal(true)}
            className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition-all text-left border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 mr-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30 transition-colors">
                <FiUserPlus size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New User
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Register a new user account with custom permissions
            </p>
          </button>

          <button
            onClick={() => router.push('/admin/users')}
            className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition-all text-left border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 mr-4 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/30 transition-colors">
                <FiUsers size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Manage Users
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              View, edit, and manage all user accounts
            </p>
          </button>

          <button
            onClick={() => router.push('/admin/analytics')}
            className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition-all text-left border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 mr-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-800/30 transition-colors">
                <FiActivity size={24} />
              </div>
              
            </div>
             
          </button>
        </div>

        {/* Sales Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sales Overview
            </h2>
          </div>
          <div className="p-6">
            <SalesSummary />
          </div>
        </div>

        {/* Recent Activity (placeholder) */}
         
      </main>

      {/* User Creation Modal */}
      {showUserModal && (
        <UserCreationModal 
          onClose={() => setShowUserModal(false)}
          onSuccess={() => {
            setShowUserModal(false);
            // You might want to add a toast notification here
          }}
        />
      )}
    </div>
  );
}