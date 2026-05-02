/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/api/py/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:8000/api/py/:path*' 
          : '/api/index.py',
      },
    ];
  },
};

export default nextConfig;
