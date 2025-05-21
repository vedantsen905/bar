'use client';
import Head from 'next/head';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-camel dark:bg-neutral-900 text-black dark:text-white transition-colors duration-300">
      <Head>
        <title>BarStock | Modern Bar Inventory</title>
        <meta name="description" content="Next-gen bar inventory management" />
      </Head>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-400 to-yellow-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">BS</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
            BarStock
          </span>
        </div>
        
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-600/50 transition-colors"
        >
          {darkMode ? (
            <SunIcon className="h-5 w-5 text-yellow-300" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-700" />
          )}
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-2xl space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            <span className="block">Streamline Your</span>
            <span className="block bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
              Bar Inventory
            </span>
          </h1>
          
          <p className="text-xl text-gray-800 dark:text-gray-300 max-w-lg mx-auto">
            Modern, intuitive inventory management for bars and restaurants. Track, analyze, and optimize your stock effortlessly.
          </p>
          
          <div className="pt-6">
            <a
              href="/login"
              className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-orange-400 to-yellow-500 text-white font-medium shadow-lg hover:shadow-xl hover:from-orange-500 hover:to-yellow-600 transition-all duration-300"
            >
              Get Started
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 text-center text-gray-700 dark:text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} BarStock. All rights reserved.
      </footer>
    </div>
  );
}
