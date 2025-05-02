'use client';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  PackagePlus,
  Calendar,
  ShoppingCart,
  Receipt,
  User,
  StickyNote,
} from 'lucide-react';

export default function InventoryForm({ onSubmitSuccess, onLogCreated, products = [] }) {

const [form, setForm] = useState({
  productId: '',
  date: new Date(),
  transactionType: 'Opening Stock',
  quantityBottles: '',
  purchaseVendor: '',
  purchaseReceiptNumber: '',
  recordedBy: '',
  notes: '',
});

const [isSubmitting, setIsSubmitting] = useState(false); // Add state for form submission
const [submitError, setSubmitError] = useState(''); // Error state if submission fails

const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};

const handleDateChange = (date) => {
  setForm({ ...form, date });
};

const handleSubmit = async () => {
  if (isSubmitting) return; // Prevent submission if already submitting

  setIsSubmitting(true); // Start submitting

  const product = products.find((p) => p._id === form.productId);
  const mlPerBottle = product ? product.mlPerBottle : 750;

  const payload = {
    ...form,
    date: form.date.toISOString().split('T')[0],
    quantityBottles: Number(form.quantityBottles),
    quantityMl: Number(form.quantityBottles) * mlPerBottle,
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success('Inventory log saved!');
      setForm({
        productId: '',
        date: new Date(),
        transactionType: 'Opening Stock',
        quantityBottles: '',
        purchaseVendor: '',
        purchaseReceiptNumber: '',
        recordedBy: '',
        notes: '',
      });

      onSubmitSuccess?.();
      onLogCreated?.(data.inventoryLog);
    } else {
      setSubmitError(data.error || 'Failed to save.');
      toast.error(data.error || 'Failed to save.');
    }
  } catch {
    setSubmitError('Error submitting form.');
    toast.error('Error submitting form.');
  } finally {
    setIsSubmitting(false); // End submission
  }
};

const isPurchase = form.transactionType === 'Purchase';

console.log('Received products:', products); // Debugging line to check products

return (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-2xl shadow-lg max-w-md w-full space-y-4"
  >
    <h2 className="text-xl font-bold flex items-center gap-2">
      <PackagePlus className="w-5 h-5" /> Add Inventory Log
    </h2>

    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium block mb-1">Product</label>
        <select
  name="productId"
  value={form.productId}
  onChange={handleChange}
  className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
>
  <option value="">Select Product</option>
  {/* Check if products array is not empty */}
  {products && products.length > 0 ? (
    products.map((product) => (
      <option key={product._id} value={product._id}>
        {product.productName} ({product.category})
      </option>
    ))
  ) : (
    <option disabled>No products available</option>
  )}
</select>


      </div>

        {/* Date Picker */}
        <div>
          <label className="text-sm font-medium block mb-1">Date</label>
          <div className="relative">
            <DatePicker
              selected={form.date}
              onChange={handleDateChange}
              className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
            />
            <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Transaction Type */}
        <div>
          <label className="text-sm font-medium block mb-1">Transaction Type</label>
          <select
            name="transactionType"
            value={form.transactionType}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
          >
            <option value="Purchase">Purchase</option>
            <option value="Opening Stock">Opening Stock</option>
            <option value="Closing Stock">Closing Stock</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-sm font-medium block mb-1">Quantity (in Bottles)</label>
          <input
            type="number"
            name="quantityBottles"
            value={form.quantityBottles}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
          />
        </div>

        {/* Conditional Purchase Fields */}
        {isPurchase && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Vendor</label>
              <div className="relative">
                <input
                  name="purchaseVendor"
                  value={form.purchaseVendor}
                  onChange={handleChange}
                  placeholder="Vendor Name"
                  className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                />
                <ShoppingCart className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Receipt Number</label>
              <div className="relative">
                <input
                  name="purchaseReceiptNumber"
                  value={form.purchaseReceiptNumber}
                  onChange={handleChange}
                  placeholder="Receipt #"
                  className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                />
                <Receipt className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Recorded By</label>
              <div className="relative">
                <input
                  name="recordedBy"
                  value={form.recordedBy}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                />
                <User className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Notes */}
        <div>
          <label className="text-sm font-medium block mb-1">Notes</label>
          <div className="relative">
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
            />
            <StickyNote className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting} // Disable button during submission
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Inventory'}
        </button>
        {submitError && <p className="text-red-500 text-sm mt-2">{submitError}</p>}
      </div>
      {/* </div> */}
    </motion.div>
  );
}
