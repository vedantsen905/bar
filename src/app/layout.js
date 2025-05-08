'use client';

import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-gray-800 text-gray-200 min-h-screen font-sans">
        <Toaster position="top-right" reverseOrder={false} />

        {/* Navbar inside AuthProvider to handle authentication state */}
        <AuthProvider>
          {/* <Navbar /> */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
