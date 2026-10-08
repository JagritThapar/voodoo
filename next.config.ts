import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // libSQL ships native bindings for local SQLite files; load it from node_modules, not the bundle.
  serverExternalPackages: ["@libsql/client", "libsql"],
  // Paperwork uploads (bills, signed contracts, photos) go through server actions.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;
