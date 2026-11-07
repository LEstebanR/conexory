import type { NextConfig } from "next";
import { posthogRewrites, trailingSlashRedirects } from "./lib/posthog";

const nextConfig: NextConfig = {
  // PostHog's API paths end in a trailing slash; redirecting them would break the proxy.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return posthogRewrites();
  },
  async redirects() {
    return trailingSlashRedirects();
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
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
