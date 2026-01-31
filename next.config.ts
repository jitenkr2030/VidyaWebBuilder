import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Fix for cross-origin warnings in development
  allowedDevOrigins: [
    "preview-chat-e30c3e12-9d01-4354-ac4f-81e716ca21a7.space.z.ai"
  ],
  // Ensure environment variables are properly loaded
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
};

export default nextConfig;
