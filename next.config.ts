import { NextConfig } from 'next';

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Whitelist the Supabase hostname for external images
    domains: ["ylgbdoxpnffhriorrkah.supabase.co"], // replace with your Supabase project host
  },
};

export default nextConfig;