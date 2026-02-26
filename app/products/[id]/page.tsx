import { db } from "@/app/lib/db";
import ProductDetail from "./ProductDetail";
import type { Product } from "@prisma/client";
import { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ id: string }>; // params is a promise
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
  });

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description || `Buy ${product.name} at MarketStore`,
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} at MarketStore`,
      images: [{ url: product.image }],
    },
  };
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
