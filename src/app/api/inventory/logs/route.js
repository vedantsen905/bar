// src/app/api/inventory/logs/route.js
import { connectDB } from '@/lib/db';
import Adjustment from '@/models/AdjustmentModel';
import { Product } from '@/models/ProductModel';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    
    const logs = await Adjustment.find()
      .sort({ date: -1 })
      .limit(10)
      .populate('fromProduct', 'productName')
      .populate('toProduct', 'productName');

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    return NextResponse.json(
      { message: 'Failed to fetch inventory logs' },
      { status: 500 }
    );
  }
}