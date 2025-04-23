'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function InventoryForm({ onSubmitSuccess }) {
  const [form, setForm] = useState({
    productId: '',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    transactionType: 'Purchase',
    quantityBottles: '',
    quantityMl: '',
    purchaseVendor: '',
    purchaseReceiptNumber: '',
    recordedBy: '',
    notes: '',
  });

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        toast.error("Failed to fetch products.");
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const product = products.find(p => p._id === form.productId);
    const mlPerBottle = product ? product.mlPerBottle : 750;

    const payload = {
      ...form,
      quantityBottles: Number(form.quantityBottles),
      quantityMl: Number(form.quantityBottles) * mlPerBottle,
    };

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Inventory log saved!");
        setForm({
          productId: '',
          date: new Date().toISOString().split('T')[0],
          timestamp: new Date().toISOString(),
          transactionType: 'Purchase',
          quantityBottles: '',
          quantityMl: '',
          purchaseVendor: '',
          purchaseReceiptNumber: '',
          recordedBy: '',
          notes: '',
        });
        if (onSubmitSuccess) onSubmitSuccess(); // Trigger table refresh
      } else {
        toast.error(data.error || "Failed to save.");
      }
    } catch (err) {
      toast.error("Error submitting form.");
    }
  };

  return (
    <div className="bg-slate-800 text-slate-100 p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-lg font-bold text-slate-100 mb-2">➕ Add Inventory Log</h2>

      <div className="grid grid-cols-1 gap-4">
        <select
          name="productId"
          value={form.productId}
          onChange={handleChange}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-2"
        >
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.productName} ({product.category})
            </option>
          ))}
        </select>

        <select
          name="transactionType"
          value={form.transactionType}
          onChange={handleChange}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-2"
        >
          <option value="Purchase">Purchase</option>
          <option value="Opening Stock">Opening Stock</option>
          <option value="Sales">Sales</option>
          <option value="Closing Stock">Closing Stock</option>
        </select>

        <input
          type="number"
          name="quantityBottles"
          placeholder="Quantity (in Bottles)"
          value={form.quantityBottles}
          onChange={handleChange}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-2"
        />

        <input
          name="purchaseVendor"
          placeholder="Vendor Name (optional)"
          value={form.purchaseVendor}
          onChange={handleChange}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-2"
        />

        <input
          name="purchaseReceiptNumber"
          placeholder="Receipt Number (optional)"
          value={form.purchaseReceiptNumber}
          onChange={handleChange}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-2"
        />

        <input
          name="recordedBy"
          placeholder="Recorded By"
          value={form.recordedBy}
          onChange={handleChange}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-2"
        />

        <textarea
          name="notes"
          placeholder="Additional Notes (optional)"
          value={form.notes}
          onChange={handleChange}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-2"
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          Submit Inventory
        </button>
      </div>
    </div>
  );
}
