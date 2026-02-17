import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { GET as nextAuthHandler } from "../api/auth/[...nextauth]/route"; // adjust path
import { db } from "../lib/db";
import DashboardClient from "./DashboardClient";
import { Session } from "next-auth";

export default async function DashboardPage() {
  // Get the session and type it
  const session: Session | null = await getServerSession(nextAuthHandler);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch all products
  const productsDb = await db.product.findMany();

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