// src/app/api/inventory/adjust/route.js
import { connectDB } from '@/lib/db';
import Inventory from '@/models/InventoryModel';
import Product from '@/models/ProductModel';
import Adjustment from '@/models/AdjustmentModel';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    const { fromProduct, toProduct, quantity, note } = await request.json();

    // Validate input
    if (!fromProduct || !toProduct || !quantity) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (fromProduct === toProduct) {
      return NextResponse.json(
        { message: 'Source and destination products must be different' },
        { status: 400 }
      );
    }

    // Get both products
    const sourceProduct = await Product.findById(fromProduct);
    const destProduct = await Product.findById(toProduct);

    if (!sourceProduct || !destProduct) {
      return NextResponse.json(
        { message: 'One or both products not found' },
        { status: 404 }
      );
    }

    // Check if source has enough quantity
    const sourceInventory = await Inventory.findOne({ product: fromProduct });
    if (!sourceInventory || sourceInventory.quantity < quantity) {
      return NextResponse.json(
        { message: 'Insufficient quantity in source inventory' },
        { status: 400 }
      );
    }

    // Update inventories
    await Inventory.findOneAndUpdate(
      { product: fromProduct },
      { $inc: { quantity: -quantity } }
    );

    await Inventory.findOneAndUpdate(
      { product: toProduct },
      { $inc: { quantity: quantity } },
      { upsert: true }
    );

    // Create adjustment record
    const adjustment = new Adjustment({
      fromProduct,
      toProduct,
      quantity,
      note,
      date: new Date()
    });
    await adjustment.save();

    // Get updated inventory data
    const updatedSource = await Inventory.findOne({ product: fromProduct });
    const updatedDest = await Inventory.findOne({ product: toProduct });

    return NextResponse.json({
      message: 'Inventory adjusted successfully',
      updatedInventory: {
        fromProduct: updatedSource,
        toProduct: updatedDest
      },
      adjustment
    });

  } catch (error) {
    console.error('Adjustment error:', error);
    return NextResponse.json(
      { message: 'Failed to adjust inventory' },
      { status: 500 }
    );
  }
}