'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProductForm() {
  const [form, setForm] = useState({
    category: '',
    subCategory: '',
    productName: '',
    mlPerBottle: 750,
  });

  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Form validation function
  const isFormValid = () => {
    return form.category && form.subCategory && form.productName && form.mlPerBottle > 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error('Please fill all fields correctly!');
      return;
    }

    setLoading(true); // Set loading state to true
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, mlPerBottle: Number(form.mlPerBottle) }),
    });

    const data = await res.json();
    setLoading(false); // Reset loading state

    if (res.ok) {
      toast.success('Product saved!');
      setForm({ category: '', subCategory: '', productName: '', mlPerBottle: 750 });
    } else {
      toast.error(data.error || 'An error occurred');
    }
  };

  return (
    <div className="bg-gray-800 text-gray-100 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">Add Product</h2>

      {/* Category input */}
      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
        <input
          id="category"
          name="category"
          placeholder="Enter category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Sub-category input */}
      <div className="mb-4">
        <label htmlFor="subCategory" className="block text-sm font-medium mb-1">Sub Category</label>
        <input
          id="subCategory"
          name="subCategory"
          placeholder="Enter sub-category"
          value={form.subCategory}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Product name input */}
      <div className="mb-4">
        <label htmlFor="productName" className="block text-sm font-medium mb-1">Product Name</label>
        <input
          id="productName"
          name="productName"
          placeholder="Enter product name"
          value={form.productName}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ML per bottle input */}
      <div className="mb-4">
        <label htmlFor="mlPerBottle" className="block text-sm font-medium mb-1">ML per Bottle</label>
        <input
          id="mlPerBottle"
          name="mlPerBottle"
          type="number"
          placeholder="Enter ML per bottle"
          value={form.mlPerBottle}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSubmit}
          disabled={loading || !isFormValid()}
          className={`bg-blue-600 text-white py-2 px-8 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </div>
  );
}
