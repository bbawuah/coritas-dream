/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['three', 'three-stdlib'],
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Temporarily ignore TypeScript errors during upgrade
  // TODO: Remove after all type issues are fixed
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
