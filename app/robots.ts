export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout", "/payment", "/order-success"],
    },
    sitemap: "https://nextjs-storeweb.vercel.app/sitemap.xml",
  };
}