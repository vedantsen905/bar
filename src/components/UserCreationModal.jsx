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
  
    const { username, email, password, role } = formData; // ✅ Pull values here
  
    const token = localStorage.getItem('token');
  
    if (!token) {
      alert('No admin token found. Please log in as admin.');
      return;
    }
  
    setIsLoading(true);
    setError('');
    setSuccess(false);
  
    try {
      const res = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email, password, role }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setSuccess(true);
        toast.success('User created successfully!');
        onSuccess && onSuccess(); // Optional callback to refresh list
  
        // ✅ Auto-close modal after 1.5 seconds
        setTimeout(() => {
          setFormData({ username: '', email: '', password: '', role: 'user' }); // Reset form
          setSuccess(false); // Reset success state (optional)
          onClose(); // Close modal
        }, 1500);
      } else {
        setError(data.message || 'Error creating user');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <FiUser className="text-blue-400" />
            Create New User
          </h3>
          <button 
            onClick={onClose}
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
            <h4 className="text-xl font-semibold text-white mb-2">User Created Successfully!</h4>
            <p className="text-gray-400">The new user account has been created.</p>
            <div className="mt-6 w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full animate-[progress_1.5s_linear_forwards]"
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <InputField name="username" value={formData.username} onChange={handleChange} placeholder="Username" icon={<FiUser />} />
              <InputField name="email" value={formData.email} onChange={handleChange} placeholder="Email address" type="email" icon={<FiMail />} />
              <InputField name="password" value={formData.password} onChange={handleChange} placeholder="Password" type="password" icon={<FiLock />} minLength={6} />
              <RoleSelect value={formData.role} onChange={handleChange} />
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50 disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Toast Container */}
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
        required
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
