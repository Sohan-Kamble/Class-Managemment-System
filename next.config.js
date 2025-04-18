/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['api.dicebear.com']
  },
  optimizeFonts: false,
  webpack: (config, { dev, isServer }) => {
    // Disable webpack cache in development to prevent ENOENT errors
    if (dev && isServer) {
      config.cache = false;
    }
    
    // Add additional fallbacks to prevent file system related errors
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      path: false,
      stream: false,
    };

    // Ensure the cache directory exists
    config.infrastructureLogging = {
      level: 'error',
    };
    
    return config;
  },
}

module.exports = nextConfig;