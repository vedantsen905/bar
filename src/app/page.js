'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-gray-900 min-h-screen flex flex-col justify-center items-center">
      <nav className="w-full bg-gray-800 p-4 flex justify-between items-center">
        <div className="text-white font-bold text-2xl">
          <span>Bar Inventory Management</span>
        </div>
        <div className="space-x-4">
          <Link
            href="/login"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-300"
          >
            Register
          </Link>
        </div>
      </nav>

      <div className="text-center mt-16 text-white">
        <h1 className="text-5xl font-bold">Welcome to Bar Inventory Management</h1>
        <p className="mt-4 text-xl">Manage your bar inventory with ease.</p>
      </div>
    </div>
  );
}
