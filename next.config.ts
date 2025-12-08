import type { NextConfig } from "next";

const backend =
  process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8080";
const backendUrl = new URL(backend);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // IGDB covers
      {
        protocol: "https",
        hostname: "images.igdb.com",
        pathname: "/igdb/image/upload/**",
      },
      // Your backend /uploads
      {
        protocol: backendUrl.protocol.replace(":", "") as "http" | "https",
        hostname: backendUrl.hostname,
        port: backendUrl.port || undefined,
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    // keep this if you still ever call /uploads/* via the Next app
    return [
      {
        source: "/uploads/:path*",
        destination: `${backendUrl.origin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
