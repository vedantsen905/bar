import mongoose from 'mongoose';

const adjustmentSchema = new mongoose.Schema({
  fromProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  toProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  note: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  adjustedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Adjustment = mongoose.models.Adjustment || mongoose.model('Adjustment', adjustmentSchema);

export default Adjustment;