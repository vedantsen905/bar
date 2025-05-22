'use client';
import { useState } from 'react';
import { FiX, FiUser, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

export default function UserCreationModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success('User created successfully!');
        setTimeout(() => {
          setFormData({ username: '', email: '', password: '', role: 'user' });
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'Error creating user');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-amber-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-amber-50 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-amber-200">
        <div className="flex justify-between items-center p-6 border-b border-amber-200">
          <h3 className="text-xl font-semibold text-amber-900 flex items-center gap-2">
            <FiUser className="text-amber-600" />
            Create New User
          </h3>
          <button 
            onClick={onClose}
            className="text-amber-600 hover:text-amber-800 transition-colors p-1 rounded-full hover:bg-amber-100"
          >
            <FiX size={20} />
          </button>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 text-red-800 rounded-lg border border-red-200 flex items-start gap-2">
            <FiX className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
            <div>{error}</div>
          </div>
        )}

        {success ? (
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FiCheckCircle className="text-green-600" size={32} />
            </div>
            <h4 className="text-xl font-semibold text-amber-900 mb-2">User Created Successfully!</h4>
            <p className="text-amber-700">The new user account has been created.</p>
            <div className="mt-6 w-full bg-amber-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-600 h-full rounded-full animate-[progress_1.5s_linear_forwards]"
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
              <InputField 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Password" 
                type="password" 
                icon={<FiLock className="text-amber-600" />} 
                minLength={6} 
              />
              <RoleSelect value={formData.role} onChange={handleChange} />
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-amber-700 hover:text-amber-900 transition-colors rounded-lg hover:bg-amber-100 disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        )}
      </div>

      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #fbbf24',
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
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-amber-600 flex items-center justify-center w-5 h-5">
          {icon}
        </span>
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 bg-amber-50 rounded-lg text-amber-900 border border-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all placeholder-amber-400"
        required
         style={{ paddingLeft: icon ? '2.5rem' : '1rem' }}
      />
    </div>
  );
}

function RoleSelect({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-amber-700 mb-2">Role</label>
      <div className="relative">
        <select
          name="role"
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 bg-amber-50 rounded-lg text-amber-900 border border-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 appearance-none outline-none transition-all"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}