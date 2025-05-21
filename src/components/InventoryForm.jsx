'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiPackage, FiCalendar, FiShoppingCart, FiFileText } from 'react-icons/fi';
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
      className="h-full flex flex-col bg-amber-50 p-6 rounded-2xl shadow-sm border border-amber-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-amber-900">
          Inventory Transaction
        </h2>
        <div className="p-2 rounded-lg bg-amber-100">
          <FiShoppingCart className="text-amber-600" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-amber-800">Product</label>
              <div className="relative">
                <select
                  name="productId"
                  value={form.productId}
                  onChange={(e) => setForm({...form, productId: e.target.value})}
                  className="appearance-none w-full bg-amber-50 border border-amber-200 rounded-lg p-2.5 pr-8 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id} className="text-amber-900">
                      {product.productName}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-amber-800">Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-amber-400" />
                </div>
                <DatePicker
                  selected={form.date}
                  onChange={(date) => setForm({...form, date})}
                  className="w-full pl-10 pr-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900"
                  wrapperClassName="w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-amber-800">Transaction Type</label>
              <div className="relative">
                <select
                  name="transactionType"
                  value={form.transactionType}
                  onChange={(e) => setForm({...form, transactionType: e.target.value})}
                  className="appearance-none w-full bg-amber-50 border border-amber-200 rounded-lg p-2.5 pr-8 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900"
                >
                  <option value="Purchase" className="text-amber-900">Purchase</option>
                  <option value="Opening Stock" className="text-amber-900">Opening Stock</option>
                  <option value="Closing Stock" className="text-amber-900">Closing Stock</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-amber-800">Quantity (Bottles)</label>
              <input
                type="number"
                name="quantityBottles"
                value={form.quantityBottles}
                onChange={(e) => setForm({...form, quantityBottles: e.target.value})}
                className="w-full bg-amber-50 border border-amber-200 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900"
                required
                min="1"
              />
            </div>

            {form.transactionType === 'Purchase' && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-amber-800">Vendor</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiShoppingCart className="text-amber-400" />
                    </div>
                    <input
                      name="purchaseVendor"
                      value={form.purchaseVendor}
                      onChange={(e) => setForm({...form, purchaseVendor: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-amber-800">Receipt #</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaReceipt className="text-amber-400" />
                    </div>
                    <input
                      name="purchaseReceiptNumber"
                      value={form.purchaseReceiptNumber}
                      onChange={(e) => setForm({...form, purchaseReceiptNumber: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-amber-800">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
                className="w-full bg-amber-50 border border-amber-200 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900"
                rows="3"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:opacity-90 disabled:opacity-50"
        >
          Submit Transaction
        </button>
      </form>
    </motion.div>
  );
}