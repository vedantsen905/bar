'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const router = useRouter();
  const usersPerPage = 10;

  const verifyToken = (token) => {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return {
        isValid: decoded.exp * 1000 > Date.now(),
        role: decoded.role
      };
    } catch {
      return { isValid: false };
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const { isValid, role } = verifyToken(token);
      if (!isValid || role !== 'admin') {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: usersPerPage,
        search: searchTerm
      });

      const res = await fetch(`/api/admin/users?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchUsers();
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = await new Promise((resolve) => {
      toast.info(
        <div>
          <p>Are you sure you want to delete this user?</p>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => {
                toast.dismiss();
                resolve(true);
              }} 
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
            <button 
              onClick={() => {
                toast.dismiss();
                resolve(false);
              }} 
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>,
        {
          autoClose: false,
          closeButton: false,
        }
      );
    });

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleResetPassword = async (userId) => {
    const confirmReset = await new Promise((resolve) => {
      toast.info(
        <div>
          <p>Reset password for this user?</p>
          <p>They will receive an email with instructions.</p>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => {
                toast.dismiss();
                resolve(true);
              }} 
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Reset
            </button>
            <button 
              onClick={() => {
                toast.dismiss();
                resolve(false);
              }} 
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>,
        {
          autoClose: false,
          closeButton: false,
        }
      );
    });

    if (!confirmReset) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to reset password');
      }

      toast.success('Password reset initiated. User will receive an email.');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 bg-amber-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-semibold text-amber-900">Manage Users</h1>
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg w-full md:w-auto"
        >
          Back to Dashboard
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSearch} className="mb-6 bg-amber-100 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="border border-amber-300 p-2 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button 
            type="submit" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded w-full sm:w-auto"
          >
            Search
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-amber-800">Loading users...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-amber-200">
                <tr>
                  {/* <th className="p-3 text-left text-amber-900">Name</th> */}
                  <th className="p-3 text-left text-amber-900">Email</th>
                  <th className="p-3 text-left text-amber-900 hidden sm:table-cell">Role</th>
                  {/* <th className="p-3 text-left text-amber-900">Status</th> */}
                  <th className="p-3 text-left text-amber-900 hidden md:table-cell">Created</th>
                  <th className="p-3 text-left text-amber-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="border-b border-amber-100 hover:bg-amber-50">
                      {/* <td className="p-3">{user.name}</td> */}
                      <td className="p-3 break-all">{user.email}</td>
                      <td className="p-3 capitalize hidden sm:table-cell">{user.role}</td>
                      {/* <td className="p-3">{getStatusBadge(user.isActive)}</td> */}
                      <td className="p-3 hidden md:table-cell">{formatDate(user.createdAt)}</td>
                      <td className="p-3 space-x-1">
                        <Link
                          href={`/admin/users/${user._id}/edit`}
                          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="inline-block bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs sm:text-sm"
                        >
                          Delete
                        </button>
                        {/* <button
                          onClick={() => handleResetPassword(user._id)}
                          className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs sm:text-sm mt-1 sm:mt-0"
                        >
                          Reset PW
                        </button> */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {users.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 disabled:opacity-50 w-full sm:w-auto"
              >
                Previous
              </button>
              <span className="text-amber-900 text-center">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 disabled:opacity-50 w-full sm:w-auto"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}