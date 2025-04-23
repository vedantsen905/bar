'use client';
import { useEffect, useState } from 'react';

export default function SalesSummary() {
  const [summary, setSummary] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: 'today',
    product: '',
    transactionType: 'Sales',
  });
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // Fetch products and inventory logs
      const [productsRes, logsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/inventory')
      ]);
      const products = await productsRes.json();
      const logs = await logsRes.json();

      // Store the products for filtering purposes
      setProducts(products);

      // Get today's date and filter logs by selected date range
      const today = new Date().toISOString().split("T")[0];
      let filteredLogs = logs;

      // Apply filters based on date range
      if (filters.dateRange === 'today') {
        filteredLogs = logs.filter(log => log.date === today);
      } else if (filters.dateRange === 'last7days') {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const last7DaysString = last7Days.toISOString().split("T")[0];
        filteredLogs = logs.filter(log => log.date >= last7DaysString);
      } else if (filters.dateRange === 'thisMonth') {
        const firstDayOfMonth = new Date(today);
        firstDayOfMonth.setDate(1);
        const firstDayOfMonthString = firstDayOfMonth.toISOString().split("T")[0];
        filteredLogs = logs.filter(log => log.date >= firstDayOfMonthString);
      }

      // Further filter logs based on selected product and transaction type
      const data = products.map(product => {
        if (filters.product && product._id !== filters.product) {
          return null; // Skip product if it doesn't match filter
        }

        // Filter logs for the selected product and transaction type
        const productLogs = filteredLogs.filter(log => log.productId?._id === product._id && 
          (filters.transactionType === 'All' || log.transactionType === filters.transactionType));

        // Calculate sold and purchase quantities with checks to avoid negative values
        const sold = Math.max(
          productLogs.filter(log => log.transactionType === 'Sales').reduce((acc, log) => acc + Math.abs(log.quantityBottles), 0),
          0 // Ensure the value is not negative
        );
        const purchased = Math.max(
          productLogs.filter(log => log.transactionType === 'Purchase').reduce((acc, log) => acc + Math.abs(log.quantityBottles), 0),
          0 // Ensure the value is not negative
        );
        const opening = Math.max(
          productLogs.filter(log => log.transactionType === 'Opening Stock').reduce((acc, log) => acc + Math.abs(log.quantityBottles), 0),
          0 // Ensure the value is not negative
        );

        const remaining = Math.max(opening + purchased - sold, 0); // Prevent remaining from being negative

        return {
          name: product.productName,
          sold,
          purchased,
          remaining,
          remainingLiters: (remaining * product.mlPerBottle) / 1000
        };
      }).filter(item => item !== null); // Remove null entries (products not matching filters)

      setSummary(data);
    }
    fetchData();
  }, [filters]); // Re-run when filters change

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  return (
    <div className="mt-8 bg-gray-800 text-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Sales Summary (Filtered)</h2>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <div>
          <label htmlFor="dateRange" className="block text-sm mb-2">Date Range</label>
          <select
            id="dateRange"
            name="dateRange"
            value={filters.dateRange}
            onChange={handleFilterChange}
            className="p-2 bg-gray-700 text-white border border-gray-600 rounded"
          >
            <option value="today">Today</option>
            <option value="last7days">Last 7 Days</option>
            <option value="thisMonth">This Month</option>
          </select>
        </div>

        <div>
          <label htmlFor="product" className="block text-sm mb-2">Product</label>
          <select
            id="product"
            name="product"
            value={filters.product}
            onChange={handleFilterChange}
            className="p-2 bg-gray-700 text-white border border-gray-600 rounded"
          >
            <option value="">All Products</option>
            {products.map(product => (
              <option key={product._id} value={product._id}>{product.productName}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="transactionType" className="block text-sm mb-2">Transaction Type</label>
          <select
            id="transactionType"
            name="transactionType"
            value={filters.transactionType}
            onChange={handleFilterChange}
            className="p-2 bg-gray-700 text-white border border-gray-600 rounded"
          >
            <option value="Sales">Sales</option>
            <option value="Purchase">Purchase</option>
            <option value="Opening Stock">Opening Stock</option>
            <option value="Closing Stock">Closing Stock</option>
            <option value="All">All</option> {/* Added 'All' option */}
          </select>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm border border-gray-600">
        <thead>
          <tr className="bg-gray-700">
            <th className="py-3 px-4">Product</th>
            <th className="py-3 px-4">Sold</th>
            <th className="py-3 px-4">Purchased</th> {/* Added Purchased column */}
            <th className="py-3 px-4">Remaining Bottles</th>
            <th className="py-3 px-4">Remaining Liters</th>
          </tr>
        </thead>
        <tbody>
          {summary.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4">No data available</td>
            </tr>
          ) : (
            summary.map((item) => (
              <tr key={item.name} className="border-t border-gray-600 hover:bg-gray-700">
                <td className="py-2 px-4">{item.name}</td>
                <td className="py-2 px-4">{item.sold}</td>
                <td className="py-2 px-4">{item.purchased}</td> {/* Display Purchased */}
                <td className="py-2 px-4">{item.remaining}</td>
                <td className="py-2 px-4">{item.remainingLiters.toFixed(2)} L</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
