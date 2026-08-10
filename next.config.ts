import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix wrong workspace root detection
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Helps some Firebase + Turbopack issues
  serverExternalPackages: ["firebase", "firebase/app", "firebase/auth", "firebase/firestore"],
};

export default nextConfig;