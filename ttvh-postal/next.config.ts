import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*supabase\.co\/rest\/v1\/attendance.*/i,
        handler: "NetworkOnly",
        options: {
          backgroundSync: {
            name: "attendance-queue",
            options: {
              maxRetentionTime: 24 * 60, // Retry for max of 24 Hours
            },
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
