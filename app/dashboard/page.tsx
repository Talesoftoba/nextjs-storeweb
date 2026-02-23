import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { GET as nextAuthHandler } from "../api/auth/[...nextauth]/route"; // adjust path
import { db } from "../lib/db";
import DashboardClient from "./DashboardClient";
import { Session } from "next-auth";

// Define a type matching your Prisma Product
type ProductType = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string | null;
  description: string | null;
};

export default async function DashboardPage() {
  // Get the session and type it
  const session: Session | null = await getServerSession(nextAuthHandler);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch all products
  const productsDb = await db.product.findMany();

  //  Explicitly type the map parameter
  const products = productsDb.map((p: ProductType) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    imageUrl: p.image,
    category: p.category ?? "Uncategorized",
    description: p.description ?? "No description",
  }));

  return <DashboardClient initialProducts={products} />;
}