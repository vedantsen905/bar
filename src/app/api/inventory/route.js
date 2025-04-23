import {connectDB} from '@/lib/db';
import { InventoryLog } from '@/models/inventoryLogModel';

export async function GET() {
  await connectDB();
  const logs = await InventoryLog.find().populate('productId');
  return Response.json(logs);
}

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
