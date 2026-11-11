import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: [
    "firebase-admin",
    "@google/genai",
    "gaxios",
    "google-auth-library",
    "mammoth",
    "unpdf",
  ],
};

export default nextConfig;
