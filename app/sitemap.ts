import { db } from "@/app/lib/db";

export default async function sitemap() {
  const products = await db.product.findMany();

  const productUrls = products.map((p) => ({
    url: `https://nextjs-storeweb.vercel.app/products/${p.id}`,
    lastModified: p.updatedAt,
  }));

  return [
    { url: "https://nextjs-storeweb.vercel.app", lastModified: new Date() },
    { url: "https://nextjs-storeweb.vercel.app/dashboard", lastModified: new Date() },
    ...productUrls,
  ];
}