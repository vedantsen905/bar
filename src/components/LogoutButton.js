// /src/components/LogoutButton.js

'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';  // If using cookies

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Clear the token from cookies or localStorage
    Cookies.remove('authToken');  // Or localStorage.removeItem('authToken');

    // Redirect the user to the login page
    router.push('/login');
  };

  return (
    <button 
      onClick={handleLogout} 
      className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
