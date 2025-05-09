'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiHome, FiPackage, FiPlusCircle, FiLogOut, FiMenu, FiX, FiBarChart2, FiBell, FiFilter } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import ProductForm from '@/components/ProductForm';
import InventoryForm from '@/components/InventoryForm';
import InventoryTable from '@/components/InventoryTable';

export default function UserDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeStatCard, setActiveStatCard] = useState('totalProducts');
  const [timeRange, setTimeRange] = useState('month');
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  // Modern glass morphism styles
  const glassStyle = {
    background: darkMode ? 'rgba(30, 30, 40, 0.5)' : 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: darkMode ? '0 8px 32px 0 rgba(0, 0, 0, 0.3)' : '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
  };

  // Fetch all necessary data
  const fetchData = useCallback(async () => {
    try {
      const [productsRes, inventoryRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/inventory')
      ]);
      
      if (!productsRes.ok || !inventoryRes.ok) throw new Error('Failed to fetch data');
      
      const productsData = await productsRes.json();
      const inventoryData = await inventoryRes.json();
      
      setProducts(productsData.products);
      setInventory(inventoryData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const calculateStock = (productId) => {
    return inventory.reduce((total, item) => {
      if (item.productId === productId) {
        if (item.transactionType === 'Opening Stock' || item.transactionType === 'Purchase') {
          return total + item.quantityBottles;
        } else if (item.transactionType === 'Sale') {
          return total - item.quantityBottles;
        }
      }
      return total;
    }, 0);
  };
  const refreshInventory = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    fetchData();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    // Check for dark mode preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };
 
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.role === 'user') {
          setIsAuthorized(true);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setIsLoading(false));
  }, [router]);

  const getFilteredData = () => {
    switch (activeStatCard) {
      case 'activeInventory':
        return inventory
          .filter(item => item.transactionType === 'Opening Stock' || item.transactionType === 'Purchase')
          .map(item => ({
            ...item,
            cumulativeQuantity: calculateStock(item.productId)
          }));

      case 'lowStock':
        return products
          .filter(product => {
            const stock = calculateStock(product._id);
            return stock > 0 && stock < 5;
          })
          .map(product => ({
            ...product,
            currentStock: calculateStock(product._id)
          }));

      case 'transactions':
        return inventory
          .filter(item => item.transactionType === 'Purchase' || item.transactionType === 'Sale')
          .map(item => ({
            ...item,
            cumulativeQuantity: calculateStock(item.productId)
          }));

      default:
        return [];
    }
  };    
  
  const filteredData = getFilteredData();

  // Calculate report data based on time range
  const getReportData = () => {
    const now = new Date();
    let startDate;
    
    switch(timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0); // All time
    }
    
    return inventory.filter(item => new Date(item.date) >= startDate);
  };

  const reportData = getReportData();

  // Prepare data for charts
  const prepareChartData = () => {
    // Inventory movement data for bar chart
    const movementData = reportData.reduce((acc, item) => {
      const date = new Date(item.date).toLocaleDateString();
      const existing = acc.find(d => d.date === date);
      
      if (existing) {
        if (item.transactionType === 'Opening Stock') {
          existing.in += item.quantityBottles;
        } else {
          existing.out += item.quantityBottles;
        }
      } else {
        acc.push({
          date,
          in: item.transactionType === 'Opening Stock' ? item.quantityBottles : 0,
          out: item.transactionType !== 'Opening Stock' ? item.quantityBottles : 0
        });
      }
      return acc;
    }, []).slice(-10); // Last 10 entries

    // Category distribution data for pie chart
    const categoryData = products.reduce((acc, product) => {
      const existing = acc.find(d => d.name === product.category);
      const stock = inventory.reduce((total, item) => {
        if (item.productId === product._id) {
          return item.transactionType === 'Opening Stock' 
            ? total + item.quantityBottles 
            : total - item.quantityBottles;
        }
        return total;
      }, 0);
      
      if (existing) {
        existing.value += stock;
      } else {
        acc.push({ name: product.category, value: stock });
      }
      return acc;
    }, []).filter(d => d.value > 0);

    return { movementData, categoryData };
  };

  const { movementData, categoryData } = prepareChartData();
   

  // Color palette for charts
  const COLORS = [
    '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c',
    '#d0ed57', '#ffc658', '#ff8042', '#ff6e7f', '#bc5090'
  ];

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (!isAuthorized) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div 
        className="p-8 rounded-2xl text-center max-w-md w-full"
        style={glassStyle}
      >
        <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
        <button
          onClick={() => router.push('/login')}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2 px-4 rounded-xl transition duration-200 shadow-lg hover:shadow-indigo-500/20"
        >
          Go to Login
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${darkMode ? 'from-gray-900 to-gray-800' : 'from-blue-50 to-indigo-100'} text-gray-800 dark:text-gray-100`}>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block fixed inset-y-0 left-0 w-72 z-30 p-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-r shadow-2xl`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center p-4 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mr-3">
              <FiPackage className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              BarStock
            </h1>
          </div>
          
          <nav className="flex-1 space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center w-full p-3 rounded-xl transition-all group
                ${activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white shadow-md'
                  : darkMode ? 'text-gray-400 hover:bg-gray-800/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <span className={`mr-3 ${activeTab === 'dashboard' ? 'text-purple-400' : darkMode ? 'text-gray-500 group-hover:text-purple-400' : 'text-gray-500 group-hover:text-purple-500'}`}>
                <FiHome size={18} />
              </span>
              <span className="font-medium">Dashboard</span>
              {activeTab === 'dashboard' && (
                <div className="ml-auto w-1.5 h-6 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full" />
              )}
            </button>
            
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex items-center w-full p-3 rounded-xl transition-all group
                ${activeTab === 'products' 
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white shadow-md'
                  : darkMode ? 'text-gray-400 hover:bg-gray-800/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <span className={`mr-3 ${activeTab === 'products' ? 'text-purple-400' : darkMode ? 'text-gray-500 group-hover:text-purple-400' : 'text-gray-500 group-hover:text-purple-500'}`}>
                <FiPackage size={18} />
              </span>
              <span className="font-medium">Products</span>
              {activeTab === 'products' && (
                <div className="ml-auto w-1.5 h-6 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full" />
              )}
            </button>
            
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center w-full p-3 rounded-xl transition-all group
                ${activeTab === 'inventory' 
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white shadow-md'
                  : darkMode ? 'text-gray-400 hover:bg-gray-800/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <span className={`mr-3 ${activeTab === 'inventory' ? 'text-purple-400' : darkMode ? 'text-gray-500 group-hover:text-purple-400' : 'text-gray-500 group-hover:text-purple-500'}`}>
                <FiPlusCircle size={18} />
              </span>
              <span className="font-medium">Inventory</span>
              {activeTab === 'inventory' && (
                <div className="ml-auto w-1.5 h-6 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full" />
              )}
            </button>
          </nav>
          
          <div className="mt-auto">
            <div className={`p-4 mb-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'} flex items-center`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium mr-3">
                U
              </div>
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>User Account</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Admin</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className={`flex items-center w-full p-3 rounded-xl transition-all group ${darkMode ? 'text-gray-400 hover:bg-gray-800/50 hover:text-red-400' : 'text-gray-600 hover:bg-gray-100 hover:text-red-500'}`}
            >
              <FiLogOut className={`mr-3 ${darkMode ? 'text-gray-500 group-hover:text-red-400' : 'text-gray-500 group-hover:text-red-500'}`} size={18} />
              <span>Logout</span>
            </button>
            
            <div className={`text-xs mt-4 px-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              v1.0.0 • BarStock © 2025
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed inset-y-0 left-0 w-72 z-50 p-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-r shadow-2xl`}
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 mb-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mr-2">
                    <FiPackage className="text-white" size={16} />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    BarStock
                  </h1>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-1 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <nav className="flex-1 space-y-2">
                <button 
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`flex items-center w-full p-3 rounded-xl transition-all
                    ${activeTab === 'dashboard' 
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white'
                      : darkMode ? 'text-gray-400 hover:bg-gray-800/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <span className={`mr-3 ${activeTab === 'dashboard' ? 'text-purple-400' : darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <FiHome size={18} />
                  </span>
                  <span className="font-medium">Dashboard</span>
                </button>
                
                <button 
                  onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}
                  className={`flex items-center w-full p-3 rounded-xl transition-all
                    ${activeTab === 'products' 
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white'
                      : darkMode ? 'text-gray-400 hover:bg-gray-800/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <span className={`mr-3 ${activeTab === 'products' ? 'text-purple-400' : darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <FiPackage size={18} />
                  </span>
                  <span className="font-medium">Products</span>
                </button>
                
                <button 
                  onClick={() => { setActiveTab('inventory'); setMobileMenuOpen(false); }}
                  className={`flex items-center w-full p-3 rounded-xl transition-all
                    ${activeTab === 'inventory' 
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white'
                      : darkMode ? 'text-gray-400 hover:bg-gray-800/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <span className={`mr-3 ${activeTab === 'inventory' ? 'text-purple-400' : darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <FiPlusCircle size={18} />
                  </span>
                  <span className="font-medium">Inventory</span>
                </button>
              </nav>
              
              <button
                onClick={handleLogout}
                className={`flex items-center w-full p-3 rounded-xl transition-all mt-auto ${darkMode ? 'text-gray-400 hover:bg-gray-800/50 hover:text-red-400' : 'text-gray-600 hover:bg-gray-100 hover:text-red-500'}`}
              >
                <FiLogOut className="mr-3" size={18} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="ml-0 lg:ml-72 transition-all duration-300 p-4 lg:p-8">
        {/* Mobile Header */}
        <header className="lg:hidden flex justify-between items-center mb-6 p-4 rounded-xl" style={glassStyle}>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="text-indigo-600 dark:text-indigo-400"
          >
            <FiMenu size={24} />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            BarStock
          </h1>
          <button className="text-indigo-600 dark:text-indigo-400 relative">
            <FiBell size={24} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </header>

        {/* Desktop Header */}
        <div className="hidden lg:flex justify-between items-center mb-8 p-4 rounded-xl" style={glassStyle}>
          <h2 className="text-2xl font-bold">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'products' && 'Products Management'}
            {activeTab === 'inventory' && 'Inventory Control'}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400">
              <FiBell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
              U
            </div>
          </div>
        </div>

        {/* Success Notification */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-100 flex justify-between items-center"
              style={{ backdropFilter: 'blur(12px)' }}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Inventory log submitted successfully!
              </div>
              <button onClick={() => setShowSuccess(false)} className="text-green-200 hover:text-white">
                <FiX />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            
            {/* // Stats Cards - Updated section */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  {[
    { 
      id: 'activeInventory',
      title: 'Active Inventory', 
      value: inventory.reduce((acc, item) => {
        if (item.transactionType === 'Opening Stock' || item.transactionType === 'Purchase') {
          return acc + item.quantityBottles;
        }
        return acc;
      }, 0), 
      icon: <FiPlusCircle className="text-purple-400" size={20} />, 
      color: 'from-purple-500 to-purple-600' 
    },
    { 
      id: 'lowStock',
      title: 'Low Stock Items', 
      value: products.filter(product => {
        const stock = inventory.reduce((acc, item) => {
          if (item.productId === product._id) {
            if (item.transactionType === 'Opening Stock' || item.transactionType === 'Purchase') {
              return acc + item.quantityBottles;
            } else if (item.transactionType === 'Sale') {
              return acc - item.quantityBottles;
            }
          }
          return acc;
        }, 0);
        return stock > 0 && stock < 5; // Only items with less than 5 bottles
      }).length, 
      icon: <FiBarChart2 className="text-amber-400" size={20} />, 
      color: 'from-amber-500 to-amber-600' 
    },
    { 
      id: 'transactions',
      title: 'Transactions', 
      value: inventory.filter(i => i.transactionType === 'Purchase' || i.transactionType === 'Sale').length, 
      icon: <FiBarChart2 className="text-emerald-400" size={20} />, 
      color: 'from-emerald-500 to-emerald-600' 
    }
  ].map((stat) => (
    <motion.div
      key={stat.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setActiveStatCard(stat.id)}
      className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg cursor-pointer transition-all
        ${activeStatCard === stat.id ? 'ring-2 ring-white/50' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium opacity-80">{stat.title}</h3>
          <p className="text-3xl font-bold mt-2">{stat.value}</p>
        </div>
        <div className="p-2 rounded-lg bg-white/10">
          {stat.icon}
        </div>
      </div>
    </motion.div>
  ))}
</div>
            {/* Data Display Section */}
            <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="mb-8 p-6 rounded-2xl min-h-[400px]"
  style={glassStyle}
>
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-lg font-semibold">
      {activeStatCard === 'activeInventory' && 'Active Inventory'}
      {activeStatCard === 'lowStock' && 'Low Stock Items (1-4 bottles)'}
      {activeStatCard === 'transactions' && 'Recent Transactions'}
    </h3>
    {activeStatCard === 'transactions' && (
      <div className="flex items-center gap-2">
        <FiFilter className="text-gray-500" />
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-white/10 border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>
    )}
  </div>

  {filteredData.length > 0 ? (
      <div className="overflow-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-indigo-500 to-purple-500">
            <tr>
              {activeStatCard === 'activeInventory' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Transaction Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Cumulative Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Vendor</th>
                </>
              )}
            {activeStatCard === 'lowStock' && (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
              </>
            )}
            {activeStatCard === 'transactions' && (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Vendor/Customer</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredData.slice(0, 10).map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                {activeStatCard === 'activeInventory' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{item.productId?.productName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.transactionType === 'Opening Stock' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-purple-500/10 text-purple-500'
                      }`}>
                        {item.transactionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{item.quantityBottles}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {item.cumulativeQuantity || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{new Date(item.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{item.purchaseVendor || 'N/A'}</div>
                    </td>
                  </>
                )}
              {activeStatCard === 'lowStock' && (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{item.productName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      {inventory.reduce((acc, inv) => {
                        if (inv.productId === item._id) {
                          if (inv.transactionType === 'Opening Stock' || inv.transactionType === 'Purchase') {
                            return acc + inv.quantityBottles;
                          } else if (inv.transactionType === 'Sale') {
                            return acc - inv.quantityBottles;
                          }
                        }
                        return acc;
                      }, 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-500">Low Stock</span>
                  </td>
                </>
              )}
              {activeStatCard === 'transactions' && (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{new Date(item.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{item.productId?.productName || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.transactionType === 'Purchase' ? 'bg-green-500/10 text-green-500' :
                      'bg-purple-500/10 text-purple-500'
                    }`}>
                      {item.transactionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{item.quantityBottles}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{item.purchaseVendor || item.saleCustomer || 'N/A'}</div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <FiPackage className="mb-4 text-4xl opacity-50" />
      <p>No data available</p>
    </div>
  )}
</motion.div>

            {/* Full-page Reports Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 rounded-2xl"
              style={glassStyle}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Inventory Analytics</h3>
                <div className="flex items-center gap-2">
                  <FiFilter className="text-gray-500" />
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-white/10 border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 rounded-xl p-6 h-96">
                  <h4 className="font-medium mb-4">Inventory Movement</h4>
                  {movementData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={movementData}>
                        <XAxis dataKey="date" stroke={darkMode ? '#94a3b8' : '#64748b'} />
                        <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} />
                        <Tooltip 
                          contentStyle={{
                            background: darkMode ? '#1e293b' : '#ffffff',
                            borderColor: darkMode ? '#334155' : '#e2e8f0',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="in" name="Stock In" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="out" name="Stock Out" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No movement data available
                    </div>
                  )}
                </div>
                <div className="bg-white/5 rounded-xl p-6 h-96">
                  <h4 className="font-medium mb-4">Category Distribution</h4>
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            background: darkMode ? '#1e293b' : '#ffffff',
                            borderColor: darkMode ? '#334155' : '#e2e8f0',
                            borderRadius: '0.5rem'
                          }}
                          formatter={(value, name, props) => [
                            value,
                            props.payload.name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No category data available
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 h-96">
                <h4 className="font-medium mb-4">Transaction History</h4>
                <div className="h-80 overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100/10 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {reportData.slice(0, 10).map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50/10 dark:hover:bg-gray-700/20">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{item.productId?.productName || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.transactionType === 'Purchase' ? 'bg-green-500/10 text-green-500' :
                              item.transactionType === 'Opening Stock' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-purple-500/10 text-purple-500'
                            }`}>
                              {item.transactionType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{item.quantityBottles}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl" style={glassStyle}>
              <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
              <ProductForm onProductSaved={fetchData} />
            </div>
            <div className="p-6 rounded-2xl" style={glassStyle}>
              <h3 className="text-lg font-semibold mb-4">Product List</h3>
              <div className="text-center py-8 text-gray-500">
                <FiPackage className="mx-auto mb-2" size={24} />
                <p>Product list will appear here</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl" style={glassStyle}>
              <h3 className="text-lg font-semibold mb-4">Inventory Management</h3>
              <InventoryForm products={products} onSubmitSuccess={refreshInventory} />
            </div>
            <div className="p-6 rounded-2xl overflow-hidden" style={glassStyle}>
              <InventoryTable refreshKey={refreshKey} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}