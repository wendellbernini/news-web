import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary/config';

/**
 * API para fazer upload de imagens para o Cloudinary
 *
 * Esta API é usada para fazer upload de imagens para o Cloudinary a partir do lado do cliente.
 * Ela recebe um FormData com a imagem e retorna a URL da imagem após o upload.
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação (opcional, dependendo da sua configuração)
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    // }

    // Obtém o FormData da requisição
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      );
    }

    // Faz upload da imagem para o Cloudinary
    const result = (await uploadImage(file)) as {
      secure_url: string;
      public_id: string;
      [key: string]: string | number | boolean | null;
    };

    // Retorna a URL da imagem
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Erro ao fazer upload de imagem para o Cloudinary:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload de imagem' },
      { status: 500 }
    );
  }
}
