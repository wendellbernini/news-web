/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Para fotos de perfil do Google
      },
    ],
  },
  // Configuração para lidar com módulos do Node.js no lado do cliente
  webpack: (config, { isServer }) => {
    // Se estiver no lado do cliente, forneça versões vazias dos módulos do Node.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
