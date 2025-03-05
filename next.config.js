/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "frame-ancestors 'self' https://roi-calculator-mobile.vercel.app https://app.firmos.ai; " +
              "frame-src 'self' https://roi-calculator-mobile.vercel.app https://app.firmos.ai;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
