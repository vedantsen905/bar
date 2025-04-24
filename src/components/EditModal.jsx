'use client';

import { Pencil, Trash2 } from 'lucide-react';

export default function SalesTable() {
  const summary = [
    {
      name: 'Product A',
      sold: 100,
      purchased: 120,
      remaining: 20,
      remainingLiters: 10,
    },
    {
      name: 'Product B',
      sold: 200,
      purchased: 180,
      remaining: 50,
      remainingLiters: 25,
    },
    {
      name: 'Product C',
      sold: 150,
      purchased: 130,
      remaining: 80,
      remainingLiters: 40,
    },
  ];

  const handleEdit = (productName) => {
    console.log(`Edit clicked for ${productName}`);
    // Open a modal or navigate to the edit page
  };

  const handleDelete = (productName) => {
    console.log(`Delete clicked for ${productName}`);
    // Confirm and delete logic here
  };

  return (
    <div className="overflow-x-auto ml-64 p-6">
      <table className="w-full text-sm border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="py-3 px-4 text-left text-gray-300">Product</th>
            <th className="py-3 px-4 text-left text-gray-300">Sold</th>
            <th className="py-3 px-4 text-left text-gray-300">Purchased</th>
            <th className="py-3 px-4 text-left text-gray-300">Remaining Bottles</th>
            <th className="py-3 px-4 text-left text-gray-300">Remaining Liters</th>
            <th className="py-3 px-4 text-left text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((item, idx) => (
            <tr
              key={idx}
              className="hover:bg-gray-700 transition-colors border-t border-gray-600"
            >
              <td className="py-3 px-4">{item.name}</td>
              <td className="py-3 px-4">{item.sold}</td>
              <td className="py-3 px-4">{item.purchased}</td>
              <td className="py-3 px-4">{item.remaining}</td>
              <td className="py-3 px-4">{item.remainingLiters.toFixed(2)} L</td>
              <td className="py-3 px-4 space-x-2">
                <button
                  onClick={() => handleEdit(item.name)}
                  className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.name)}
                  className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
