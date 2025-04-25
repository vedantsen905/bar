// context/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check localStorage and update state on first render
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    setLoading(false); // Set loading to false after checking auth status
  }, []); // Only run on mount

  // Function to handle login
  const handleLogin = (token) => {
    localStorage.setItem('token', token);  // Save token in localStorage
    setIsLoggedIn(true);  // Update state to trigger re-render
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');  // Remove token from localStorage
    setIsLoggedIn(false);  // Update state to trigger re-render
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, handleLogin, handleLogout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
