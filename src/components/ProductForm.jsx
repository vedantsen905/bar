'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Tag, List, Package, FlaskConical } from 'lucide-react';

export default function ProductForm() {
  const [form, setForm] = useState({
    category: '',
    subCategory: '',
    productName: '',
    mlPerBottle: 750,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormValid = () => {
    return form.category && form.subCategory && form.productName && form.mlPerBottle > 0;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error('Please fill all fields correctly!');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, mlPerBottle: Number(form.mlPerBottle) }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success('Product saved!');
      setForm({ category: '', subCategory: '', productName: '', mlPerBottle: 750 });
    } else {
      toast.error(data.error || 'An error occurred');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 backdrop-blur-md bg-gray-50/80 dark:bg-gray-800/80 text-gray-900 dark:text-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-lg mx-auto mt-10 border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-3xl font-bold text-center mb-6">Add Product</h2>

      <div className="space-y-5">
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold mb-1">Category</label>
          <div className="relative">
            <Tag className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              id="category"
              name="category"
              placeholder="e.g., Alcohol"
              value={form.category}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sub Category */}
        <div>
          <label htmlFor="subCategory" className="block text-sm font-semibold mb-1">Sub Category</label>
          <div className="relative">
            <List className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              id="subCategory"
              name="subCategory"
              placeholder="e.g., Whiskey"
              value={form.subCategory}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label htmlFor="productName" className="block text-sm font-semibold mb-1">Product Name</label>
          <div className="relative">
            <Package className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              id="productName"
              name="productName"
              placeholder="e.g., Jack Daniel's"
              value={form.productName}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ML per Bottle */}
        <div>
          <label htmlFor="mlPerBottle" className="block text-sm font-semibold mb-1">ML per Bottle</label>
          <div className="relative">
            <FlaskConical className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              id="mlPerBottle"
              name="mlPerBottle"
              type="number"
              placeholder="750"
              value={form.mlPerBottle}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
            className={`transition duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/50 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
