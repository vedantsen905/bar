'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiLogOut, FiUserPlus, FiUsers, FiHome } from 'react-icons/fi';
import SalesSummary from '@/components/SalesSummary';
import UserCreationModal from '@/components/UserCreationModal';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userRole, setUserRole] = useState('');

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
        setUserRole(data?.role);
        
        if (data?.role === 'admin') {
          setIsAuthorized(true);
        } else if (data?.role === 'user') {
          // Redirect to user dashboard if not admin
          router.push('/dashboard/user');
          return;
        } else {
          handleLogout(); // Automatically logout if not authorized
        }
      } catch (error) {
        handleLogout(); // Logout on any error
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  // Reliable logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Handle dashboard toggle
  const handleDashboardToggle = () => {
    if (userRole === 'admin') {
      router.push('/dashboard/user');
    } else {
      router.push('/dashboard/user');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="p-6 max-w-md bg-white rounded-xl shadow-md border border-amber-200">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">
            Unauthorized Access
          </h2>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header with dashboard toggle and logout button */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-amber-900">
              Admin Dashboard
            </h1>
            <div className="flex items-center space-x-4">
               
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              >
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content - Only show admin features */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <button 
            onClick={() => setShowUserModal(true)}
            className="group p-6 bg-white rounded-xl shadow hover:shadow-md transition-all text-left border border-amber-200 hover:border-amber-400"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 mr-4 rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-200 transition-colors">
                <FiUserPlus size={24} />
              </div>
              <h2 className="text-xl font-semibold text-amber-900">
                Create New User
              </h2>
            </div>
            <p className="text-amber-800">
              Register a new user account with custom permissions
            </p>
          </button>

          <button
            onClick={() => router.push('/admin/users')}
            className="group p-6 bg-white rounded-xl shadow hover:shadow-md transition-all text-left border border-amber-200 hover:border-amber-400"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 mr-4 rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-200 transition-colors">
                <FiUsers size={24} />
              </div>
              <h2 className="text-xl font-semibold text-amber-900">
                Manage Users
              </h2>
            </div>
            <p className="text-amber-800">
              View, edit, and manage all user accounts
            </p>
          </button>
        </div>

        {/* Sales Summary */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-amber-200 mb-8">
          <div className="px-6 py-4 border-b border-amber-200 bg-amber-50">
            <h2 className="text-lg font-semibold text-amber-900">
              Sales Overview
            </h2>
          </div>
          <div className="p-6">
            <SalesSummary />
          </div>
        </div>
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