import './globals.css';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-gray-800 text-gray-200 min-h-screen font-sans">
        {/* Toast Notifications */}
        <Toaster position="top-right" reverseOrder={false} />

        {/* Navigation Bar */}
        <nav className="bg-gray-900 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">
              {/* Link to the Home Page */}
              <Link href="/" className="text-gray-200 hover:text-blue-400 hover:underline transition duration-300">
                Bar Inventory
              </Link>
            </h1>
            <div className="space-x-6">
              <Link href="/dashboard/admin" className="text-gray-200 hover:text-blue-400 hover:underline transition duration-300">
                Admin Dashboard
              </Link>
              <Link href="/dashboard/user" className="text-gray-200 hover:text-blue-400 hover:underline transition duration-300">
                User Dashboard
              </Link>
               
               
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );  
}
