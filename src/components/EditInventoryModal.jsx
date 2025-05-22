import { useState } from "react";
import { MdClose, MdDelete, MdSave } from "react-icons/md";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";

export default function InventoryEditModal({
  editingLog,
  setEditingLog,
  products,
  fetchData,
  handleCancelEdit,
  handleEditSubmit
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setConfirmDelete(false);
    try {
      const response = await fetch(`/api/products/${editingLog.productId._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        toast.success('Product deleted successfully!', { position: 'top-right' });
        await fetchData();
        setEditingLog(null);
      } else {
        const result = await response.json();
        toast.error(result.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('An error occurred while deleting the product');
    }
  };

  return (
    <>
      {editingLog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-amber-200"
          >
            <div className="flex justify-between items-center p-4 border-b border-amber-200 bg-amber-50 rounded-t-xl">
              <h3 className="text-lg font-semibold text-amber-800">
                {editingLog._id === 'new' ? 'Add New' : 'Edit'} Inventory Log
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-amber-700 hover:text-amber-900 p-1 rounded-full hover:bg-amber-100"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-amber-800">Product</label>
                  <select
                    name="productId"
                    value={editingLog.productId?._id || ''}
                    onChange={(e) => {
                      const selectedProduct = products.find(p => p._id === e.target.value);
                      setEditingLog({
                        ...editingLog,
                        productId: selectedProduct || null
                      });
                    }}
                    className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
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

                <div>
                  <label className="block text-sm font-medium mb-1 text-amber-800">Transaction Type</label>
                  <select
                    name="transactionType"
                    value={editingLog.transactionType}
                    onChange={(e) => {
                      setEditingLog({
                        ...editingLog,
                        transactionType: e.target.value,
                        quantityBottles: e.target.value === 'Closing Stock' ?
                          Math.abs(editingLog.quantityBottles) :
                          editingLog.quantityBottles
                      });
                    }}
                    className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    required
                  >
                    <option value="Sales">Sales</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Opening Stock">Opening Stock</option>
                    <option value="Closing Stock">Closing Stock</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quantityBottles" className="block text-sm font-medium mb-1 text-amber-800">
                    Quantity (Bottles)
                  </label>
                  <input
                    type="number"
                    id="quantityBottles"
                    name="quantityBottles"
                    value={
                      editingLog.transactionType === 'Closing Stock'
                        ? Math.abs(editingLog.quantityBottles)
                        : editingLog.quantityBottles
                    }
                    onChange={(e) => {
                      let value = parseInt(e.target.value) || 0;
                      if (editingLog.transactionType === 'Closing Stock') {
                        value = Math.abs(value);
                      }
                      setEditingLog({ ...editingLog, quantityBottles: value });
                    }}
                    className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-amber-800">Date</label>
                  <DatePicker
                    selected={editingLog.date ? new Date(editingLog.date) : new Date()}
                    onChange={(date) => setEditingLog({ ...editingLog, date: date.toISOString() })}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                {editingLog._id !== 'new' && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all flex items-center gap-1"
                  >
                    <MdDelete /> Delete Product
                  </button>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-amber-300 rounded-lg text-sm font-medium text-amber-800 hover:bg-amber-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg text-sm font-medium hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <MdSave /> {editingLog._id === 'new' ? 'Add' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold text-red-700 mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-sm text-gray-700">Are you sure you want to delete this product?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleDelete}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
