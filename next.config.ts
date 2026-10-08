import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Paperwork uploads (bills, signed contracts, photos) go through server actions.
  experimental: { serverActions: { bodySizeLimit: "11mb" } },
};

export default nextConfig;
