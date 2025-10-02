/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  images: {
    // Configure device sizes for responsive images
    deviceSizes: [320, 420, 640, 750, 828, 1024, 1080, 1200, 1920, 2048, 3840],
    // Configure image sizes for non-full-screen images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768],
    // Configure acceptable image quality values
    qualities: [75, 85, 90],
    // Use WebP and AVIF formats for optimization
    formats: ['image/webp', 'image/avif'],
    // Configure remote patterns for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'pub-849bf017d6de432ab0c1b15fd92009b0.r2.dev',
        port: '',
        pathname: '/**',
        search: '',
      },
    ],
  },
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      }
    );

    // Exclude the original rule from handling SVG imports
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

module.exports = nextConfig;
