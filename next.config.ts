import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix Turbopack workspace root detection
  turbopack: {
    root: __dirname,
  },
  // Allow access from local network (e.g. testing on phone)
  allowedDevOrigins: ["192.168.1.39"],
};

export default nextConfig;
