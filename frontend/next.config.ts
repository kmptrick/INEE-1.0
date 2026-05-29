import type { NextConfig } from "next";
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  devIndicators: false,
  transpilePackages: ['@react-pdf/renderer'],
};

export default withPWA(nextConfig);
