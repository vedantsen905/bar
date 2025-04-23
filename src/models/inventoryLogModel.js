import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  },
  transactionType: {
    type: String,
    enum: ['Opening Stock', 'Purchase', 'Sales', 'Closing Stock'],
    required: true
  },
  quantityBottles: {
    type: Number,
    required: true
  },
  quantityMl: {
    type: Number,
    required: true
  },
  purchaseVendor: String,
  purchaseReceiptNumber: String,
  recordedBy: String,
  notes: String
}, {
  timestamps: true
});

export const InventoryLog = mongoose.model("InventoryLog", inventoryLogSchema)