'use client';

import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar'; // Use Navbar without AuthProvider

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-gray-800 text-gray-200 min-h-screen font-sans">
        <Toaster position="top-right" reverseOrder={false} />
        
        {/* Navbar is now handling authentication state directly */}
        <Navbar /> 
        
        {/* Main content of the page */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}