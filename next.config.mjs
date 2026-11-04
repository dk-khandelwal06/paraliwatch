/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  generateBuildId: async () => {
    return "paraliwatch-v1";
  },
};

export default nextConfig;
