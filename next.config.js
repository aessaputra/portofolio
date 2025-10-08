/** @type {import('next').NextConfig} */
const remotePatterns = [
  // Allow R2.dev domains (bucket-name.r2.dev)
  {
    protocol: 'https',
    hostname: '*.r2.dev',
    port: '',
    pathname: '/**',
    search: '',
  },
];

const { CLOUDFLARE_R2_PUBLIC_URL } = process.env;

if (CLOUDFLARE_R2_PUBLIC_URL) {
  try {
    const parsed = new URL(CLOUDFLARE_R2_PUBLIC_URL);
    const protocol = (parsed.protocol || 'https').replace(':', '') || 'https';
    const hostname = parsed.hostname;
    const basePath = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname.replace(/\/$/, '') : '';
    const pathname = basePath ? basePath + '/**' : '/**';

    const alreadyConfigured = remotePatterns.some(
      (pattern) => pattern.hostname === hostname && pattern.pathname === pathname
    );

    if (hostname && !alreadyConfigured) {
      remotePatterns.push({
        protocol,
        hostname,
        port: parsed.port ?? "",
        pathname,
        search: "",
      });
    }
  } catch (error) {
    console.warn('[next.config] Invalid CLOUDFLARE_R2_PUBLIC_URL:', CLOUDFLARE_R2_PUBLIC_URL);
  }
}

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    // Enable image optimization for production, disable for development if needed
    unoptimized: process.env.NODE_ENV !== 'production',
    // Configure device sizes for responsive images
    deviceSizes: [320, 420, 640, 750, 828, 1024, 1080, 1200, 1920, 2048, 3840],
    // Configure image sizes for non-full-screen images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768],
    // Configure acceptable image quality values
    qualities: [75, 85, 90],
    // Use WebP and AVIF formats for optimization
    formats: ['image/webp', 'image/avif'],
    // Configure remote patterns for external images
    remotePatterns,
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
