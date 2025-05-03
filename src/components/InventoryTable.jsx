'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiSearch } from 'react-icons/fi';

export default function InventoryTable({ refreshKey }) {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/inventory');
        const data = await res.json();
        setLogs(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setFiltered(data);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [refreshKey]);

  useEffect(() => {
    let result = logs;
    if (type !== 'All') result = result.filter(log => log.transactionType === type);
    if (search) result = result.filter(log => 
      (log.productId?.productName || '').toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, type, logs]);

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filtered.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filtered.length / logsPerPage);

  const getTypeColor = (type) => {
    switch(type) {
      case 'Purchase': return 'bg-green-500/10 text-green-500';
      case 'Opening Stock': return 'bg-blue-500/10 text-blue-500';
      case 'Closing Stock': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-3xl shadow-2xl"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
          Inventory Logs
        </h2>
        <div className="h-1 flex-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 mx-6 rounded-full"></div>
        <button 
          onClick={() => window.location.reload()}
          className="p-2 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition"
        >
          <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full bg-white dark:bg-gray-800 border-0 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-white dark:bg-gray-800 border-0 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Types</option>
          <option value="Purchase">Purchase</option>
          <option value="Opening Stock">Opening Stock</option>
          <option value="Closing Stock">Closing Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto rounded-xl">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-indigo-500 to-purple-500">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Bottles</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Volume (L)</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{new Date(log.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(log.transactionType)}`}>
                      {log.transactionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{log.productId?.productName || log.productId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.quantityBottles}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {(log.quantityMl / 1000).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page</span>
            <select
              value={logsPerPage}
              onChange={(e) => {
                setLogsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-gray-800 border-0 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
            >
              {[5, 10, 15, 20].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 disabled:opacity-50 transition"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 disabled:opacity-50 transition"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}