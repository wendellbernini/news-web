import { NextResponse } from 'next/server';
import { FacebookConversionsAPI } from '@/lib/facebook/conversionsApi';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_name, custom_data, user_data } = body;

    if (!event_name) {
      return NextResponse.json(
        { error: 'Nome do evento é obrigatório' },
        { status: 400 }
      );
    }

    await FacebookConversionsAPI.sendEvent(
      {
        event_name,
        custom_data,
        user_data,
      },
      request
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Facebook CAPI] Erro ao processar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao processar evento' },
      { status: 500 }
    );
  }
}
