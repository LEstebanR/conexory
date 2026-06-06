import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "better-auth",
    "@better-auth/kysely-adapter",
    "kysely",
    "@vercel/blob",
  ],
  turbopack: {
    ignoreIssue: [
      { path: "**/@better-auth/kysely-adapter/**" },
      { path: "**/better-auth/kysely-adapter/**" },
    ],
  },
};

export default nextConfig;
