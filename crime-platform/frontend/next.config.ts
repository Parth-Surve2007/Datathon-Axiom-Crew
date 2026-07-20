import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/app",
  images: {
    unoptimized: true,
  },
  devIndicators: false,
};

export default nextConfig;
