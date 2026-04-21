import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/pdf",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
