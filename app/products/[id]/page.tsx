import { db } from "@/app/lib/db";
import ProductDetail from "./ProductDetail";
import type { Product } from "@prisma/client";

interface ProductPageProps {
  params: Promise<{ id: string }>; // params is a promise
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params; // ← unwrap the promise

  if (!id) return <p>Invalid product ID</p>;

  const product: Product | null = await db.product.findUnique({
    where: { id },
  });

  if (!product) return <p>Product not found</p>;

  return <ProductDetail product={product} />;
}
