/** @type {import('next').NextConfig} */
const nextConfig = {
  // Other configuration options
  server: {
    host: "0.0.0.0",
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
