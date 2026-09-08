import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "*": ["node_modules/@libsql/linux-x64-musl/**"],
  },
};

export default nextConfig;
