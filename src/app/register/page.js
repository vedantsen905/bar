'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiLock, FiPlusCircle } from 'react-icons/fi';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Check admin status
    const checkAdminStatus = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.role === 'admin') {
          setIsAdmin(true);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to verify admin status:', err);
        router.push('/login');
      }
    };

    checkAdminStatus();
  }, [router]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role: 'user' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return null; // Or a loading spinner while checking admin status
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-cyan-100'}`}>
      <div className={`w-full max-w-md p-8 rounded-xl shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} hover:shadow-2xl`}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-600' : 'bg-green-100 text-green-600'}`}>
              <FiPlusCircle className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Create Account</h1>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-2">New User</h2>
        <p className={`mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Create a new user account</p>

        {error && (
          <div className={`mb-6 p-3 rounded-lg ${theme === 'dark' ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-700'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Username
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <FiUser className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:ring-green-500 focus:border-green-500' : 'bg-white border-gray-300 focus:ring-green-500 focus:border-green-500'} placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <FiMail className="w-5 h-5" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:ring-green-500 focus:border-green-500' : 'bg-white border-gray-300 focus:ring-green-500 focus:border-green-500'} placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
                placeholder="Enter email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <FiLock className="w-5 h-5" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:ring-green-500 focus:border-green-500' : 'bg-white border-gray-300 focus:ring-green-500 focus:border-green-500'} placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${isLoading 
              ? theme === 'dark' 
                ? 'bg-green-700 cursor-not-allowed' 
                : 'bg-green-300 cursor-not-allowed'
              : theme === 'dark'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-green-500 hover:bg-green-600 text-white'}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <FiPlusCircle className="w-5 h-5" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className={`mt-6 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Already have an account?{' '}
          <a 
            href="/login" 
            className={`font-medium ${theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'} transition-colors`}
          >
            Login here
          </a>
        </div>
      </div>
    </div>
  );
}