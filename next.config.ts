import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // A list of extra safe origin domains from which Server Actions can be invoked
      allowedOrigins: ['my-proxy.com', '*.my-proxy.com'],
      
      // Maximum size of the request body sent to a Server Action
      // Default is 1MB, can be number of bytes or string format like '2mb', '500kb'
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;