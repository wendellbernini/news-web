import { NextRequest, NextResponse } from 'next/server';
import { deleteImageByUrl } from '@/lib/cloudinary/config';

/**
 * API para excluir uma imagem da Cloudinary
 *
 * Esta API é usada para excluir imagens da Cloudinary a partir do lado do cliente.
 * Ela verifica se o usuário está autenticado e tem permissão para excluir imagens.
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação (opcional, dependendo da sua configuração)
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    // }

    // Obtém a URL da imagem do corpo da requisição
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL da imagem não fornecida' },
        { status: 400 }
      );
    }

    // Exclui a imagem da Cloudinary
    const result = await deleteImageByUrl(imageUrl);

    // Retorna o resultado
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao excluir imagem da Cloudinary:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir imagem' },
      { status: 500 }
    );
  }
}
