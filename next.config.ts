import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Suppress hydration warnings from browser extensions
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      }
    ],
  },
};

export default nextConfig;
