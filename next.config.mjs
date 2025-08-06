/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
