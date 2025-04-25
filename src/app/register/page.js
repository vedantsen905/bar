'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // Flag to check if the logged-in user is an admin
  const router = useRouter();

  useEffect(() => {
    // Fetch the current user information to check if they are an admin
    const fetchCurrentUser = async () => {
      const res = await fetch('/api/auth/me'); // Assume this returns current user info
      const data = await res.json();
      if (res.ok && data.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.push('/login'); // Redirect to login if not admin
      }
    };

    fetchCurrentUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role: 'user' }), // Role is hardcoded to 'user'
    });

    const data = await res.json();

    if (res.ok) {
      router.push('/login');
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-3xl font-semibold text-white mb-6">Register</h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-4">
          <label className="text-white">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 mt-2 text-gray-900 rounded-lg"
          />
        </div>

        <div className="mb-4">
          <label className="text-white">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 mt-2 text-gray-900 rounded-lg"
          />
        </div>

        <div className="mb-6">
          <label className="text-white">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 mt-2 text-gray-900 rounded-lg"
          />
        </div>

        {/* Removed the role selection, only admins can create users */}
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg">
          Register
        </button>
      </form>
    </div>
  );
}
