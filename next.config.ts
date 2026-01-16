import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'unavatar.io',
                pathname: '/twitter/**',
            },
        ],
    },
};

export default nextConfig;
