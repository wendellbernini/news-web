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
      {
        protocol: 'https',
        hostname: 'ichef.bbci.co.uk', // Para imagens da BBC
      },
      {
        protocol: 'https',
        hostname: '*.bbc.co.uk', // Para outros domínios da BBC
      },
      {
        protocol: 'https',
        hostname: '*.bbc.com', // Para domínios internacionais da BBC
      },
      {
        protocol: 'https',
        hostname: 'exemplo.com', // Temporário para desenvolvimento
      },
    ],
  },
  // Configuração para lidar com módulos do Node.js no lado do cliente
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      dns: false,
      child_process: false,
      tls: false,
    };

    return config;
  },
};

export default nextConfig;
