'use client';
import React from 'react';
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
  
    if (formData.password) {
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        setIsSubmitting(false);
        return;
      }
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
      <div className="fixed inset-0 bg-amber-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-lg border border-amber-200 max-w-xs w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-amber-800">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="fixed inset-0 bg-amber-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full shadow-lg border border-amber-200">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-amber-900">Error</h3>
            <button 
              onClick={() => router.push('/dashboard/admin')}
              className="text-amber-600 hover:text-amber-800 transition-colors p-1 rounded-full hover:bg-amber-100"
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="p-3 sm:p-4 bg-red-100 text-red-800 rounded-lg border border-red-200 flex items-start gap-2 mb-4 sm:mb-6">
            <div className="text-red-500 mt-0.5">
              <FiX size={18} />
            </div>
            <div className="text-sm sm:text-base">{error}</div>
          </div>
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="w-full py-2 sm:py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm sm:text-base"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-amber-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-amber-200 my-4">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-amber-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => router.push('/dashboard/admin')}
              className="text-amber-600 hover:text-amber-800 transition-colors p-1 rounded-full hover:bg-amber-100"
            >
              <FiArrowLeft size={20} />
            </button>
            <h3 className="text-lg sm:text-xl font-semibold text-amber-900 flex items-center gap-2">
              <FiUser className="text-amber-600" />
              Edit User
            </h3>
          </div>
          <button 
            onClick={() => router.push('/dashboard/admin')}
            className="text-amber-600 hover:text-amber-800 transition-colors p-1 rounded-full hover:bg-amber-100"
          >
            <FiX size={20} />
          </button>
        </div>
        
        {error && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-2 sm:p-3 bg-red-100 text-red-800 rounded-lg border border-red-200 flex items-start gap-2 text-sm sm:text-base">
            <div className="text-red-500 mt-0.5">
              <FiX size={18} />
            </div>
            <div>{error}</div>
          </div>
        )}

        {success ? (
          <div className="p-4 sm:p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <FiCheckCircle className="text-green-600" size={28} />
            </div>
            <h4 className="text-lg sm:text-xl font-semibold text-amber-900 mb-2">User Updated Successfully!</h4>
            <p className="text-amber-700 text-sm sm:text-base">The user account has been updated.</p>
            <div className="mt-4 sm:mt-6 w-full bg-amber-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-600 h-full rounded-full animate-[progress_1.5s_linear_forwards]"
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <InputField 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                placeholder="Username" 
                icon={<FiUser className="text-amber-600" />} 
              />
              <InputField 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Email address" 
                type="email" 
                icon={<FiMail className="text-amber-600" />} 
              />
              <RoleSelect 
                value={formData.role} 
                onChange={handleChange} 
              />
              
              <div className="pt-3 sm:pt-4 border-t border-amber-200">
                <h4 className="text-xs sm:text-sm font-medium text-amber-700 mb-2 sm:mb-3 flex items-center gap-2">
                  <FiLock className="text-amber-600" />
                  Change Password (optional)
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  <InputField 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="New password" 
                    type="password" 
                    icon={<FiLock className="text-amber-600" />} 
                  />
                  <InputField 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    placeholder="Confirm new password" 
                    type="password" 
                    icon={<FiLock className="text-amber-600" />} 
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard/admin')}
                className="px-4 py-2 sm:px-5 sm:py-2.5 text-amber-700 hover:text-amber-900 transition-colors rounded-lg hover:bg-amber-100 disabled:opacity-50 text-sm sm:text-base order-2 sm:order-1"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
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

      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#fff',
            color: '#92400e',
            border: '1px solid #fbbf24',
            fontSize: '14px',
            maxWidth: '100%',
            width: 'auto',
            padding: '12px 16px',
          },
          iconTheme: {
            primary: '#d97706',
            secondary: '#fff',
          },
        }}
      />
    </div>
  );
}

function InputField({ name, value, onChange, placeholder, type = 'text', icon, minLength }) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600">
          {icon}
        </span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-amber-50 rounded-lg text-amber-900 border border-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all placeholder-amber-400 text-sm sm:text-base"
        minLength={minLength}
        style={{ paddingLeft: icon ? '2.5rem' : '1rem' }}
      />
    </div>
  );
}

function RoleSelect({ value, onChange }) {
  return (
    <div className="relative">
      <label className="block text-xs sm:text-sm text-amber-700 mb-1 sm:mb-2">Role</label>
      <select
        name="role"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-amber-50 rounded-lg text-amber-900 border border-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 appearance-none outline-none transition-all pr-10 text-sm sm:text-base"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 pointer-events-none">
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}