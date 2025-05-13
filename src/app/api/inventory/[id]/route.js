import { InventoryLog } from "@/models/inventoryLogModel";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

// DELETE /api/inventory/[id]
export async function DELETE(req, { params }) {
  await connectDB();

  // Await the dynamic parameters to ensure 'id' is available
  const { id } = await params; 

  // Validate the ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ error: "Invalid ID format" }), { status: 400 });
  }

  // Attempt to delete the inventory log by ID
  const deletedLog = await InventoryLog.findByIdAndDelete(id);

  if (!deletedLog) {
    return new Response(JSON.stringify({ error: "Log not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ message: "Deleted successfully" }), { status: 200 });
}

// PUT /api/inventory/[id]
export async function PUT(req, { params }) {
  await connectDB();

  // Await the dynamic parameters to ensure 'id' is available
  const { id } = await params;

  // Validate the ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ error: "Invalid ID format" }), { status: 400 });
  }

  try {
    // Parse the request body
    const body = await req.json();

    // Attempt to update the inventory log by ID
    const updatedLog = await InventoryLog.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedLog) {
      return new Response(JSON.stringify({ error: "Log not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedLog), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error", details: error.message }), { status: 500 });
  }
}
