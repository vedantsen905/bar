// src/models/productModel.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  productName: { type: String, required: true },
  mlPerBottle: { type: Number, required: true, min: 1 }
}, {
  timestamps: true
});

export const Product = mongoose.model('Product', productSchema);
