/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.speakerdeck.com',
        port: '',
        pathname: '/presentations/**',
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
