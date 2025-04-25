'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext'; // import the context

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme(); // use the global theme

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role }),
      });

      const textResponse = await res.text();
      console.log('Response body:', textResponse);

      if (!res.ok) {
        const errorData = textResponse ? JSON.parse(textResponse) : { message: 'Something went wrong.' };
        setErrorMessage(errorData.message || 'Something went wrong.');
        return;
      }

      const data = JSON.parse(textResponse);
      localStorage.setItem('token', data.token);

      router.push(role === 'admin' ? '/dashboard/admin' : '/dashboard/user');
    } catch (error) {
      setErrorMessage('An error occurred while logging in. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-gray-800 dark:to-gray-900 p-8`}>
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl transform transition-all duration-300 hover:scale-105">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Login</h2>
          <button onClick={toggleTheme} className="text-xl text-gray-900 dark:text-white">
            {isDarkMode ? '🌙' : '🌞'}
          </button>
        </div>

        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-lg font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-lg font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-lg font-medium text-gray-700 dark:text-gray-300">Select Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-2 w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-300"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          Don't have an account? <a href="/signup" className="text-indigo-500 hover:underline">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
