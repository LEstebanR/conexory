import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Expose these to the client bundle (needed for sentry.client.config.ts —
  // VERCEL_ENV isn't inlined client-side by default like NODE_ENV is)
  env: {
    SENTRY_DSN: process.env.SENTRY_DSN ?? "",
    VERCEL_ENV: process.env.VERCEL_ENV ?? "",
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

export default withSentryConfig(nextConfig, {
  // Source map upload — reads SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN from env
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  // Skip source map upload when auth token is not configured
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
