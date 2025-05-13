import mongoose from 'mongoose';

// Define the Inventory Log Schema
const inventoryLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,  // Changed to Date for better handling of time values
    required: true,
    default: Date.now  // Defaults to current timestamp if not provided
  },
  transactionType: {
    type: String,
    enum: ['Opening Stock', 'Purchase', 'Sales', 'Closing Stock'],
    required: true
  },
  quantityBottles: {
    type: Number,
    required: true
  },
  quantityMl: {
    type: Number,
    required: true
  },
  purchaseVendor: {
    type: String,
    required: false
  },
  purchaseReceiptNumber: {
    type: String,
    required: false
  },
  recordedBy: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Avoid overwriting the model if it already exists
let InventoryLog;
try {
  InventoryLog = mongoose.model('InventoryLog');
} catch (error) {
  InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);
}

export { InventoryLog };
















// const data = productsData.products
//   .map((product) => {
//     if (filters.product && product._id !== filters.product) return null;

//     const productLogs = filteredLogs.filter(
//       (log) => log.productId?._id === product._id
//     );

//     // Find latest opening and closing stock
//     const openingStock = productLogs
//       .filter(log => log.transactionType === 'Opening Stock')
//       .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

//     const closingStock = productLogs
//       .filter(log => log.transactionType === 'Closing Stock')
//       .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

//     const purchases = productLogs
//       .filter(log => log.transactionType === 'Purchase')
//       .reduce((acc, log) => acc + Math.abs(log.quantityBottles), 0);

//     // NEW CALCULATION: Sales = Opening + Purchases - Closing
//     const openingQty = openingStock?.quantityBottles || 0;
//     const closingQty = closingStock?.quantityBottles || 0;
//     const sales = openingQty + purchases - closingQty;

//     const remaining = closingQty;

//     const latestDate = productLogs.length > 0
//       ? productLogs.reduce((latest, log) => (log.date > latest ? log.date : latest), productLogs[0].date)
//       : '-';

//     return {
//       id: product._id,
//       name: product.productName,
//       sold: sales > 0 ? sales : 0, // Ensure sales is never negative
//       purchased: purchases,
//       remaining,
//       remainingLiters: (remaining * product.mlPerBottle) / 1000,
//       latestDate,
//       logs: productLogs,
//     };
//   })
//   .filter(Boolean);




//   const stats = [
//     {
//       title: "Total Sales",
//       value: summary.reduce((acc, item) => acc + item.sold, 0),
//       change: "+12%",
//       isPositive: true,
//       icon: <FiTrendingUp className="text-2xl" />,
//       color: "text-emerald-500"
//     },
//     isAdmin && {
//       title: "Total Purchased",
//       value: summary.reduce((acc, item) => acc + item.purchased, 0),
//       change: "+5%",
//       isPositive: true,
//       icon: <BiPurchaseTagAlt className="text-2xl" />,
//       color: "text-blue-500"
//     },
//     {
//       title: "Closing Stock",
//       value: summary.reduce((acc, item) => acc + item.remaining, 0),
//       change: "-3%",
//       isPositive: false,
//       icon: <BsBoxSeam className="text-2xl" />,
//       color: "text-indigo-500"
//     },
//     {
//       title: "Active Products",
//       value: summary.length,
//       change: "+2%",
//       isPositive: true,
//       icon: <MdInventory className="text-2xl" />,
//       color: "text-purple-500"
//     }
//   ].filter(Boolean);





//   <AreaChart
//   data={[
//     { 
//       name: 'Opening', 
//       value: summary.reduce((a,b) => a + (b.logs.find(l => l.transactionType === 'Opening Stock')?.quantityBottles || 0), 0) 
//     },
//     { 
//       name: 'Purchased', 
//       value: summary.reduce((a,b) => a + b.purchased, 0) 
//     },
//     { 
//       name: 'Available', 
//       value: summary.reduce((a,b) => {
//         const opening = b.logs.find(l => l.transactionType === 'Opening Stock')?.quantityBottles || 0;
//         return a + opening + b.purchased;
//       }, 0) 
//     },
//     { 
//       name: 'Sold', 
//       value: summary.reduce((a,b) => a + b.sold, 0) 
//     },
//     { 
//       name: 'Closing', 
//       value: summary.reduce((a,b) => a + b.remaining, 0) 
//     }
//   ]}
//   // ... rest of the AreaChart config
// ></AreaChart>