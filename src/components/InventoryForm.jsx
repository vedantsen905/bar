'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiFile, FiPackage, FiCalendar, FiShoppingCart, FiUser, FiFileText, FiSave } from 'react-icons/fi';

// import { FiReceipt } from 'react-icons/fa';
import { FaReceipt } from 'react-icons/fa';


export default function InventoryForm({ products, onSubmitSuccess }) {
  const [form, setForm] = useState({
    productId: '',
    date: new Date(),
    transactionType: 'Opening Stock',
    quantityBottles: '',
    purchaseVendor: '',
    purchaseReceiptNumber: '',
    recordedBy: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: form.date.toISOString(),
          quantityBottles: Number(form.quantityBottles),
          quantityMl: Number(form.quantityBottles) * 
            (products.find(p => p._id === form.productId)?.mlPerBottle || 750)
        })
      });
      
      if (res.ok) {
        onSubmitSuccess?.();
        setForm({
          productId: '',
          date: new Date(),
          transactionType: 'Opening Stock',
          quantityBottles: '',
          purchaseVendor: '',
          purchaseReceiptNumber: '',
          recordedBy: '',
          notes: ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-3xl shadow-2xl"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Inventory Transaction
        </h2>
        <div className="h-1 flex-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 mx-6 rounded-full"></div>
        <FiShoppingCart className="text-blue-500 text-2xl" />
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1 h-full">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 px-2">Product</label>
                <select
                  name="productId"
                  value={form.productId}
                  onChange={(e) => setForm({...form, productId: e.target.value})}
                  className="w-full bg-transparent border-0 focus:ring-0 p-3 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.productName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1 h-full">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 px-2">Date</label>
                <div className="flex items-center">
                  <FiCalendar className="ml-3 text-gray-400" />
                  <DatePicker
                    selected={form.date}
                    onChange={(date) => setForm({...form, date})}
                    className="w-full bg-transparent border-0 focus:ring-0 p-3 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1 h-full">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 px-2">Transaction Type</label>
                <select
                  name="transactionType"
                  value={form.transactionType}
                  onChange={(e) => setForm({...form, transactionType: e.target.value})}
                  className="w-full bg-transparent border-0 focus:ring-0 p-3 text-gray-900 dark:text-white"
                >
                  <option value="Purchase">Purchase</option>
                  <option value="Opening Stock">Opening Stock</option>
                  <option value="Closing Stock">Closing Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1 h-full">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 px-2">Quantity (Bottles)</label>
                <input
                  type="number"
                  name="quantityBottles"
                  value={form.quantityBottles}
                  onChange={(e) => setForm({...form, quantityBottles: e.target.value})}
                  className="w-full bg-transparent border-0 focus:ring-0 p-3 text-gray-900 dark:text-white"
                  required
                  min="1"
                />
              </div>
            </div>

            {form.transactionType === 'Purchase' && (
              <>
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1 h-full">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 px-2">Vendor</label>
                    <div className="flex items-center">
                      <FiShoppingCart className="ml-3 text-gray-400" />
                      <input
                        name="purchaseVendor"
                        value={form.purchaseVendor}
                        onChange={(e) => setForm({...form, purchaseVendor: e.target.value})}
                        className="w-full bg-transparent border-0 focus:ring-0 p-3 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1 h-full">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 px-2">Receipt #</label>
                    <div className="flex items-center">
                      <FiReceipt className="ml-3 text-gray-400" />
                      <input
                        name="purchaseReceiptNumber"
                        value={form.purchaseReceiptNumber}
                        onChange={(e) => setForm({...form, purchaseReceiptNumber: e.target.value})}
                        className="w-full bg-transparent border-0 focus:ring-0 p-3 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1 h-full">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 px-2">Notes</label>
                <div className="flex">
                  <FiFileText className="mt-3 ml-3 text-gray-400" />
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={(e) => setForm({...form, notes: e.target.value})}
                    className="w-full bg-transparent border-0 focus:ring-0 p-3 text-gray-900 dark:text-white"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
        >
          Submit Transaction
        </button>
      </form>
    </motion.div>
  );
}