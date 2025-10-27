import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'reelboost.online',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: 'snapta.s3.us-east-2.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: 'maps.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "media3.giphy.com",
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "media0.giphy.com",
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "media1.giphy.com",
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "media2.giphy.com",
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "media4.giphy.com",
        port: '',
        pathname: '/**',
      },
      {
        protocol:"https",
        hostname:"d1yb64k1jgx7ak.cloudfront.net",
        port:'',
        pathname:'/**'
      },
      {
        protocol:"http",
        hostname:"192.168.0.69",
        port:'3005',
        pathname:'/**'
      },
      
    ]
  }
};

export default nextConfig;