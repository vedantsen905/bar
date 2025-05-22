import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: String,
  quantity: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

  const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
export   {Inventory};