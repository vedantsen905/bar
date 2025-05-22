import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: String,
  quantity: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
