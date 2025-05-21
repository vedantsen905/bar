'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiHome, FiPackage, FiPlusCircle, FiLogOut, FiMenu, FiX, FiBarChart2, FiBell, FiFilter } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
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
  const router = useRouter();

  // Modern glass morphism styles with camel color scheme
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(210, 180, 140, 0.3)'
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
        .filter(item => 
          (item.transactionType === 'Opening Stock' || item.transactionType === 'Purchase') &&
          !item.isDeleted // Exclude deleted items
        )
        .map(item => ({
          ...item,
          cumulativeQuantity: calculateStock(item.productId)
        }));

    case 'transactions':
      return inventory
        .filter(item => 
          (item.transactionType === 'Purchase' || item.transactionType === 'Sale') &&
          !item.isDeleted // Exclude deleted items
        )
        .map(item => ({
          ...item,
          cumulativeQuantity: calculateStock(item.productId)
        }));

    default:
      return [];
  }
};   
  
  const filteredData = getFilteredData();

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F0D9B5] to-[#D2B48C]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5A2B]"></div>
    </div>
  );

  if (!isAuthorized) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F0D9B5] to-[#D2B48C]">
      <div 
        className="p-8 rounded-2xl text-center max-w-md w-full"
        style={glassStyle}
      >
        <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
        <button
          onClick={() => router.push('/login')}
          className="w-full bg-gradient-to-r from-[#A67C52] to-[#8B5A2B] text-white py-2 px-4 rounded-xl transition duration-200 shadow-lg hover:shadow-[#8B5A2B]/20"
        >
          Go to Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0D9B5] to-[#D2B48C] text-gray-800">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-72 z-30 p-4 bg-[#F5DEB3] border-r border-[#D2B48C] shadow-2xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center p-4 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#A67C52] to-[#8B5A2B] flex items-center justify-center mr-3">
              <FiPackage className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B5A2B] to-[#A67C52] bg-clip-text text-transparent">
              BarStock
            </h1>
          </div>
          
          <nav className="flex-1 space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center w-full p-3 rounded-xl transition-all group
                ${activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-[#A67C52]/20 to-[#8B5A2B]/20 text-[#5C4033] shadow-md'
                  : 'text-[#5C4033] hover:bg-[#F0D9B5]'}`}
            >
              <span className={`mr-3 ${activeTab === 'dashboard' ? 'text-[#8B5A2B]' : 'text-[#A67C52] group-hover:text-[#8B5A2B]'}`}>
                <FiHome size={18} />
              </span>
              <span className="font-medium">Dashboard</span>
              {activeTab === 'dashboard' && (
                <div className="ml-auto w-1.5 h-6 bg-gradient-to-b from-[#A67C52] to-[#8B5A2B] rounded-full" />
              )}
            </button>
            
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex items-center w-full p-3 rounded-xl transition-all group
                ${activeTab === 'products' 
                  ? 'bg-gradient-to-r from-[#A67C52]/20 to-[#8B5A2B]/20 text-[#5C4033] shadow-md'
                  : 'text-[#5C4033] hover:bg-[#F0D9B5]'}`}
            >
              <span className={`mr-3 ${activeTab === 'products' ? 'text-[#8B5A2B]' : 'text-[#A67C52] group-hover:text-[#8B5A2B]'}`}>
                <FiPackage size={18} />
              </span>
              <span className="font-medium">Products</span>
              {activeTab === 'products' && (
                <div className="ml-auto w-1.5 h-6 bg-gradient-to-b from-[#A67C52] to-[#8B5A2B] rounded-full" />
              )}
            </button>
            
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center w-full p-3 rounded-xl transition-all group
                ${activeTab === 'inventory' 
                  ? 'bg-gradient-to-r from-[#A67C52]/20 to-[#8B5A2B]/20 text-[#5C4033] shadow-md'
                  : 'text-[#5C4033] hover:bg-[#F0D9B5]'}`}
            >
              <span className={`mr-3 ${activeTab === 'inventory' ? 'text-[#8B5A2B]' : 'text-[#A67C52] group-hover:text-[#8B5A2B]'}`}>
                <FiPlusCircle size={18} />
              </span>
              <span className="font-medium">Inventory</span>
              {activeTab === 'inventory' && (
                <div className="ml-auto w-1.5 h-6 bg-gradient-to-b from-[#A67C52] to-[#8B5A2B] rounded-full" />
              )}
            </button>
          </nav>
          
          <div className="mt-auto">
            <div className="p-4 mb-4 rounded-xl bg-[#F0D9B5] flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#A67C52] to-[#8B5A2B] flex items-center justify-center text-white font-medium mr-3">
                U
              </div>
              <div>
                <p className="text-sm font-medium text-[#5C4033]">User Account</p>
                <p className="text-xs text-[#8B5A2B]">Admin</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-xl transition-all group text-[#5C4033] hover:bg-[#F0D9B5] hover:text-red-500"
            >
              <FiLogOut className="mr-3 text-[#A67C52] group-hover:text-red-500" size={18} />
              <span>Logout</span>
            </button>
            
            <div className="text-xs mt-4 px-3 text-[#8B5A2B]">
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
            className="fixed inset-y-0 left-0 w-72 z-50 p-4 bg-[#F5DEB3] border-r border-[#D2B48C] shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 mb-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#A67C52] to-[#8B5A2B] flex items-center justify-center mr-2">
                    <FiPackage className="text-white" size={16} />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#8B5A2B] to-[#A67C52] bg-clip-text text-transparent">
                    BarStock
                  </h1>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#5C4033] hover:bg-[#F0D9B5]"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <nav className="flex-1 space-y-2">
                <button 
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`flex items-center w-full p-3 rounded-xl transition-all
                    ${activeTab === 'dashboard' 
                      ? 'bg-gradient-to-r from-[#A67C52]/20 to-[#8B5A2B]/20 text-[#5C4033]'
                      : 'text-[#5C4033] hover:bg-[#F0D9B5]'}`}
                >
                  <span className={`mr-3 ${activeTab === 'dashboard' ? 'text-[#8B5A2B]' : 'text-[#A67C52]'}`}>
                    <FiHome size={18} />
                  </span>
                  <span className="font-medium">Dashboard</span>
                </button>
                
                <button 
                  onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}
                  className={`flex items-center w-full p-3 rounded-xl transition-all
                    ${activeTab === 'products' 
                      ? 'bg-gradient-to-r from-[#A67C52]/20 to-[#8B5A2B]/20 text-[#5C4033]'
                      : 'text-[#5C4033] hover:bg-[#F0D9B5]'}`}
                >
                  <span className={`mr-3 ${activeTab === 'products' ? 'text-[#8B5A2B]' : 'text-[#A67C52]'}`}>
                    <FiPackage size={18} />
                  </span>
                  <span className="font-medium">Products</span>
                </button>
                
                <button 
                  onClick={() => { setActiveTab('inventory'); setMobileMenuOpen(false); }}
                  className={`flex items-center w-full p-3 rounded-xl transition-all
                    ${activeTab === 'inventory' 
                      ? 'bg-gradient-to-r from-[#A67C52]/20 to-[#8B5A2B]/20 text-[#5C4033]'
                      : 'text-[#5C4033] hover:bg-[#F0D9B5]'}`}
                >
                  <span className={`mr-3 ${activeTab === 'inventory' ? 'text-[#8B5A2B]' : 'text-[#A67C52]'}`}>
                    <FiPlusCircle size={18} />
                  </span>
                  <span className="font-medium">Inventory</span>
                </button>
              </nav>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-3 rounded-xl transition-all mt-auto text-[#5C4033] hover:bg-[#F0D9B5] hover:text-red-500"
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
            className="text-[#8B5A2B]"
          >
            <FiMenu size={24} />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#8B5A2B] to-[#A67C52] bg-clip-text text-transparent">
            BarStock
          </h1>
          <button className="text-[#8B5A2B] relative">
            <FiBell size={24} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </header>

        {/* Desktop Header */}
        <div className="hidden lg:flex justify-between items-center mb-8 p-4 rounded-xl" style={glassStyle}>
          <h2 className="text-2xl font-bold text-[#5C4033]">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'products' && 'Products Management'}
            {activeTab === 'inventory' && 'Inventory Control'}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-[#5C4033] hover:text-[#8B5A2B]">
              <FiBell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#A67C52] to-[#8B5A2B] flex items-center justify-center text-white font-medium">
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
              className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-800 flex justify-between items-center"
              style={{ backdropFilter: 'blur(12px)' }}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Inventory log submitted successfully!
              </div>
              <button onClick={() => setShowSuccess(false)} className="text-green-700 hover:text-green-900">
                <FiX />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
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
                  icon: <FiPlusCircle className="text-[#8B5A2B]" size={20} />, 
                  color:   'from-[#A67C52] to-[#8B5A2B]'  
                },
                 
                { 
                  id: 'transactions',
                  title: 'Transactions', 
                  value: inventory.filter(i => i.transactionType === 'Purchase' || i.transactionType === 'Sale').length, 
                  icon: <FiBarChart2 className="text-[#8B5A2B]" size={20} />, 
                  color: 'from-[#8B5A2B] to-[#5C4033]' 
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
                <h3 className="text-lg font-semibold text-[#5C4033]">
                  {activeStatCard === 'activeInventory' && 'Active Inventory'}
                  
                  {activeStatCard === 'transactions' && 'Recent Transactions'}
                </h3>
                {activeStatCard === 'transactions' && (
                  <div className="flex items-center gap-2">
                    <FiFilter className="text-[#8B5A2B]" />
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="bg-white/30 border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#8B5A2B] text-[#5C4033]"
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
                  <table className="min-w-full divide-y divide-[#D2B48C]">
                    <thead className="bg-gradient-to-r from-[#A67C52] to-[#8B5A2B]">
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
                    <tbody className="bg-white/50 divide-y divide-[#D2B48C]">
                      {filteredData.slice(0, 10).map((item, index) => (
                        <tr key={index} className="hover:bg-[#F0D9B5]/30 transition">
                          {activeStatCard === 'activeInventory' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-[#5C4033]">{item.productId?.productName || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  item.transactionType === 'Opening Stock' ? 'bg-blue-500/10 text-blue-700' :
                                  'bg-[#8B5A2B]/10 text-[#8B5A2B]'
                                }`}>
                                  {item.transactionType}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-[#5C4033]">{item.quantityBottles}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-[#8B5A2B]">
                                  {item.cumulativeQuantity || 0}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-[#5C4033]">{new Date(item.date).toLocaleDateString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-[#5C4033]">{item.purchaseVendor || 'N/A'}</div>
                              </td>
                            </>
                          )}
                           
                          {activeStatCard === 'transactions' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-[#5C4033]">{new Date(item.date).toLocaleDateString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-[#5C4033]">{item.productId?.productName || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  item.transactionType === 'Purchase' ? 'bg-green-500/10 text-green-700' :
                                  'bg-[#8B5A2B]/10 text-[#8B5A2B]'
                                }`}>
                                  {item.transactionType}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-[#5C4033]">{item.quantityBottles}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-[#5C4033]">{item.purchaseVendor || item.saleCustomer || 'N/A'}</div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-[#8B5A2B]">
                  <FiPackage className="mb-4 text-4xl opacity-50" />
                  <p>No data available</p>
                </div>
              )}
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
            
          </motion.div>
        )}
      </div>
    </div>
  );
}