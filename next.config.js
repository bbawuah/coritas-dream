/** @type {import('next').NextConfig} */
const path = require('path');
const withTM = require('next-transpile-modules')(['three']);

const nextConfig = {
  reactStrictMode: false,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
};

module.exports = withTM(nextConfig);
