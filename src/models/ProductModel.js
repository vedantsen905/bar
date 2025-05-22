import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  productName: { type: String, required: true },
  mlPerBottle: { type: Number, required: true, min: 1 }
}, {
  timestamps: true
});

// ✅ Prevent OverwriteModelError

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;