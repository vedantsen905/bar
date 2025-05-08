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
   });
   const [products, setProducts] = useState([]);
   const [editingLog, setEditingLog] = useState(null);
   const [logs, setLogs] = useState([]);
   const [isFilterOpen, setIsFilterOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [activeTab, setActiveTab] = useState('summary');
   const [lastUpdated, setLastUpdated] = useState(null);
  //  const router = useRouter();

 
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
  //  const { setIsLoggedIn } = useAuth();

  const handleLogout = () => {
    // 1. Clear token from storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    
    // 2. Update state
    setIsLoggedIn(false);
    
    // 3. Force full page reload to reset all states
    window.location.href = '/login'; // Using window.location ensures complete reset
  };

  // Redirect if not logged in
  if (!isLoggedIn) {
    router.push('/login');
    return null; // Return nothing while redirecting
  }
   useEffect(() => {
     fetchData();
     // Set up real-time polling every 30 seconds
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
  
      // Debug: Check the first few log dates
      console.log('Sample log dates:', logsData.slice(0, 3).map(log => log.date));
      
      if (productsData && Array.isArray(productsData.products)) {
        setProducts(productsData.products);
      } else {
        console.error("Fetched products is not an array:", productsData);
      }
  
      setLogs(logsData);
      setLastUpdated(new Date());
  
      // Get current date in YYYY-MM-DD format
      const today = new Date();
      // Convert to local date string in YYYY-MM-DD format
      const todayString = today.toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format
      
      console.log("Today's date string:", todayString);
  
      let filteredLogs = logsData.filter(log => 
        log.transactionType === 'Sales' || 
        log.transactionType === 'Opening Stock' || 
        log.transactionType === 'Closing Stock' ||
        log.transactionType === 'Purchase'
      );
  
      if (filters.dateRange === 'today') {
        filteredLogs = filteredLogs.filter((log) => {
          // Normalize the log date to YYYY-MM-DD format for comparison
          const logDate = new Date(log.date);
          const logDateString = logDate.toLocaleDateString('en-CA');
          console.log(`Comparing: ${logDateString} === ${todayString}`);
          return logDateString === todayString;
        });
        console.log('Filtered logs for today:', filteredLogs);
      } else if (filters.dateRange === 'last7days') {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const last7DaysString = last7Days.toLocaleDateString('en-CA');
        filteredLogs = filteredLogs.filter((log) => {
          const logDate = new Date(log.date);
          return logDate >= last7Days;
        });
      } else if (filters.dateRange === 'thisMonth') {
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        filteredLogs = filteredLogs.filter((log) => {
          const logDate = new Date(log.date);
          return logDate >= firstDayOfMonth;
        });
      }
  
      // Rest of your code remains the same...
      const data = productsData.products
        .map((product) => {
          if (filters.product && product._id !== filters.product) return null;
  
          const productLogs = filteredLogs.filter(
            (log) => log.productId?._id === product._id
          );
  
          // Find latest opening and closing stock
          const openingStock = productLogs
            .filter(log => log.transactionType === 'Opening Stock')
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  
          const closingStock = productLogs
            .filter(log => log.transactionType === 'Closing Stock')
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  
          const sales = productLogs
            .filter(log => log.transactionType === 'Sales' || (!isAdmin && log.transactionType === 'Purchase'))
            .reduce((acc, log) => acc + Math.abs(log.quantityBottles), 0);
  
          const purchases = isAdmin ? 
            productLogs
              .filter(log => log.transactionType === 'Purchase')
              .reduce((acc, log) => acc + Math.abs(log.quantityBottles), 0) :
            0;
  
          const remaining = closingStock ? closingStock.quantityBottles : 
            (openingStock ? openingStock.quantityBottles + (isAdmin ? purchases : 0) - sales : 0);
          
          const latestDate = productLogs.length > 0
            ? productLogs.reduce((latest, log) => (log.date > latest ? log.date : latest), productLogs[0].date)
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
 
   const refreshData = () => {
     fetchData();
   };

   useEffect(() => {
    // Fetch data immediately
    fetchData();
    
    // Then check for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    
    // Clean up on component unmount
    return () => clearInterval(interval);
  }, [filters]); // Still watch for filter changes
    
 
   // Stats cards data
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
 
   // Data for radial chart
   const radialData = summary.slice(0, 5).map((item, index) => ({
     name: item.name,
     value: item.sold,
     fill: COLORS[index % COLORS.length]
   }));
 
   return (
     <div className="mt-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 dark:text-white text-gray-900 p-4 rounded-xl">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
         <div>
           <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
             Inventory Dashboard
           </h2>
           <p className="text-gray-500 dark:text-gray-400">
             {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading data...'}
           </p>
         </div>
         
         <div className="flex gap-2">
           <button 
             onClick={toggleFilterPanel}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all ${
               isFilterOpen 
                 ? 'bg-indigo-600 text-white' 
                 : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
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
           {/* <button 
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg shadow-sm hover:bg-rose-700 transition-all"
    >
      <MdLogout /> Logout
    </button> */}
         </div>
       </div> 
 
       {/* Filter Panel */}
       <AnimatePresence>
         {isFilterOpen && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="overflow-hidden mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700"
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
                   { value: 'Closing Stock', label: 'Closing Stock' }
                 ]
               }].map((filter, i) => (
                 <div key={i}>
                   <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300" htmlFor={filter.name}>{filter.label}</label>
                   <select
                     name={filter.name}
                     value={filters[filter.name]}
                     onChange={handleFilterChange}
                     className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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
           <motion.div 
             key={index} 
             whileHover={{ y: -5 }}
             className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
           >
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                 <p className="text-2xl font-bold mt-1">{stat.value}</p>
               </div>
               <div className={`p-3 rounded-full ${stat.color} bg-opacity-20`}>
                 {stat.icon}
               </div>
             </div>
             <div className={`mt-2 text-sm flex items-center ${stat.isPositive ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
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
                   : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 lg:col-span-2">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-semibold">Inventory Overview</h3>
                 <div className="flex items-center gap-2">
                   <span className="flex items-center text-sm">
                     <span className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></span>
                     Sold
                   </span>
                   <span className="flex items-center text-sm">
                     <span className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></span>
                     Purchased
                   </span>
                   <span className="flex items-center text-sm">
                     <span className="w-3 h-3 rounded-full bg-purple-500 mr-1"></span>
                     Remaining
                   </span>
                 </div>
               </div>
               <div className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={summary} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.5} />
                     <XAxis 
                       dataKey="name" 
                       stroke="#6B7280" 
                       tick={{ fontSize: 12 }}
                       tickLine={false}
                     />
                     <YAxis 
                       stroke="#6B7280" 
                       tick={{ fontSize: 12 }}
                       tickLine={false}
                     />
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
                     <Bar dataKey="sold" name="Sold" radius={[4, 4, 0, 0]} fill="#6366F1" />
                     <Bar dataKey="purchased" name="Purchased" radius={[4, 4, 0, 0]} fill="#10B981" />
                     <Bar dataKey="remaining" name="Remaining" radius={[4, 4, 0, 0]} fill="#8B5CF6" />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             </div>
 
             {/* Radial Bar Chart */}
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border-2 border-indigo-100 dark:border-gray-700">
  <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
    INVENTORY FLOW
  </h3>
  <div className="h-[500px] relative">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={[
          { name: 'Opening', value: summary.reduce((a,b) => a + (b.logs.find(l => l.transactionType === 'Opening Stock')?.quantityBottles || 0), 0) },
          { name: 'Purchased', value: summary.reduce((a,b) => a + b.purchased, 0) },
          { name: 'Available', value: summary.reduce((a,b) => a + (b.logs.find(l => l.transactionType === 'Opening Stock')?.quantityBottles || 0) + b.purchased, 0) },
          { name: 'Sold', value: summary.reduce((a,b) => a + b.sold, 0) },
          { name: 'Closing', value: summary.reduce((a,b) => a + b.remaining, 0) }
        ]}
        margin={{ top: 30, right: 30, left: 30, bottom: 30 }}
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
          strokeWidth={3}
          fill="url(#funnelGradient)"
          fillOpacity={0.85}
          animationDuration={2000}
        />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12, fontWeight: 'bold' }}
        />
        <YAxis />
        <Tooltip
          contentStyle={{
            background: 'rgba(30, 41, 59, 0.95)',
            borderRadius: '12px',
            border: 'none'
          }}
          formatter={(value) => [
            <div className="text-center p-2">
              <div className="text-2xl font-bold text-indigo-300">{value}</div>
              <div className="text-sm text-gray-300">bottles</div>
            </div>
          ]}
        />
      </AreaChart>
    </ResponsiveContainer>
    <div className="absolute top-6 right-6 bg-indigo-600/10 backdrop-blur-sm px-3 py-1 rounded-full border border-indigo-400/30">
      <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">
        INVENTORY MOVEMENT
      </span>
    </div>
  </div>
</div>
 
             {/* Pie Chart */}
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 lg:col-span-2">
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
                       label={renderCustomizedLabel}
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
                       formatter={(value) => (
                         <span className="text-gray-700 dark:text-gray-300 text-sm">
                           {value}
                         </span>
                       )}
                     />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
             </div>
 
             {/* Area Chart */}
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
               <h3 className="text-lg font-semibold mb-4">Inventory Trend</h3>
               <div className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart
                     data={summary.slice(0, 5).map(item => ({
                       name: item.name,
                       sold: item.sold,
                       purchased: item.purchased
                     }))}
                     margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                   >
                     <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
                     <XAxis dataKey="name" stroke="#6B7280" />
                     <YAxis stroke="#6B7280" />
                     <Tooltip 
                       contentStyle={{ 
                         backgroundColor: '#1F2937', 
                         color: '#fff',
                         borderRadius: '0.5rem',
                         border: 'none'
                       }}
                     />
                     <Area type="monotone" dataKey="sold" stackId="1" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} />
                     <Area type="monotone" dataKey="purchased" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
             </div>
           </div>
         )}
 
         {activeTab === 'details' && (
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
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
                             <FiTrendingUp className="ml-1 text-emerald-500" />
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                           <div className="flex items-center">
                             {item.purchased}
                             <FiTrendingDown className="ml-1 text-blue-500" />
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
                                   className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                 >
                                   <MdEdit className="text-lg" />
                                 </button>
                                 <button
                                   onClick={() => handleDelete(item.logs[0]._id)}
                                   className="text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 p-1 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30"
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
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
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
                         (log.transactionType === 'Sales' || 
                          log.transactionType === 'Purchase' || 
                          log.transactionType === 'Opening Stock' || 
                          log.transactionType === 'Closing Stock')
                       )
                       .map((log) => (
                       <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                           {log.productId?.productName || 'N/A'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                           <span className={`px-2 py-1 rounded-full text-xs ${
                             log.transactionType === 'Sales' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' :
                             log.transactionType === 'Purchase' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                             log.transactionType === 'Opening Stock' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                             'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
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
                               className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                             >
                               <MdEdit className="text-lg" />
                             </button>
                             <button
                               onClick={() => handleDelete(log._id)}
                               className="text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 p-1 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30"
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
               className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700"
             >
               <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                 <h3 className="text-lg font-semibold">Edit Inventory Log</h3>
                 <button 
                   onClick={handleCancelEdit} 
                   className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                 >
                   <MdClose className="text-xl" />
                 </button>
               </div>
               
               <form onSubmit={handleEditSubmit} className="p-4">
                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Product</label>
                     <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200">
                       {editingLog.productId?.productName || 'N/A'}
                     </div>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Transaction Type</label>
                     <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200">
                       {editingLog.transactionType}
                     </div>
                   </div>
                   
                   <div>
                     <label htmlFor="quantityBottles" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Quantity (Bottles)</label>
                     <input
                       type="number"
                       id="quantityBottles"
                       name="quantityBottles"
                       value={editingLog.quantityBottles}
                       onChange={(e) => setEditingLog({ ...editingLog, quantityBottles: parseInt(e.target.value) || 0 })}
                       className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 transition-all"
                       min="0"
                       required
                     />
                   </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date</label>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200">
                      {editingLog.date}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
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