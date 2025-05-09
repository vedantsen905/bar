'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SunIcon, MoonIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminRegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  // Check theme preference on mount
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldEnableDark = theme === 'dark' || (!theme && prefersDark);
    
    setIsDarkMode(shouldEnableDark);
    document.documentElement.classList.toggle('dark', shouldEnableDark);
  }, []);

  // Toggle dark/light mode
  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'admin' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Admin registered successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'An error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-cyan-50 to-blue-50'}`}>
      
      {/* Toast container */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className={`absolute rounded-full opacity-10 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'}`}
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `scale(${Math.random() + 0.5})`,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
            }}
          />
        ))}
      </div>

      {/* Registration card */}
      <div className={`relative w-full max-w-md z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 transform hover:scale-[1.01]`}>
        
        <div className={`h-2 ${isDarkMode ? 'bg-gradient-to-r from-purple-600 to-blue-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}></div>

        <div className="p-8 sm:p-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                Register Admin
              </h1>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Create a new admin account
              </p>
            </div>

            <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
                placeholder="Enter email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'} transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Admin'
              )}
            </button>
          </form>

          <div className={`mt-6 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <a href="/login" className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors`}>
              Sign in
            </a>
          </div>
        </div>
      </div>

      {/* Global styles for float animation */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
