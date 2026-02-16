"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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

  // Derive unique categories directly
 const categories = Array.from(
  new Set(
    initialProducts
      .map((p) => p.category)
      .filter((cat): cat is string => Boolean(cat))
  )
);

  // Filter products based on search and category
  const filteredProducts = initialProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "" || p.category === category)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Products Dashboard</h1>

      {/* Search and Category Filter */}
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