/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'lh3.googleusercontent.com', // Para fotos de perfil do Google
    ],
  },
};

export default nextConfig;
