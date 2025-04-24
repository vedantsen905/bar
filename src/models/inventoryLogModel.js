import mongoose from 'mongoose';

// Define the Inventory Log Schema
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
    type: Date,  // Changed to Date for better handling of time values
    required: true,
    default: Date.now  // Defaults to current timestamp if not provided
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
  purchaseVendor: {
    type: String,
    required: false
  },
  purchaseReceiptNumber: {
    type: String,
    required: false
  },
  recordedBy: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Avoid overwriting the model if it already exists
let InventoryLog;
try {
  InventoryLog = mongoose.model('InventoryLog');
} catch (error) {
  InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);
}

export { InventoryLog };
