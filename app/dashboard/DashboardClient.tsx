"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { signOut } from "next-auth/react";


type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string | null;
};

type Props = {
  initialProducts: Product[];
};

export default function DashboardClient({ initialProducts }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // Unique categories for filter
  const categories = Array.from(
    new Set(
      initialProducts
        .map((p) => p.category)
        .filter((cat): cat is string => Boolean(cat))
    )
  );

  // Filter products by search & category
  const filteredProducts = initialProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "" || p.category === category)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products Dashboard</h1>
        <div className="flex items-center gap-4">
         
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition"
          >
            <FiLogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length === 0 && <p>No products found.</p>}
        {filteredProducts.map((product) => (
          <div key={product.id} className="border rounded shadow p-4 flex flex-col">
            <Link href={`/products/${product.id}`}>
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={300}
                height={300}
                className="rounded object-cover cursor-pointer"
              />
              <h2 className="mt-2 font-bold text-lg cursor-pointer">{product.name}</h2>
            </Link>
            <p className="mt-1 text-gray-700">${product.price.toFixed(2)}</p>
            {product.category && (
              <p className="text-sm text-gray-500 mt-1">{product.category}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
