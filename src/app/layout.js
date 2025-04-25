'use client'; // Make this a client-side component to use hooks

import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login state from localStorage immediately on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Set state to true if token exists, false otherwise
  }, []); // This runs only once on mount

  const handleLogout = () => {
    // Clear the token from localStorage on logout
    localStorage.removeItem('token');
    setIsLoggedIn(false); // Update state immediately to reflect the logout
  };

  return (
    <html lang="en">
      <head />
      <body className="bg-gray-800 text-gray-200 min-h-screen font-sans">
        <Toaster position="top-right" reverseOrder={false} />
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} handleLogout={handleLogout} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
