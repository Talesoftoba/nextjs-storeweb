import { db } from "../lib/db"; 
import DashboardClient from "./DashboardClient";
import { Product } from "@prisma/client";

export default async function DashboardPage() {
  const productsDb:Product[] = await db.product.findMany();

  const products = productsDb.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    imageUrl: p.image,
    category: p.category,
    description: p.description,
  }));

  return <DashboardClient initialProducts={products} />;
}
