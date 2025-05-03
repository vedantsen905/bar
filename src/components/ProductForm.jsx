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
      className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-3xl shadow-2xl"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Add New Product
        </h2>
        <div className="h-1 flex-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 mx-6 rounded-full"></div>
        <FiBox className="text-purple-500 text-2xl" />
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="space-y-6 flex-1">
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 px-2">Category</label>
              <div className="flex items-center">
                <FiTag className="ml-3 text-gray-400" />
                <input
                  name="category"
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  className="w-full bg-transparent border-0 focus:ring-0 p-3 text-gray-900 dark:text-white"
                  placeholder="e.g., Whiskey"
                  required
                />
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 px-2">Sub Category</label>
              <div className="flex items-center">
                <FiLayers className="ml-3 text-gray-400" />
                <input
                  name="subCategory"
                  value={form.subCategory}
                  onChange={(e) => setForm({...form, subCategory: e.target.value})}
                  className="w-full bg-transparent border-0 focus:ring-0 p-3 text-gray-900 dark:text-white"
                  placeholder="e.g., Single Malt"
                  required
                />
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 px-2">Product Name</label>
              <div className="flex items-center">
                <FiBox className="ml-3 text-gray-400" />
                <input
                  name="productName"
                  value={form.productName}
                  onChange={(e) => setForm({...form, productName: e.target.value})}
                  className="w-full bg-transparent border-0 focus:ring-0 p-3 text-gray-900 dark:text-white"
                  placeholder="e.g., Glenfiddich 12"
                  required
                />
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 px-2">ML per Bottle</label>
              <div className="flex items-center">
                <FiDroplet className="ml-3 text-gray-400" />
                <input
                  type="number"
                  name="mlPerBottle"
                  value={form.mlPerBottle}
                  onChange={(e) => setForm({...form, mlPerBottle: e.target.value})}
                  className="w-full bg-transparent border-0 focus:ring-0 p-3 text-gray-900 dark:text-white"
                  required
                  min="1"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
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