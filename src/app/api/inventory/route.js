import { connectDB } from '@/lib/db';
import { InventoryLog } from '@/models/inventoryLogModel';

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

  try {
    const log = await InventoryLog.create(body);
    return Response.json(log);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// PUT Route: Update an existing Inventory Log
export async function PUT(req) {
  await connectDB();
  const { id } = req.query;  // Get the log ID from the query parameters
  const body = await req.json(); // Get the body of the request

  // Validate incoming data
  if (!body.productId || !body.quantityBottles) {
    return new Response(JSON.stringify({ error: 'Product ID and Quantity are required' }), { status: 400 });
  }

  try {
    // Find and update the log by ID
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
  const { id } = req.query;  // Get the log ID from the query parameters

  try {
    // Find and delete the log by ID
    const deletedLog = await InventoryLog.findByIdAndDelete(id);
    if (!deletedLog) {
      return new Response(JSON.stringify({ error: 'Log not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: 'Log deleted successfully' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
