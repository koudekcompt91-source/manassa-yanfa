/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep Prisma + jose out of webpack’s numbered server chunks — avoids intermittent
  // “Cannot find module './NNNN.js'” dev errors (often under app/api/auth/me) after HMR
  // or partial .next deletes. jose is large; bundling it splits fragile async chunks.
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma", "jose"],
  },
};

export default nextConfig;
