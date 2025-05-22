import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/ProductModel';// Make sure this exists
import { Inventory } from '@/models/InventoryModel';// Make sure this exists
export async function DELETE(req, context) {
  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
  }

  try {
    await connectDB(); // ✅ Establish connection

    // Delete the product
    const result = await Product.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Delete associated inventory logs
    await Inventory.deleteMany({ 'productId._id': id });

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { message: 'Error deleting product', error: error.message },
      { status: 500 }
    );
  }
}
