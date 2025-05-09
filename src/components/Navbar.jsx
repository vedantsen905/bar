'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar({ isLoggedIn, setIsLoggedIn, handleLogout }) {
  const router = useRouter();
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <nav className={`shadow-md ${theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-900 text-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link href="/" className="hover:text-blue-400 hover:underline transition duration-300">
            Bar Inventory
          </Link>
        </h1>
        <div className="flex items-center space-x-6">
          <button onClick={toggleTheme} className="p-2" aria-label="Toggle Theme">
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>

          {isLoggedIn ? (
            <>
              <Link href="/dashboard/admin" className="hover:text-blue-400 transition">
                Admin Dashboard
              </Link>
              <Link href="/dashboard/user" className="hover:text-blue-400 transition">
                User Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-red-500 hover:text-white transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 border border-gray-300 rounded-lg hover:text-blue-400 transition">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 border border-gray-300 rounded-lg hover:text-blue-400 transition">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
