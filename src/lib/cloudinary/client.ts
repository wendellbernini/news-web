/**
 * Serviço do lado do cliente para interagir com o Cloudinary
 *
 * Este arquivo contém funções que podem ser importadas com segurança em componentes do lado do cliente.
 * Ele faz chamadas à API em vez de usar diretamente o SDK do Cloudinary.
 */

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
 * Faz upload de uma imagem para o Cloudinary
 * @param file Arquivo de imagem a ser enviado
 * @returns Objeto com a URL e o public_id da imagem
 */
export const uploadImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao fazer upload da imagem');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao fazer upload de imagem para o Cloudinary:', error);
    throw error;
  }
};

/**
 * Exclui uma imagem da Cloudinary pela sua URL
 * @param url URL da imagem da Cloudinary
 * @returns O resultado da operação de exclusão
 */
export const deleteImageByUrl = async (url: string) => {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl: url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao excluir imagem');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao excluir imagem da Cloudinary:', error);
    throw error;
  }
};
