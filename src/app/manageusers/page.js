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
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Users</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="border p-2 rounded w-64"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </form>

      {isLoading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Created At</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="border p-2">{user.name}</td>
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2 capitalize">{user.role}</td>
                  <td className="border p-2">{getStatusBadge(user.isActive)}</td>
                  <td className="border p-2">{formatDate(user.createdAt)}</td>
                  <td className="border p-2 space-x-2">
                    <Link
                      href={`/admin/users/${user._id}/edit`}
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleResetPassword(user._id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}