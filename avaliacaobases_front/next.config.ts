import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove allowedDevOrigins - it's not a standard Next.js property
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "http://localhost:8765" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },
  // Enable CORS for API routes
  async rewrites() {
    return [
      // Proxy API requests to your backend during development
      {
        source: '/auth/:path*',
        destination: 'http://localhost:8765/auth/:path*',
      },
    ];
  },
  // Configure webpack dev server for HMR
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;