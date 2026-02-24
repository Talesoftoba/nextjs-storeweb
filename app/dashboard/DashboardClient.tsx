"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiLogOut, FiSearch } from "react-icons/fi";
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

  const categories = Array.from(
    new Set(
      initialProducts
        .map((p) => p.category)
        .filter((cat): cat is string => Boolean(cat))
    )
  );

  const filteredProducts = initialProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "" || p.category === category)
  );

  return (
    <div className="bg-neutral-950 text-neutral-200 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-amber-400 text-xs tracking-widest uppercase mb-2">
              Store
            </p>
            <h1 className="text-5xl sm:text-6xl font-light text-neutral-100 tracking-tight leading-none">
              Products
            </h1>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 border border-neutral-700 text-neutral-400 text-xs px-4 py-2 rounded hover:border-red-500 hover:text-red-400 transition-all duration-200 tracking-wide self-start sm:self-auto"
          >
            <FiLogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 placeholder-neutral-500 text-sm rounded px-4 py-3 pl-9 focus:outline-none focus:border-amber-400 transition-colors duration-200"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm rounded px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors duration-200 sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-neutral-500 text-xs tracking-widest uppercase mb-6">
          {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-neutral-800 mb-8" />

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-neutral-600 text-sm tracking-wide">No products found.</p>
            <button
              onClick={() => { setSearch(""); setCategory(""); }}
              className="text-amber-400 text-xs underline underline-offset-4 hover:text-amber-300 transition-colors duration-200"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="group bg-neutral-900 border border-neutral-800 rounded overflow-hidden hover:border-neutral-600 transition-all duration-300 cursor-pointer">

                  {/* Image */}
                  <div className="relative w-full h-52 bg-neutral-800">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      style={{ objectFit: "contain" }}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.category && (
                      <span className="absolute top-2 left-2 bg-neutral-950/80 text-amber-400 text-[9px] tracking-widest uppercase px-2 py-1 rounded backdrop-blur-sm">
                        {product.category}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 border-t border-neutral-800">
                    <h2 className="text-sm font-medium text-neutral-100 leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors duration-200">
                      {product.name}
                    </h2>
                    <p className="text-amber-400 text-sm font-medium mt-2">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}