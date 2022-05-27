/** @type {import('next').NextConfig} */
const path = require('path');
const withTM = require('next-transpile-modules')(['three']);

const nextConfig = {
  reactStrictMode: false,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  webpack: (config, { webpack }) => {
    console.log('from webpck');
    config.plugins.push(
      new webpack.ProvidePlugin({
        ThreeMeshUI: 'three-mesh-ui',
      })
    );
    return config;
  },
};

module.exports = withTM(nextConfig);
