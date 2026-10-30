import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/masters/access-mgmt/assign-roles",
        destination: "/admin/roles/assign",
      },
      {
        source: "/masters/access-mgmt/create",
        destination: "/admin/roles/create",
      },
      {
        source: "/masters/access-mgmt/employee/:id/roles",
        destination: "/admin/roles/assign/:id",
      },
      {
        source: "/masters/access-mgmt",
        destination: "/admin/roles",
      },
    ];
  },
};

export default nextConfig;
