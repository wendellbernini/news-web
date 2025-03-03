import axios from 'axios';
import { createHash } from 'crypto';

interface ConversionEvent {
  event_name: string;
  event_time: number;
  user_data: {
    client_ip_address?: string;
    client_user_agent?: string;
    em?: string; // Email hash
    ph?: string; // Phone hash
    external_id?: string;
  };
  custom_data?: {
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    value?: number;
    currency?: string;
    search_string?: string;
    status?: boolean;
    [key: string]: any;
  };
  action_source:
    | 'website'
    | 'email'
    | 'app'
    | 'phone_call'
    | 'chat'
    | 'physical_store'
    | 'system_generated'
    | 'other';
}

class FacebookConversionsAPI {
  private static readonly API_VERSION = 'v18.0';
  private static readonly BASE_URL = `https://graph.facebook.com/${FacebookConversionsAPI.API_VERSION}`;
  private static readonly PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  private static readonly ACCESS_TOKEN =
    process.env.FACEBOOK_CONVERSIONS_API_ACCESS_TOKEN;

  /**
   * Envia um evento para a API de Conversões do Facebook
   */
  static async sendEvent(event: Partial<ConversionEvent>, req?: Request) {
    if (!this.PIXEL_ID || !this.ACCESS_TOKEN) {
      console.warn('[Facebook CAPI] Credenciais não configuradas');
      return;
    }

    try {
      const clientIp =
        req?.headers.get('x-real-ip') ||
        req?.headers.get('x-forwarded-for')?.split(',')[0] ||
        undefined;
      const userAgent = req?.headers.get('user-agent') || undefined;

      const eventData: ConversionEvent = {
        event_name: event.event_name!,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: {
          client_ip_address: clientIp,
          client_user_agent: userAgent,
          ...event.user_data,
        },
        custom_data: event.custom_data,
      };

      const response = await axios.post(
        `${this.BASE_URL}/${this.PIXEL_ID}/events`,
        {
          data: [eventData],
          access_token: this.ACCESS_TOKEN,
        }
      );

      console.log(
        '[Facebook CAPI] Evento enviado com sucesso:',
        event.event_name
      );
      return response.data;
    } catch (error) {
      console.error('[Facebook CAPI] Erro ao enviar evento:', error);
      throw error;
    }
  }

  /**
   * Rastreia visualização de notícia
   */
  static async trackArticleView(
    articleData: {
      title: string;
      category: string;
      id: string;
      author: string;
    },
    req?: Request
  ) {
    return this.sendEvent(
      {
        event_name: 'ViewContent',
        custom_data: {
          content_name: articleData.title,
          content_category: articleData.category,
          content_ids: [articleData.id],
          content_type: 'article',
          author: articleData.author,
        },
      },
      req
    );
  }

  /**
   * Rastreia inscrição na newsletter
   */
  static async trackNewsletterSignup(email: string, req?: Request) {
    return this.sendEvent(
      {
        event_name: 'Lead',
        custom_data: {
          content_name: 'Newsletter Signup',
          content_category: 'newsletter',
          status: true,
        },
        user_data: {
          em: this.hashData(email), // Hash do email para privacidade
        },
      },
      req
    );
  }

  /**
   * Rastreia busca no site
   */
  static async trackSearch(
    searchQuery: string,
    resultsCount: number,
    req?: Request
  ) {
    return this.sendEvent(
      {
        event_name: 'Search',
        custom_data: {
          search_string: searchQuery,
          content_category: 'search',
          value: resultsCount,
        },
      },
      req
    );
  }

  /**
   * Hash de dados sensíveis (email, telefone) para privacidade
   */
  private static hashData(data: string): string {
    if (typeof window === 'undefined') {
      return createHash('sha256')
        .update(data.toLowerCase().trim())
        .digest('hex');
    }
    return ''; // No cliente, não fazemos hash
  }
}

export { FacebookConversionsAPI, type ConversionEvent };
