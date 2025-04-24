'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';

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

  useEffect(() => {
    async function fetchData() {
      const [productsRes, logsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/inventory'),
      ]);
      const products = await productsRes.json();
      const logs = await logsRes.json();

      setProducts(products);
      setLogs(logs);

      const today = new Date().toISOString().split('T')[0];
      let filteredLogs = logs;

      if (filters.dateRange === 'today') {
        filteredLogs = logs.filter((log) => log.date === today);
      } else if (filters.dateRange === 'last7days') {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const last7DaysString = last7Days.toISOString().split('T')[0];
        filteredLogs = logs.filter((log) => log.date >= last7DaysString);
      } else if (filters.dateRange === 'thisMonth') {
        const firstDayOfMonth = new Date(today);
        firstDayOfMonth.setDate(1);
        const firstDayOfMonthString = firstDayOfMonth.toISOString().split('T')[0];
        filteredLogs = logs.filter((log) => log.date >= firstDayOfMonthString);
      }

      const data = products
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
    }

    fetchData();
  }, [filters]);

  const COLORS = ['#f87171', '#60a5fa', '#34d399'];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (log) => setEditingLog(log);

  const handleDelete = async (logId) => {
    const updatedLogs = logs.filter((log) => log._id !== logId);
    setLogs(updatedLogs);

    try {
      const response = await fetch(`/api/inventory/${logId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        console.error(`Failed to delete log with ID ${logId}:`, result);
        setLogs((prevLogs) => [...prevLogs]);
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      setLogs((prevLogs) => [...prevLogs]);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const updatedLogs = logs.map((log) => {
      if (log._id === editingLog._id) {
        return { ...log, quantityBottles: editingLog.quantityBottles };
      }
      return log;
    });

    setLogs(updatedLogs);

    try {
      const res = await fetch(`/api/inventory/${editingLog._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLog),
      });

      if (res.ok) {
        setEditingLog(null);
        setFilters({ ...filters });
      } else {
        console.error(`Failed to update log with ID ${editingLog._id}. Status: ${res.status}`);
        setLogs(logs);
      }
    } catch (error) {
      console.error('Error updating log:', error);
      setLogs(logs);
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-900 dark:text-white text-black p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Sales Summary (Filtered)</h2>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[{
          name: 'dateRange', label: 'Date Range', options: ['today', 'last7days', 'thisMonth']
        }, {
          name: 'product', label: 'Product', options: [''].concat(products.map(p => ({ value: p._id, label: p.productName })))
        }, {
          name: 'transactionType', label: 'Transaction Type', options: ['Sales', 'Purchase', 'Opening Stock', 'Closing Stock', 'All']
        }].map((filter, i) => (
          <div key={i}>
            <label className="block text-sm mb-2 capitalize" htmlFor={filter.name}>{filter.label}</label>
            <select
              name={filter.name}
              value={filters[filter.name]}
              onChange={handleFilterChange}
              className="w-full p-2 bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded"
            >
              {filter.options.map(opt => typeof opt === 'string' ? (
                <option key={opt} value={opt}>{opt === '' ? 'All Products' : opt}</option>
              ) : (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Sales & Inventory Bar Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', color: '#fff' }} wrapperStyle={{ zIndex: 50 }} />
              <Legend />
              <Bar dataKey="sold" stackId="a" fill="#f87171" name="Sold" />
              <Bar dataKey="purchased" stackId="a" fill="#60a5fa" name="Purchased" />
              <Bar dataKey="remaining" fill="#34d399" name="Remaining" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Total Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                dataKey="value"
                isAnimationActive={false}
                data={[
                  { name: 'Sold', value: summary.reduce((acc, i) => acc + i.sold, 0) },
                  { name: 'Purchased', value: summary.reduce((acc, i) => acc + i.purchased, 0) },
                  { name: 'Remaining', value: summary.reduce((acc, i) => acc + i.remaining, 0) }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full text-sm border border-gray-300 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              {['Product', 'Sold', 'Purchased', 'Remaining Bottles', 'Remaining Liters', 'Last Transaction Date', 'Actions'].map((th) => (
                <th key={th} className="py-3 px-4 text-left">{th}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summary.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4">No data available</td></tr>
            ) : summary.map((item) => (
              <tr key={item.name} className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
                <td className="py-2 px-4">{item.name}</td>
                <td className="py-2 px-4">{item.sold} <MdArrowUpward className="text-red-500 inline" /></td>
                <td className="py-2 px-4">{item.purchased} <MdArrowDownward className="text-blue-500 inline" /></td>
                <td className="py-2 px-4">{item.remaining}</td>
                <td className="py-2 px-4">{item.remainingLiters.toFixed(2)} L</td>
                <td className="py-2 px-4">{item.latestDate}</td>
                <td className="py-2 px-4 space-x-2">
                  {item.logs.length > 0 && (
                    <>
                      <button onClick={() => handleEdit(item.logs[0])} className="bg-blue-600 px-3 py-2 rounded text-white">Edit</button>
                      <button onClick={() => handleDelete(item.logs[0]._id)} className="bg-red-600 px-3 py-2 rounded text-white">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 text-black dark:text-white p-6 rounded-lg w-96 shadow-lg"
            >
              <h3 className="text-xl mb-4 font-semibold">Edit Log</h3>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-sm mb-2" htmlFor="quantityBottles">Quantity Bottles</label>
                  <input
                    type="number"
                    id="quantityBottles"
                    name="quantityBottles"
                    value={editingLog.quantityBottles}
                    onChange={(e) => setEditingLog({ ...editingLog, quantityBottles: e.target.value })}
                    className="w-full p-2 bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
                <div className="flex justify-between">
                  <button type="submit" className="bg-green-600 px-4 py-2 rounded text-white">Save</button>
                  <button type="button" onClick={() => setEditingLog(null)} className="bg-gray-500 px-4 py-2 rounded text-white">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
