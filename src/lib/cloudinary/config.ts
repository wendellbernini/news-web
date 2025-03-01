import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadImage = async (file: File) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  const dataURI = `data:${file.type};base64,${base64}`;

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: 'news',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
    });

    return result;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
};

/**
 * Extrai o public_id de uma URL da Cloudinary
 * @param url URL da imagem da Cloudinary
 * @returns O public_id da imagem ou null se não for possível extrair
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }

  // Formato típico: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/news/abcdef123456.jpg
  const regex = /\/v\d+\/([^/]+\/[^.]+)/;
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1];
  }

  return null;
};

/**
 * Exclui uma imagem da Cloudinary pelo seu public_id
 * @param publicId O public_id da imagem a ser excluída
 * @returns O resultado da operação de exclusão
 */
export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
    return result;
  } catch (error) {
    console.error('Erro ao excluir imagem da Cloudinary:', error);
    throw error;
  }
};

/**
 * Exclui uma imagem da Cloudinary pela sua URL
 * @param url URL da imagem da Cloudinary
 * @returns O resultado da operação de exclusão ou null se não for possível extrair o public_id
 */
export const deleteImageByUrl = async (url: string) => {
  const publicId = extractPublicIdFromUrl(url);

  if (!publicId) {
    console.warn('Não foi possível extrair o public_id da URL:', url);
    return null;
  }

  return await deleteImage(publicId);
};

export default cloudinary;
