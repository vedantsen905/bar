'use client';
import { useEffect, useState, useCallback } from 'react';

export default function InventoryTable({ refreshKey }) {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch inventory data');
      const data = await res.json();
      setLogs(data);
      setFiltered(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshKey]);

  useEffect(() => {
    let result = [...logs];
    if (type !== 'All') {
      result = result.filter((log) => log.transactionType === type);
    }
    if (search) {
      result = result.filter((log) =>
        (log.productId?.productName || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [search, type, logs]);

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filtered.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filtered.length / logsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLogsPerPageChange = (e) => {
    setLogsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to page 1 when logs per page changes
  };

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{`Error: ${error}`}</div>;
  }

  return (
    <div className="bg-gray-800 text-white p-6 rounded-xl shadow-xl mt-6">
      <h2 className="text-3xl font-semibold text-white mb-6">Inventory Logs</h2>

      {/* Filter section */}
      <div className="flex flex-wrap gap-6 mb-6">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-transparent text-white border-2 border-gray-600 p-3 rounded-md focus:ring-2 focus:ring-blue-500 w-full sm:w-auto transition-all duration-300 hover:border-blue-500"
        >
          <option value="All">All</option>
          <option value="Purchase">Purchase</option>
          <option value="Sales">Sales</option>
          <option value="Opening Stock">Opening Stock</option>
          <option value="Closing Stock">Closing Stock</option>
        </select>

        <input
          type="text"
          placeholder="Search by product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-white p-3 rounded-md border-2 border-gray-600 focus:ring-2 focus:ring-blue-500 w-full sm:w-auto transition-all duration-300 hover:border-blue-500"
        />

        <select
          value={logsPerPage}
          onChange={handleLogsPerPageChange}
          className="bg-transparent text-white border-2 border-gray-600 p-3 rounded-md focus:ring-2 focus:ring-blue-500 w-full sm:w-auto transition-all duration-300 hover:border-blue-500"
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="15">15 per page</option>
          <option value="20">20 per page</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-600 rounded-md">
          <thead>
            <tr className="bg-gray-600 text-white">
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-left">Bottles</th>
              <th className="p-4 text-left">Liters</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map((log) => (
              <tr
                key={log._id}
                className="border-t border-gray-600 hover:bg-gray-700 cursor-pointer transition-all duration-200"
              >
                <td className="p-4">{new Date(log.date).toLocaleDateString()}</td>
                <td className="p-4">{log.transactionType}</td>
                <td className="p-4">{log.productId?.productName || log.productId}</td>
                <td className="p-4">{log.quantityBottles}</td>
                <td className="p-4">{(log.quantityMl / 1000).toFixed(2)} L</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-transparent text-white py-2 px-6 rounded-md border-2 border-gray-600 hover:border-blue-500 disabled:opacity-50 transition-all duration-300"
        >
          Previous
        </button>
        <div className="text-white">
          Page {currentPage} of {totalPages}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-transparent text-white py-2 px-6 rounded-md border-2 border-gray-600 hover:border-blue-500 disabled:opacity-50 transition-all duration-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
