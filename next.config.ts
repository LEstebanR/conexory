import type { NextConfig } from "next";
import { posthogRewrites, trailingSlashRedirects } from "./lib/posthog";

const nextConfig: NextConfig = {
  // Inlined into the browser bundle so client errors carry the same
  // environment and release as server ones, without depending on Vercel's
  // "expose system environment variables" project setting.
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || "",
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || "",
  },
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
