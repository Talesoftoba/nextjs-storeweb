// app/admin/products/page.tsx
import { db } from "@/app/lib/db";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function ProductsPage() {
  // ✅ Protect page: Only admins can access
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "ADMIN") redirect("/");

  // ✅ Fetch products — let TypeScript infer the type
  const products = await db.product.findMany();

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      <Link
        href="/admin/products/new"
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6 inline-block"
      >
        + Add New Product
      </Link>

      {products.length === 0 && <p>No products yet.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded shadow p-4 flex flex-col">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={300}
                className="object-cover mb-4 rounded"
                loading="eager"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 mb-4 flex items-center justify-center rounded">
                No Image
              </div>
            )}

            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-600">Category: {product.category ?? "Uncategorized"}</p>
            <p className="text-gray-800 font-bold">Price: ${product.price}</p>
            <p className="text-gray-600">Stock: {product.stock}</p>
            <p className="text-gray-600">
              Description: {product.description ?? "No description"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
