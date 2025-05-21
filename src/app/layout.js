'use client';

import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-camel text-black min-h-screen font-sans">
        <ToastContainer position="top-right" autoClose={5000} />
        <Toaster position="top-right" reverseOrder={false} />

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
