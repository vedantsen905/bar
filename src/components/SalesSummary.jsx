'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { MdArrowUpward, MdArrowDownward, MdFilterAlt, MdEdit, MdDelete, MdClose, MdSave } from 'react-icons/md';
import { FiRefreshCw } from 'react-icons/fi';
import { BiSolidDashboard } from 'react-icons/bi';

export default function SalesSummary() {
  const [summary, setSummary] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: 'today',
    product: '',
    transactionType: 'Sales',
  });
  const [products, setProducts] = useState([]);
  const [editingLog, setEditingLog] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];

  useEffect(() => {
    fetchData();
  }, [filters]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [productsRes, logsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/inventory'),
      ]);

      const productsData = await productsRes.json();
      const logsData = await logsRes.json();

      if (productsData && Array.isArray(productsData.products)) {
        setProducts(productsData.products);
      } else {
        console.error("Fetched products is not an array:", productsData);
      }

      setLogs(logsData);

      const today = new Date().toISOString().split('T')[0];
      let filteredLogs = logsData;

      if (filters.dateRange === 'today') {
        filteredLogs = logsData.filter((log) => log.date === today);
      } else if (filters.dateRange === 'last7days') {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const last7DaysString = last7Days.toISOString().split('T')[0];
        filteredLogs = logsData.filter((log) => log.date >= last7DaysString);
      } else if (filters.dateRange === 'thisMonth') {
        const firstDayOfMonth = new Date(today);
        firstDayOfMonth.setDate(1);
        const firstDayOfMonthString = firstDayOfMonth.toISOString().split('T')[0];
        filteredLogs = logsData.filter((log) => log.date >= firstDayOfMonthString);
      }

      const data = productsData.products
        .map((product) => {
          if (filters.product && product._id !== filters.product) return null;

          const productLogs = filteredLogs.filter(
            (log) =>
              log.productId?._id === product._id &&
              (filters.transactionType === 'All' || log.transactionType === filters.transactionType)
          );

          const sold = productLogs
            .filter((log) => log.transactionType === 'Sales')
            .reduce((acc, log) => acc + Math.abs(log.quantityBottles), 0);
          const purchased = productLogs
            .filter((log) => log.transactionType === 'Purchase')
            .reduce((acc, log) => acc + Math.abs(log.quantityBottles), 0);
          const opening = productLogs
            .filter((log) => log.transactionType === 'Opening Stock')
            .reduce((acc, log) => acc + Math.abs(log.quantityBottles), 0);
          const remaining = Math.max(opening + purchased - sold, 0);

          const latestDate =
            productLogs.length > 0
              ? productLogs.reduce((latest, log) => (log.date > latest ? log.date : latest), productLogs[0].date)
              : '-';

          return {
            id: product._id,
            name: product.productName,
            sold,
            purchased,
            remaining,
            remainingLiters: (remaining * product.mlPerBottle) / 1000,
            latestDate,
            logs: productLogs,
          };
        })
        .filter(Boolean);

      setSummary(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (log) => setEditingLog({ ...log });
  const handleCancelEdit = () => setEditingLog(null);

  const handleDelete = async (logId) => {
    if (!confirm('Are you sure you want to delete this log?')) return;
    
    try {
      const response = await fetch(`/api/inventory/${logId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLogs(logs.filter((log) => log._id !== logId));
        fetchData(); // Refresh data
      } else {
        const result = await response.json();
        console.error(`Failed to delete log with ID ${logId}:`, result);
      }
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/inventory/${editingLog._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLog),
      });

      if (res.ok) {
        setEditingLog(null);
        fetchData(); // Refresh data
      } else {
        console.error(`Failed to update log with ID ${editingLog._id}. Status: ${res.status}`);
      }
    } catch (error) {
      console.error('Error updating log:', error);
    }
  };

  const toggleFilterPanel = () => setIsFilterOpen(!isFilterOpen);

  const refreshData = () => {
    fetchData();
  };

  // Stats cards data
  const stats = [
    {
      title: "Total Sold",
      value: summary.reduce((acc, item) => acc + item.sold, 0),
      change: "+12%",
      isPositive: true,
      icon: <MdArrowUpward className="text-xl" />
    },
    {
      title: "Total Purchased",
      value: summary.reduce((acc, item) => acc + item.purchased, 0),
      change: "+5%",
      isPositive: true,
      icon: <MdArrowDownward className="text-xl" />
    },
    {
      title: "Total Remaining",
      value: summary.reduce((acc, item) => acc + item.remaining, 0),
      change: "-3%",
      isPositive: false,
      icon: <BiSolidDashboard className="text-xl" />
    },
    {
      title: "Active Products",
      value: summary.length,
      change: "+2%",
      isPositive: true,
      icon: <FiRefreshCw className="text-xl" />
    }
  ];

  return (
    <div className="mt-4 bg-gray-50 dark:bg-gray-900 dark:text-white text-gray-900 p-4 rounded-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Inventory Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">Monitor your sales and inventory performance</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={toggleFilterPanel}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow transition-all"
          >
            <MdFilterAlt /> Filters
          </button>
          <button 
            onClick={refreshData}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:shadow transition-all ${isLoading ? 'animate-spin' : ''}`}
            disabled={isLoading}
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[{
                name: 'dateRange', label: 'Date Range', options: [
                  { value: 'today', label: 'Today' },
                  { value: 'last7days', label: 'Last 7 Days' },
                  { value: 'thisMonth', label: 'This Month' }
                ]
              }, {
                name: 'product', label: 'Product', options: [
                  { value: '', label: 'All Products' },
                  ...products.map(p => ({ value: p._id, label: p.productName }))
                ]
              }, {
                name: 'transactionType', label: 'Transaction Type', options: [
                  { value: 'Sales', label: 'Sales' },
                  { value: 'Purchase', label: 'Purchase' },
                  { value: 'Opening Stock', label: 'Opening Stock' },
                  { value: 'Closing Stock', label: 'Closing Stock' },
                  { value: 'All', label: 'All Transactions' }
                ]
              }].map((filter, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium mb-1 capitalize" htmlFor={filter.name}>{filter.label}</label>
                  <select
                    name={filter.name}
                    value={filters[filter.name]}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {filter.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-full ${stat.isPositive ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                <span className={`${stat.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stat.icon}
                </span>
              </div>
            </div>
            <div className={`mt-2 text-sm ${stat.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {stat.change} from last period
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4">
          {['summary', 'details', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Inventory Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="currentColor" />
                    <YAxis stroke="currentColor" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        color: '#fff',
                        borderRadius: '0.5rem',
                        border: 'none'
                      }} 
                      wrapperStyle={{ zIndex: 50 }} 
                    />
                    <Legend />
                    <Bar dataKey="sold" name="Sold" radius={[4, 4, 0, 0]}>
                      {summary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar dataKey="purchased" name="Purchased" radius={[4, 4, 0, 0]}>
                      {summary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar dataKey="remaining" name="Remaining" radius={[4, 4, 0, 0]}>
                      {summary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Inventory Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Sold', value: summary.reduce((acc, i) => acc + i.sold, 0) },
                        { name: 'Purchased', value: summary.reduce((acc, i) => acc + i.purchased, 0) },
                        { name: 'Remaining', value: summary.reduce((acc, i) => acc + i.remaining, 0) }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip 
  formatter={(value, name) => {
    const total = summary.reduce((acc, item) => acc + item.sold + item.purchased + item.remaining, 0);
    const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
    return [`${value} (${percentage}%)`, name];
  }}
  contentStyle={{ 
    backgroundColor: '#1f2937', 
    color: '#fff',
    borderRadius: '0.5rem',
    border: 'none'
  }}
/>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {['Product', 'Sold', 'Purchased', 'Remaining (Bottles)', 'Remaining (Liters)', 'Last Transaction', 'Actions'].map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {summary.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        {isLoading ? 'Loading data...' : 'No data available'}
                      </td>
                    </tr>
                  ) : (
                    summary.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            {item.sold}
                            <MdArrowUpward className="ml-1 text-red-500" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            {item.purchased}
                            <MdArrowDownward className="ml-1 text-blue-500" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.remaining}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.remainingLiters.toFixed(2)} L
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.latestDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {item.logs.length > 0 && (
                              <>
                                <button
                                  onClick={() => handleEdit(item.logs[0])}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                >
                                  <MdEdit className="text-lg" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.logs[0]._id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                >
                                  <MdDelete className="text-lg" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {['Product', 'Transaction Type', 'Quantity', 'Date', 'Actions'].map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        {isLoading ? 'Loading data...' : 'No logs available'}
                      </td>
                    </tr>
                  ) : (
                    logs
                      .filter(log => 
                        (filters.product ? log.productId?._id === filters.product : true) &&
                        (filters.transactionType === 'All' || log.transactionType === filters.transactionType)
                      )
                      .map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {log.productId?.productName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.transactionType === 'Sales' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                            log.transactionType === 'Purchase' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                            'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                          }`}>
                            {log.transactionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {log.quantityBottles} bottles
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {log.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(log)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            >
                              <MdEdit className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDelete(log._id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            >
                              <MdDelete className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold">Edit Inventory Log</h3>
                <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <MdClose className="text-xl" />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Product</label>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                      {editingLog.productId?.productName || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Transaction Type</label>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                      {editingLog.transactionType}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="quantityBottles" className="block text-sm font-medium mb-1">Quantity (Bottles)</label>
                    <input
                      type="number"
                      id="quantityBottles"
                      name="quantityBottles"
                      value={editingLog.quantityBottles}
                      onChange={(e) => setEditingLog({ ...editingLog, quantityBottles: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                      {editingLog.date}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
                  >
                    <MdSave /> Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}