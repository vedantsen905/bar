'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // default to 'user'
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role }),
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

        <div className="mb-6">
          <label className="text-white">Role</label>
          <div className="mt-2">
            <label className="text-white mr-4">
              <input
                type="radio"
                value="user"
                checked={role === 'user'}
                onChange={() => setRole('user')}
                className="mr-2"
              />
              User
            </label>
            <label className="text-white">
              <input
                type="radio"
                value="admin"
                checked={role === 'admin'}
                onChange={() => setRole('admin')}
                className="mr-2"
              />
              Admin
            </label>
          </div>
        </div>

        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg">
          Register
        </button>
      </form>
    </div>
  );
}
