'use client';

import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = document.cookie?.split(';').find(cookie => cookie.trim().startsWith('auth_token='));
    setIsLoggedIn(!!token);
  }, []);

  return (
    <html lang="en">
      <head />
      <body className="min-h-screen font-sans transition-colors duration-300">
        <ThemeProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <Navbar isLoggedIn={isLoggedIn} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
