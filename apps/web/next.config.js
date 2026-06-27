/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@pypocket/types"],
  // Allow loading Pyodide in client-side without headers issues
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false, child_process: false };
    return config;
  }
}

module.exports = nextConfig
