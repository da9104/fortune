/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }

    // Handle native modules
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
      type: "javascript/auto",
    });

    // Specifically handle @napi-rs/canvas native modules
    config.module.rules.push({
      test: /\.(darwin|linux|win32)-(x64|arm64)\.node$/,
      use: "node-loader",
      type: "javascript/auto",
    });

    return config;
  },
  experimental: {
    serverExternalPackages: ["@napi-rs/canvas"],
  },
};

module.exports = nextConfig;
