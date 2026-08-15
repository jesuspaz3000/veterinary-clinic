import type { NextConfig } from "next";

const backendApiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8080/api";
const backendOrigin = new URL(backendApiUrl);

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: backendOrigin.protocol.replace(":", "") as "http" | "https",
        hostname: backendOrigin.hostname,
        port: backendOrigin.port,
      },
    ],
  },
};

export default nextConfig;
