'use client';
import { useEffect, useState, useCallback } from 'react';

export default function InventoryTable({ refreshKey }) {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [fetchLogs, refreshKey]); // <- React to refreshKey

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

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{`Error: ${error}`}</div>;
  }

  return (
    <div className="bg-gray-800 text-gray-200 p-6 rounded-xl shadow-lg mt-6">
      <h2 className="text-2xl font-semibold text-white mb-4">Inventory Logs</h2>

      <div className="flex gap-4 mb-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-gray-700 text-gray-200 border border-gray-600 p-2 rounded-md"
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
          className="bg-gray-700 text-gray-200 p-2 rounded-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-600">
          <thead>
            <tr className="bg-gray-600">
              <th className="p-2">Date</th>
              <th className="p-2">Type</th>
              <th className="p-2">Product</th>
              <th className="p-2">Bottles</th>
              <th className="p-2">Liters</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log._id} className="border-t border-gray-600">
                <td className="p-2">{new Date(log.date).toLocaleDateString()}</td>
                <td className="p-2">{log.transactionType}</td>
                <td className="p-2">{log.productId?.productName || log.productId}</td>
                <td className="p-2">{log.quantityBottles}</td>
                <td className="p-2">{(log.quantityMl / 1000).toFixed(2)} L</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
