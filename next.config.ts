import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix wrong workspace root detection
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  // Helps some Firebase + Turbopack issues
  serverExternalPackages: ["firebase", "firebase/app", "firebase/auth", "firebase/firestore"],
};



export default nextConfig;