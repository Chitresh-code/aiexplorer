import type { NextConfig } from "next";

/**
 * Production-grade Next.js configuration
 * 
 * Optimizations include:
 * - React Compiler for automatic memoization
 * - Turbopack for faster builds
 * - Security headers and CSP
 * - Performance optimizations
 * - SEO configurations
 */
const nextConfig: NextConfig = {
  // Enable React Compiler for automatic optimization
  reactCompiler: true,
  
  // Configure Turbopack (Next.js 16+)
  turbopack: {
    root: __dirname,
  },
  
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Experimental features for performance
  experimental: {
    // Server Components are enabled by default in Next.js 13+
    serverComponentsExternalPackages: [
      "mssql",
      "@azure/msal-browser",
      "@azure/msal-react",
    ],
    
    // Parallel Routes and Intercepting Routes
    // These are stable in Next.js 16
    optimizePackageImports: [
      "@radix-ui/react-*",
      "lucide-react",
    ],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  
  // Redirects for maintaining URLs
  async redirects() {
    return [];
  },
  
  // Rewrites for clean URLs
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
