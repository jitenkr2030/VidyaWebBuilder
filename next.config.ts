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
};

export default nextConfig;
