import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[{
      protocol:'https',
      hostname:'images.igdb.com',
      pathname:'/igdb/image/upload/**'
    }]
  }
};

export default nextConfig;
