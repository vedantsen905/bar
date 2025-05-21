 'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar
} from 'recharts';
import { MdArrowUpward, MdArrowDownward, MdFilterAlt, MdEdit, MdDelete, MdClose, MdSave, MdInventory } from 'react-icons/md';
import { FiRefreshCw, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { BiSolidDashboard, BiPurchaseTagAlt } from 'react-icons/bi';
import { IoMdPie, IoMdStats } from 'react-icons/io';
import { BsGraphUpArrow, BsBoxSeam } from 'react-icons/bs';
import { useRouter } from 'next/navigation'
import { MdLogout } from 'react-icons/md';
import { useAuth } from '@/context/AuthContext';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker'; // Add this import
import 'react-datepicker/dist/react-datepicker.css'; // Add styles for DatePicker

export default function SalesSummary({isAdmin }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  });
  const router = useRouter();

  const [summary, setSummary] = useState([]);
  const [filters, setFilters] = useState({
  dateRange: 'today',
  product: '',
  transactionType: 'Sales',
  customStartDate: null,
  customEndDate: null,
  selectedMonth: new Date().getMonth(),
  selectedYear: new Date().getFullYear()
});
  const [products, setProducts] = useState([]);
  const [editingLog, setEditingLog] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [lastUpdated, setLastUpdated] = useState(null);

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#10B981', '#3B82F6'];
  const RADIAN = Math.PI / 180;

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  if (!isLoggedIn) {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [filters]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [productsRes, logsRes] = await Promise.all([
        fetch('/api/products', { cache: 'no-store' }),
        fetch('/api/inventory', { cache: 'no-store' }),
      ]);
  
      if (!productsRes.ok || !logsRes.ok) {
        throw new Error('Failed to fetch data');
      }
  
      const productsData = await productsRes.json();
      const logsData = await logsRes.json();
  
      console.log('Sample log dates:', logsData.slice(0, 3).map(log => log.date));
      
      if (productsData && Array.isArray(productsData.products)) {
        setProducts(productsData.products);
      } else {
        console.error("Fetched products is not an array:", productsData);
      }
  
      setLogs(logsData);
      setLastUpdated(new Date());;
  
       
        const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];
    
    console.log("Today's date string:", todayString);
  
      let filteredLogs = logsData.filter(log => 
        log.transactionType === 'Sales' || 
        log.transactionType === 'Opening Stock' || 
        log.transactionType === 'Closing Stock' ||
        log.transactionType === 'Purchase'
      );
  
      if (filters.dateRange === 'today') {
        filteredLogs = filteredLogs.filter((log) => {
          const logDate = new Date(log.date);
          const logDateString = logDate.toISOString().split('T')[0];
          console.log(`Comparing: ${logDateString} === ${todayString}`);
          return logDateString === todayString;
        });
        console.log('Filtered logs for today:', filteredLogs);
      } 

switch(filters.dateRange) {
  case 'today':
    filteredLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.toDateString() === today.toDateString();
    });
    break;
  
  case 'yesterday':
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    filteredLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.toDateString() === yesterday.toDateString();
    });
    break;
  
  case 'last7days':
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    filteredLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= last7Days && logDate <= today;
    });
    break;
  
  case 'thisMonth':
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    filteredLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= firstDayOfMonth && logDate <= today;
    });
    break;
  
  case 'lastMonth':
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    filteredLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= firstDayLastMonth && logDate <= lastDayLastMonth;
    });
    break;
  
  case 'custom':
    if (filters.customStartDate && filters.customEndDate) {
      const start = new Date(filters.customStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.customEndDate);
      end.setHours(23, 59, 59, 999);
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= start && logDate <= end;
      });
    }
    break;
  
  case 'monthSelect':
    const firstDayOfSelectedMonth = new Date(filters.selectedYear, filters.selectedMonth, 1);
    const lastDayOfSelectedMonth = new Date(filters.selectedYear, filters.selectedMonth + 1, 0);
    lastDayOfSelectedMonth.setHours(23, 59, 59, 999);
    filteredLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= firstDayOfSelectedMonth && logDate <= lastDayOfSelectedMonth;
    });
    break;
  
  default:
    break;
}
  
      const data = productsData.products
        .map((product) => {
          if (filters.product && product._id !== filters.product) return null;

          const productLogs = filteredLogs.filter(
            (log) => log.productId?._id === product._id
          );

          const openingStock = productLogs
            .filter((log) => log.transactionType === 'Opening Stock')
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

          const openingQty = openingStock?.quantityBottles || 0;

          const purchases = productLogs
            .filter((log) => log.transactionType === 'Purchase')
            .reduce((acc, log) => acc + Math.abs(log.quantityBottles), 0);

          const closingStockLog = productLogs
            .filter((log) => log.transactionType === 'Closing Stock')
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

          let closingQty = closingStockLog?.quantityBottles;

          if (closingQty === undefined) {
            const rawSales = productLogs
              .filter((log) => log.transactionType === 'Sales')
              .reduce((acc, log) => acc + Math.abs(log.quantityBottles), 0);

            closingQty = openingQty + purchases - rawSales;
          }

          const sales = openingQty + purchases - closingQty;
          const remaining = closingQty;

          const latestDate =
            productLogs.length > 0
              ? productLogs.reduce(
                  (latest, log) => (log.date > latest ? log.date : latest),
                  productLogs[0].date
                )
              : '-';

          return {
            id: product._id,
            name: product.productName,
            sold: sales,
            purchased: purchases,
            remaining,
            remainingLiters: (remaining * product.mlPerBottle) / 1000,
            latestDate,
            logs: productLogs,
            opening: openingQty,
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
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setLogs(logs.filter((log) => log._id !== logId));
        fetchData();
      } else {
        const result = await response.json();
        console.error(`Failed to delete log with ID ${logId}:`, result);
        alert('Failed to delete log. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('An error occurred while deleting the log.');
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
        await fetchData();
      } else {
        console.error(`Failed to update log with ID ${editingLog._id}. Status: ${res.status}`);
        const result = await res.json();
        alert(result.message || 'Failed to update log. Please try again.');
      }
    } catch (error) {
      console.error('Error updating log:', error);
      alert('An error occurred while updating the log.');
    }
  };

  const toggleFilterPanel = () => setIsFilterOpen(!isFilterOpen);
  const refreshData = () => fetchData();

  const handleDownloadExcel = () => {
    const excelData = summary.map((item) => ({
      Product: item.name,
      Opening: item.opening,
      Sold: item.sold,
      Purchased: item.purchased,
      'Remaining (Bottles)': item.remaining,
      'Remaining (Liters)': item.remainingLiters.toFixed(2),
      'Last Transaction': item.latestDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Summary');
    XLSX.writeFile(workbook, 'Inventory_Summary.xlsx');
  };

  const stats = [
    {
      title: isAdmin ? "Total Sold" : "Total Transactions",
      value: summary.reduce((acc, item) => acc + item.sold, 0),
      change: "+12%",
      isPositive: true,
      icon: <FiTrendingUp className="text-2xl" />,
      color: "text-emerald-500"
    },
    isAdmin && {
      title: "Total Purchased",
      value: summary.reduce((acc, item) => acc + item.purchased, 0),
      change: "+5%",
      isPositive: true,
      icon: <BiPurchaseTagAlt className="text-2xl" />,
      color: "text-blue-500"
    },
    {
      title: "Total Remaining",
      value: summary.reduce((acc, item) => acc + item.remaining, 0),
      change: "-3%",
      isPositive: false,
      icon: <BsBoxSeam className="text-2xl" />,
      color: "text-indigo-500"
    },
    {
      title: "Active Products",
      value: summary.length,
      change: "+2%",
      isPositive: true,
      icon: <MdInventory className="text-2xl" />,
      color: "text-purple-500"
    }
  ].filter(Boolean);

  const radialData = summary.slice(0, 5).map((item, index) => ({
    name: item.name,
    value: item.sold,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="mt-4 bg-[#C19A6B] text-gray-900 p-4 rounded-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Inventory Dashboard
          </h2>
          <p className="text-gray-700">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading data...'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={toggleFilterPanel}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all ${
              isFilterOpen 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            <MdFilterAlt /> Filters
          </button>
          <button 
            onClick={refreshData}
            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg shadow-sm hover:shadow transition-all ${
              isLoading ? 'animate-spin' : ''
            }`}
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
    className="overflow-hidden mb-6 bg-white rounded-xl shadow-md p-4 border border-gray-200"
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Date Range Selector */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Date Range</label>
        <select
          name="dateRange"
          value={filters.dateRange}
          onChange={handleFilterChange}
          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7days">Last 7 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="custom">Custom Range</option>
          <option value="monthSelect">Select Month</option>
        </select>
      </div>

      {/* Custom Date Range - shown only when 'custom' is selected */}
      {filters.dateRange === 'custom' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
            <DatePicker
              selected={filters.customStartDate}
              onChange={(date) => setFilters({...filters, customStartDate: date})}
              selectsStart
              startDate={filters.customStartDate}
              endDate={filters.customEndDate}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholderText="Select start date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">End Date</label>
            <DatePicker
              selected={filters.customEndDate}
              onChange={(date) => setFilters({...filters, customEndDate: date})}
              selectsEnd
              startDate={filters.customStartDate}
              endDate={filters.customEndDate}
              minDate={filters.customStartDate}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholderText="Select end date"
            />
          </div>
        </>
      )}

      {/* Month/Year Selector - shown only when 'monthSelect' is chosen */}
      {filters.dateRange === 'monthSelect' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Month</label>
            <select
              name="selectedMonth"
              value={filters.selectedMonth}
              onChange={handleFilterChange}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i} value={i}>
                  {new Date(0, i).toLocaleString('default', {month: 'long'})}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Year</label>
            <select
              name="selectedYear"
              value={filters.selectedYear}
              onChange={handleFilterChange}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Array.from({length: 10}, (_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
        </>
      )}

      {/* Product Filter */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Product</label>
        <select
          name="product"
          value={filters.product}
          onChange={handleFilterChange}
          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Products</option>
          {products.map(p => (
            <option key={p._id} value={p._id}>{p.productName}</option>
          ))}
        </select>
      </div>

      {/* Transaction Type Filter */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Transaction Type</label>
        <select
          name="transactionType"
          value={filters.transactionType}
          onChange={handleFilterChange}
          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="Sales">Sales</option>
          <option value="Purchase">Purchase</option>
          <option value="Opening Stock">Opening Stock</option>
          <option value="Closing Stock">Closing Stock</option>
        </select>
      </div>
    </div>
  </motion.div>
)}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={index} 
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-20`}>
                {stat.icon}
              </div>
            </div>
            <div className={`mt-2 text-sm flex items-center ${stat.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {stat.isPositive ? (
                <FiTrendingUp className="mr-1" />
              ) : (
                <FiTrendingDown className="mr-1" />
              )}
              {stat.change} from last period
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'summary', icon: <IoMdStats className="mr-2" />, label: 'Summary' },
            { id: 'details', icon: <BsGraphUpArrow className="mr-2" />, label: 'Details' },
            { id: 'logs', icon: <IoMdPie className="mr-2" />, label: 'Logs' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 lg:col-span-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="text-lg font-semibold">Inventory Overview</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center text-xs sm:text-sm">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></span>
                    Sold
                  </span>
                  <span className="flex items-center text-xs sm:text-sm">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></span>
                    Purchased
                  </span>
                  <span className="flex items-center text-xs sm:text-sm">
                    <span className="w-3 h-3 rounded-full bg-purple-500 mr-1"></span>
                    Remaining
                  </span>
                </div>
              </div>
              <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={summary} 
                    margin={{ 
                      top: 20, 
                      right: 20, 
                      left: 20, 
                      bottom: summary.length > 5 ? 70 : 40
                    }}
                    barCategoryGap="15%"
                    layout={summary.length > 8 ? "vertical" : "horizontal"}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={summary.length <= 8} stroke="#E5E7EB" strokeOpacity={0.5} />
                    {summary.length > 8 ? (
                      <YAxis 
                        dataKey="name"
                        type="category"
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        width={100}
                      />
                    ) : (
                      <XAxis 
                        dataKey="name"
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        interval={0}
                        angle={summary.length > 5 ? -45 : 0}
                        dx={summary.length > 5 ? -10 : 0}
                        dy={summary.length > 5 ? 20 : 0}
                        height={summary.length > 5 ? 70 : 40}
                      />
                    )}
                    {summary.length > 8 ? (
                      <XAxis 
                        type="number"
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                    ) : (
                      <YAxis 
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        width={40}
                      />
                    )}
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        color: '#fff',
                        borderRadius: '0.5rem',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }} 
                      wrapperStyle={{ zIndex: 50 }} 
                      cursor={{ fill: 'rgba(165, 180, 252, 0.2)' }}
                    />
                    <Bar 
                      dataKey="sold" 
                      name="Sold" 
                      radius={[4, 4, 0, 0]} 
                      fill="#6366F1" 
                      maxBarSize={40}
                    />
                    <Bar 
                      dataKey="purchased" 
                      name="Purchased" 
                      radius={[4, 4, 0, 0]} 
                      fill="#10B981" 
                      maxBarSize={40}
                    />
                    <Bar 
                      dataKey="remaining" 
                      name="Remaining" 
                      radius={[4, 4, 0, 0]} 
                      fill="#8B5CF6" 
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radial Bar Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl border-2 border-indigo-100">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                INVENTORY FLOW
              </h3>
              <div className="h-[280px] sm:h-[350px] lg:h-[500px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { name: 'Opening', value: summary.reduce((a,b) => a + (b.logs.find(l => l.transactionType === 'Opening Stock')?.quantityBottles || 0), 0) },
                      { name: 'Purchased', value: summary.reduce((a,b) => a + b.purchased, 0) },
                      { name: 'Available', value: summary.reduce((a,b) => a + (b.logs.find(l => l.transactionType === 'Opening Stock')?.quantityBottles || 0) + b.purchased, 0) },
                      { name: 'Sold', value: summary.reduce((a,b) => a + b.sold, 0) },
                      { name: 'Closing', value: summary.reduce((a,b) => a + b.remaining, 0) }
                    ]}
                    margin={{ 
                      top: 20, 
                      right: 20, 
                      left: 20, 
                      bottom: 30
                    }}
                  >
                    <defs>
                      <linearGradient id="funnelGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#6366F1"
                      strokeWidth={2}
                      fill="url(#funnelGradient)"
                      fillOpacity={0.85}
                      animationDuration={2000}
                    />
                    <XAxis 
                      dataKey="name" 
                      tick={{ 
                        fontSize: 10,
                        fontWeight: 'bold',
                        fill: '#6B7280'
                      }}
                      interval={0}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(30, 41, 59, 0.95)',
                        borderRadius: '12px',
                        border: 'none'
                      }}
                      formatter={(value) => [
                        <div className="text-center p-2">
                          <div className="text-lg sm:text-xl font-bold text-indigo-300">{value}</div>
                          <div className="text-xs sm:text-sm text-gray-300">bottles</div>
                        </div>
                      ]}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="absolute top-4 right-4 bg-indigo-600/10 backdrop-blur-sm px-2 py-1 rounded-full border border-indigo-400/30">
                  <span className="text-xs font-semibold text-indigo-800">
                    INVENTORY MOVEMENT
                  </span>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 lg:col-span-2">
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
                      label={({ name, percent }) => {
                        return percent > 0.1 ? `${name}: ${(percent * 100).toFixed(0)}%` : '';
                      }}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} stroke="#1F2937" strokeWidth={1} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => {
                        const total = summary.reduce((acc, item) => acc + item.sold + item.purchased + item.remaining, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
                        return [`${value} (${percentage}%)`, name];
                      }}
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        color: '#fff',
                        borderRadius: '0.5rem',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Legend 
                      layout="horizontal"
                      verticalAlign="bottom"
                      height={40}
                      wrapperStyle={{
                        paddingTop: '20px'
                      }}
                      formatter={(value) => (
                        <span className="text-xs sm:text-sm text-gray-700">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area Chart */}
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Inventory Trend</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={summary.map(item => ({
                      name: item.name,
                      sold: item.sold,
                      purchased: item.purchased,
                      remaining: item.remaining
                    }))}
                    margin={{ 
                      top: 20, 
                      right: 20, 
                      left: 30,
                      bottom: summary.length > 5 ? 100 : 70
                    }}
                    layout={summary.length > 8 ? "vertical" : "horizontal"}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
                    
                    {summary.length > 8 ? (
                      <>
                        <YAxis 
                          dataKey="name" 
                          type="category"
                          stroke="#6B7280"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          width={120}
                          interval={0}
                        />
                        <XAxis 
                          type="number"
                          stroke="#6B7280"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                        />
                      </>
                    ) : (
                      <>
                        <XAxis 
                          dataKey="name"
                          stroke="#6B7280"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          interval={0}
                          angle={summary.length > 4 ? -45 : 0}
                          dx={summary.length > 4 ? -10 : 0}
                          dy={summary.length > 4 ? 25 : 10}
                          height={summary.length > 4 ? 80 : 40}
                        />
                        <YAxis 
                          stroke="#6B7280"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          width={40}
                        />
                      </>
                    )}

                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        color: '#fff',
                        borderRadius: '0.5rem',
                        border: 'none',
                        minWidth: '220px',
                        padding: '12px'
                      }}
                      formatter={(value, name, props) => {
                        const total = props.payload.sold + props.payload.purchased + props.payload.remaining;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return [
                          <div key="tooltip-content" className="space-y-2">
                            <div className="font-bold text-lg text-indigo-300 border-b border-gray-600 pb-1">
                              {props.payload.name}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-sm">Sold:</div>
                              <div className="text-right font-medium">
                                {props.payload.sold} <span className="text-xs text-gray-400">({((props.payload.sold/total)*100).toFixed(1)}%)</span>
                              </div>
                              <div className="text-sm">Purchased:</div>
                              <div className="text-right font-medium">
                                {props.payload.purchased} <span className="text-xs text-gray-400">({((props.payload.purchased/total)*100).toFixed(1)}%)</span>
                              </div>
                              <div className="text-sm">Remaining:</div>
                              <div className="text-right font-medium">
                                {props.payload.remaining} <span className="text-xs text-gray-400">({((props.payload.remaining/total)*100).toFixed(1)}%)</span>
                              </div>
                            </div>
                          </div>,
                          name
                        ];
                      }}
                    />

                    <Area 
                      type="monotone" 
                      dataKey="sold" 
                      name="Sold" 
                      stackId="1" 
                      stroke="#6366F1" 
                      fill="#6366F1" 
                      fillOpacity={0.3}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="purchased" 
                      name="Purchased" 
                      stackId="1" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.3}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />

                    <Legend 
                      verticalAlign="top" 
                      height={50}
                      wrapperStyle={{
                        paddingBottom: '10px'
                      }}
                      formatter={(value) => (
                        <span className="text-sm text-gray-700">
                          {value}
                        </span>
                      )}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'details' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="p-4">
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleDownloadExcel}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow"
                >
                  Download Excel
                </button>
              </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Product', 'Opening', 'Sold', 'Purchased', 'Remaining (Bottles)', 'Remaining (Liters)', 'Last Transaction', 'Actions'].map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summary.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                        {isLoading ? 'Loading data...' : 'No data available'}
                      </td>
                    </tr>
                  ) : (
                    summary.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.opening}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            {item.sold}
                            <FiTrendingUp className="ml-1 text-emerald-500" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            {item.purchased}
                            <FiTrendingDown className="ml-1 text-blue-500" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.remaining}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.remainingLiters.toFixed(2)} L
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.latestDate}
                        </td>
                        
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
  <div className="flex space-x-2">
    {item.logs.length > 0 && (
      <>
        <button
          onClick={() => handleEdit(item.logs[0])}
          className="text-amber-700 hover:text-amber-900 p-1 rounded-full hover:bg-amber-100"
        >
          <MdEdit className="text-lg" />
        </button>
        <button
          onClick={() => handleDelete(item.logs[0]._id)}
          className="text-amber-700 hover:text-amber-900 p-1 rounded-full hover:bg-amber-100"
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
  </div>
)}

 {activeTab === 'logs' && (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-amber-50">
          <tr>
            {['Product', 'Transaction Type', 'Quantity', 'Date', 'Actions'].map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                {isLoading ? 'Loading data...' : 'No logs available'}
              </td>
            </tr>
          ) : (
            logs
              .filter(log => 
                (filters.product ? log.productId?._id === filters.product : true) &&
                (log.transactionType === 'Sales' || 
                 log.transactionType === 'Purchase' || 
                 log.transactionType === 'Opening Stock' || 
                 log.transactionType === 'Closing Stock')
              )
              .map((log) => (
              <tr key={log._id} className="hover:bg-amber-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {log.productId?.productName || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    log.transactionType === 'Sales' ? 'bg-emerald-100 text-emerald-800' :
                    log.transactionType === 'Purchase' ? 'bg-blue-100 text-blue-800' :
                    log.transactionType === 'Opening Stock' ? 'bg-purple-100 text-purple-800' :
                    'bg-indigo-100 text-indigo-800'
                  }`}>
                    {log.transactionType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.quantityBottles} bottles
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(log)}
                      className="text-amber-700 hover:text-amber-900 p-1 rounded-full hover:bg-amber-100"
                    >
                      <MdEdit className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(log._id)}
                      className="text-amber-700 hover:text-amber-900 p-1 rounded-full hover:bg-amber-100"
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-amber-200"
      >
        <div className="flex justify-between items-center p-4 border-b border-amber-200 bg-amber-50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-amber-800">Edit Inventory Log</h3>
          <button 
            onClick={handleCancelEdit} 
            className="text-amber-700 hover:text-amber-900 p-1 rounded-full hover:bg-amber-100"
          >
            <MdClose className="text-xl" />
          </button>
        </div>
        
        <form onSubmit={handleEditSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-amber-800">Product</label>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-900">
                {editingLog.productId?.productName || 'N/A'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-amber-800">Transaction Type</label>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-900">
                {editingLog.transactionType}
              </div>
            </div>
            
            <div>
              <label htmlFor="quantityBottles" className="block text-sm font-medium mb-1 text-amber-800">Quantity (Bottles)</label>
              <input
                type="number"
                id="quantityBottles"
                name="quantityBottles"
                value={editingLog.quantityBottles}
                onChange={(e) => setEditingLog({ ...editingLog, quantityBottles: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                min="0"
                required
              />
            </div>
           
            <div>
              <label className="block text-sm font-medium mb-1 text-amber-800">Date</label>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-900">
                {editingLog.date}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-amber-300 rounded-lg text-sm font-medium text-amber-800 hover:bg-amber-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg text-sm font-medium hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
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