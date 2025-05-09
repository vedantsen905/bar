'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiX, FiUser, FiMail, FiLock, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

export default function EditUser() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        const data = await res.json();
        if (res.ok) {
          setUser(data);
          setFormData({
            username: data.username || '',
            email: data.email || '',
            role: data.role || 'user',
            password: '',
            confirmPassword: ''
          });
        } else {
          throw new Error(data.error || 'Failed to fetch user');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }
  
    // Validate password strength if password is being changed
    if (formData.password) {
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        setIsSubmitting(false);
        return;
      }
      // if (!/[A-Z]/.test(formData.password)) {
      //   setError('Password must contain at least one uppercase letter');
      //   setIsSubmitting(false);
      //   return;
      // }
      if (!/[a-z]/.test(formData.password)) {
        setError('Password must contain at least one lowercase letter');
        setIsSubmitting(false);
        return;
      }
      if (!/[0-9]/.test(formData.password)) {
        setError('Password must contain at least one number');
        setIsSubmitting(false);
        return;
      }
    }
  
    try {
      const token = localStorage.getItem('token');
      
      const dataToSend = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        ...(formData.password && { newPassword: formData.password })
      };
  
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      setSuccess(true);
      toast.success('User updated successfully!');
      
      setTimeout(() => {
        router.push('/dashboard/admin');
      }, 1500);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Error</h3>
            <button 
              onClick={() => router.push('/dashboard/admin')}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="p-4 bg-red-900/50 text-red-100 rounded-lg border border-red-700 flex items-start gap-2 mb-6">
            <div className="text-red-400 mt-0.5">
              <FiX size={18} />
            </div>
            <div>{error}</div>
          </div>
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/dashboard/admin')}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
            >
              <FiArrowLeft size={20} />
            </button>
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FiUser className="text-blue-400" />
              Edit User
            </h3>
          </div>
          <button 
            onClick={() => router.push('/dashboard/admin')}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-900/50 text-red-100 rounded-lg border border-red-700 flex items-start gap-2">
            <div className="text-red-400 mt-0.5">
              <FiX size={18} />
            </div>
            <div>{error}</div>
          </div>
        )}

        {success ? (
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <FiCheckCircle className="text-green-400" size={32} />
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">User Updated Successfully!</h4>
            <p className="text-gray-400">The user account has been updated.</p>
            <div className="mt-6 w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full animate-[progress_1.5s_linear_forwards]"
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <InputField 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                placeholder="Username" 
                icon={<FiUser />} 
              />
              <InputField 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Email address" 
                type="email" 
                icon={<FiMail />} 
              />
              <RoleSelect 
                value={formData.role} 
                onChange={handleChange} 
              />
              
              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <FiLock className="text-blue-400" />
                  Change Password (optional)
                </h4>
                <div className="space-y-4">
                  <InputField 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="New password" 
                    type="password" 
                    icon={<FiLock />} 
                  />
                  <InputField 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    placeholder="Confirm new password" 
                    type="password" 
                    icon={<FiLock />} 
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard/admin')}
                className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

function InputField({ name, value, onChange, placeholder, type = 'text', icon, minLength }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all"
        minLength={minLength}
      />
    </div>
  );
}

function RoleSelect({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">Role</label>
      <div className="relative">
        <select
          name="role"
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 bg-gray-700/50 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 appearance-none outline-none transition-all"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}