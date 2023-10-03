/** @type {import('next').NextConfig} */

const nextConfig = {
  // Other configuration options
  // server: {
  //   host: "0.0.0.0",
  // },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disableDevLogs: true,

  fallbacks: {
    // Failed page requests fallback to this.
    document: "/~offline",
  },
  // importScripts: ["firebase-messaging-sw.js"],

  // disable: process.env.NODE_ENV === "development",
  // register: true,
  // scope: "/app",
  // sw: "service-worker.js",
  //...
});

module.exports = withPWA({
  ...nextConfig,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped.
      ...config.resolve.fallback,

      fs: false, // the solution
    };
    if (!isServer) {
      config.externals.push({
        bufferutil: "bufferutil",
        "utf-8-validate": "utf-8-validate",
        "supports-color": "supports-color",
      });
    }

    return config;
  },
});
