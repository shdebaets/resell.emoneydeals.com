import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // setup cdn host for images
  images: {
    remotePatterns: [
      // Example CDN just copy the same as your image host
      // {
      //   protocol: "https",
      //   hostname: "cdn.example-cdn.com",
      //   port: "",
      //   pathname: "/**",
      // },
    ],
  },
};

export default nextConfig;
