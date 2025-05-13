'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBox, FiLayers, FiTag, FiDroplet, FiSave } from 'react-icons/fi';

export default function ProductForm({ onProductSaved }) {
  const [form, setForm] = useState({
    category: '',
    subCategory: '',
    productName: '',
    mlPerBottle: 750,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        onProductSaved?.();
        setForm({ category: '', subCategory: '', productName: '', mlPerBottle: 750 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Add New Product
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-6"></div>
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <FiBox className="text-purple-600 dark:text-purple-400" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiTag className="text-gray-400" />
              </div>
              <input
                name="category"
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="e.g., Whiskey"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Sub Category</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLayers className="text-gray-400" />
              </div>
              <input
                name="subCategory"
                value={form.subCategory}
                onChange={(e) => setForm({...form, subCategory: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="e.g., Single Malt"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Product Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiBox className="text-gray-400" />
              </div>
              <input
                name="productName"
                value={form.productName}
                onChange={(e) => setForm({...form, productName: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="e.g., Glenfiddich 12"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">ML per Bottle</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiDroplet className="text-gray-400" />
              </div>
              <input
                type="number"
                name="mlPerBottle"
                value={form.mlPerBottle}
                onChange={(e) => setForm({...form, mlPerBottle: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                required
                min="1"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:opacity-90 disabled:opacity-50"
        >
          <div className="flex items-center justify-center">
            <FiSave className="mr-2" />
            {loading ? 'Saving...' : 'Save Product'}
          </div>
        </button>
      </form>
    </motion.div>
  );
}