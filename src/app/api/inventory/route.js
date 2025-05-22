import { connectDB } from '@/lib/db';
import { InventoryLog } from '@/models/inventoryLogModel';
import { Product } from '@/models/ProductModel';

// GET Route: Fetch all Inventory Logs
export async function GET() {
  await connectDB();
  const logs = await InventoryLog.find().populate('productId');
  return Response.json(logs);
}

// POST Route: Create a new Inventory Log
export async function POST(req) {
  await connectDB();
  const body = await req.json();

  // Validate required fields
  if (!body.productId || !body.quantityBottles || !body.date || !body.transactionType) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  try {
    // Ensure product exists
    const product = await Product.findById(body.productId);
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }

    // Create the inventory log
    const log = await InventoryLog.create(body);
    return Response.json(log);
  } catch (err) {
    console.error("Error saving inventory log:", err); // Log the error
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// PUT Route: Update an existing Inventory Log
export async function PUT(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const body = await req.json();

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing ID in query' }), { status: 400 });
  }

  if (!body.productId || !body.quantityBottles) {
    return new Response(JSON.stringify({ error: 'Product ID and Quantity are required' }), { status: 400 });
  }

  try {
    const updatedLog = await InventoryLog.findByIdAndUpdate(id, body, { new: true }).populate('productId');
    if (!updatedLog) {
      return new Response(JSON.stringify({ error: 'Log not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(updatedLog), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// DELETE Route: Delete an existing Inventory Log
export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing ID in query' }), { status: 400 });
  }

  try {
    const deletedLog = await InventoryLog.findByIdAndDelete(id);
    if (!deletedLog) {
      return new Response(JSON.stringify({ error: 'Log not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: 'Log deleted successfully' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
