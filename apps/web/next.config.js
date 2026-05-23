const cspHeader = `
  default-src 'self';

  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com;

  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;

  font-src 'self' data: https://fonts.gstatic.com;

  connect-src 'self' https://pocketwise.xyz;

  img-src 'self' blob: data: https://res.cloudinary.com;

  object-src 'none';

  base-uri 'self';

  form-action 'self';

  frame-ancestors 'none';

  upgrade-insecure-requests;
`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
