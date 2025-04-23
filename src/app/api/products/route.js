import{ connectDB} from '@/lib/db';
import { Product } from '@/models/ProductModel';
export async function GET() {
  await connectDB();
  const products = await Product.find();
  return Response.json(products);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();

  try {
    const product = await Product.create(body);
    return Response.json(product);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}
