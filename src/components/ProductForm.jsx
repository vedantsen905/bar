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
      className="h-full flex flex-col bg-amber-50 p-6 rounded-2xl shadow-sm border border-amber-200"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-amber-900">
          Add New Product
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-6"></div>
        <div className="p-2 rounded-lg bg-amber-200">
          <FiBox className="text-amber-700" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="space-y-6 flex-1">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiTag className="text-amber-500" />
              </div>
              <input
                name="category"
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-400 transition-all"
                 
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Sub Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLayers className="text-amber-500" />
              </div>
              <input
                name="subCategory"
                value={form.subCategory}
                onChange={(e) => setForm({...form, subCategory: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-400 transition-all"
                
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Product Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiBox className="text-amber-500" />
              </div>
              <input
                name="productName"
                value={form.productName}
                onChange={(e) => setForm({...form, productName: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-400 transition-all"
                 
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-amber-800 mb-1">
              ML per Bottle
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiDroplet className="text-amber-500" />
              </div>
              <input
                type="number"
                name="mlPerBottle"
                value={form.mlPerBottle}
                onChange={(e) => setForm({...form, mlPerBottle: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 transition-all"
                required
                min="1"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full py-3.5 px-6 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
        >
          <FiSave className="mr-2" />
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </motion.div>
  );
}