import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "better-auth",
    "@better-auth/kysely-adapter",
    "kysely",
  ],
  turbopack: {
    ignoreIssue: [
      { path: "**/@better-auth/kysely-adapter/**" },
      { path: "**/better-auth/kysely-adapter/**" },
    ],
  },
};

export default nextConfig;
