/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // Allows iframe embedding
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
              "default-src 'self'; frame-ancestors 'self' https://roi-calculator-mobile.vercel.app; frame-src 'self' https://roi-calculator-mobile.vercel.app;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
