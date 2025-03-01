import { adminDb } from './firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// Tipos de eventos que podem ser monitorados
export enum EventType {
  ERROR = 'error',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  USER_ACTION = 'user_action',
  SYSTEM = 'system',
}

// Interface para eventos de monitoramento
export interface MonitoringEvent {
  type: EventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: any;
  userId?: string;
  path?: string;
  timestamp?: Date;
  ip?: string;
  userAgent?: string;
}

/**
 * Registra um evento no sistema de monitoramento
 * @param event - Evento a ser registrado
 * @returns ID do evento registrado
 */
export async function logEvent(event: MonitoringEvent): Promise<string> {
  try {
    // Verificar se o evento é válido
    if (!event || typeof event !== 'object') {
      console.error('[Monitoring] Evento inválido:', event);
      return 'invalid-event';
    }

    // Adicionar timestamp se não fornecido
    if (!event.timestamp) {
      event.timestamp = new Date();
    }

    // Garantir que todos os campos obrigatórios estejam presentes
    const safeEvent = {
      type: event.type || EventType.SYSTEM,
      severity: event.severity || 'low',
      message: event.message || 'Evento sem mensagem',
      details: event.details || {},
      timestamp: event.timestamp,
      // Campos opcionais
      ...(event.userId && { userId: event.userId }),
      ...(event.path && { path: event.path }),
      ...(event.ip && { ip: event.ip }),
      ...(event.userAgent && { userAgent: event.userAgent }),
    };

    // Verificar se o Firebase Admin está inicializado
    if (!adminDb) {
      console.error('[Monitoring] Firebase Admin não inicializado');
      // Fallback para console
      console.info('[Monitoring Event]', JSON.stringify(safeEvent));
      return 'firebase-not-initialized';
    }

    // Registrar no Firestore com tratamento de erro
    try {
      const eventRef = await adminDb.collection('monitoring_events').add({
        ...safeEvent,
        timestamp: FieldValue.serverTimestamp(),
      });

      // Para eventos críticos, enviar notificação (implementar conforme necessário)
      if (safeEvent.severity === 'critical') {
        await notifyCriticalEvent(safeEvent);
      }

      return eventRef.id;
    } catch (firestoreError) {
      console.error(
        '[Monitoring] Erro ao salvar no Firestore:',
        firestoreError
      );
      // Fallback para console
      console.info('[Monitoring Event]', JSON.stringify(safeEvent));
      return 'firestore-error';
    }
  } catch (error) {
    console.error('[Monitoring] Erro ao registrar evento:', error);
    // Fallback para console em caso de falha
    try {
      console.error(
        '[Monitoring Event]',
        JSON.stringify(event || { message: 'Evento nulo ou inválido' })
      );
    } catch (jsonError) {
      console.error('[Monitoring] Erro ao serializar evento:', jsonError);
    }
    return 'error-logging-failed';
  }
}

/**
 * Registra um erro no sistema de monitoramento
 * @param error - Erro a ser registrado
 * @param context - Contexto adicional do erro
 * @returns ID do evento registrado
 */
export async function logError(
  error: Error | unknown,
  context: {
    userId?: string;
    path?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    details?: any;
    ip?: string;
    userAgent?: string;
  } = {}
): Promise<string> {
  try {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    return logEvent({
      type: EventType.ERROR,
      severity: context.severity || 'medium',
      message: errorObj.message || 'Erro desconhecido',
      details: {
        stack: errorObj.stack,
        name: errorObj.name,
        ...(context.details || {}),
      },
      userId: context.userId,
      path: context.path,
      ip: context.ip,
      userAgent: context.userAgent,
    });
  } catch (loggingError) {
    console.error('[Monitoring] Falha ao registrar erro:', loggingError);
    return 'error-logging-error';
  }
}

/**
 * Registra uma tentativa de violação de segurança
 * @param message - Mensagem descrevendo a violação
 * @param context - Contexto adicional da violação
 * @returns ID do evento registrado
 */
export async function logSecurityEvent(
  message: string,
  context: {
    userId?: string;
    path?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    details?: any;
    ip?: string;
    userAgent?: string;
  } = {}
): Promise<string> {
  return logEvent({
    type: EventType.SECURITY,
    severity: context.severity || 'high',
    message,
    details: context.details,
    userId: context.userId,
    path: context.path,
    ip: context.ip,
    userAgent: context.userAgent,
  });
}

/**
 * Registra métricas de performance
 * @param message - Descrição da métrica
 * @param duration - Duração em milissegundos
 * @param context - Contexto adicional
 * @returns ID do evento registrado
 */
export async function logPerformance(
  message: string,
  duration: number,
  context: {
    userId?: string;
    path?: string;
    details?: any;
  } = {}
): Promise<string> {
  // Determinar severidade com base na duração
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

  if (duration > 5000) {
    severity = 'critical';
  } else if (duration > 2000) {
    severity = 'high';
  } else if (duration > 1000) {
    severity = 'medium';
  }

  return logEvent({
    type: EventType.PERFORMANCE,
    severity,
    message,
    details: {
      duration,
      ...context.details,
    },
    userId: context.userId,
    path: context.path,
  });
}

/**
 * Notifica sobre eventos críticos (implementação de exemplo)
 * @param event - Evento crítico
 */
async function notifyCriticalEvent(event: MonitoringEvent): Promise<void> {
  // Implementar notificação por email, SMS, etc.
  console.error('[CRITICAL EVENT]', JSON.stringify(event));

  // Registrar em uma coleção separada para eventos críticos
  await adminDb.collection('critical_events').add({
    ...event,
    notifiedAt: FieldValue.serverTimestamp(),
  });

  // Aqui você pode adicionar integração com serviços como SendGrid, Twilio, etc.
}

/**
 * Middleware para monitorar performance de APIs
 * @param handler - Handler da API
 * @returns Handler com monitoramento
 */
export function withPerformanceMonitoring(
  handler: (req: Request, ...args: unknown[]) => Promise<Response> | Response
) {
  return async (req: Request, ...rest: unknown[]) => {
    const start = performance.now();
    try {
      // Executar o handler original
      const result = await handler(req, ...rest);

      // Registrar performance
      const duration = performance.now() - start;

      // Registrar apenas se a duração for significativa (> 500ms)
      if (duration > 500) {
        logPerformance(`API ${req.method} ${req.url}`, duration, {
          path: req.url,
          details: {
            method: req.method,
            headers: Object.fromEntries(req.headers),
          },
        }).catch(console.error);
      }

      return result;
    } catch (error) {
      // Registrar erro e performance
      const duration = performance.now() - start;

      logError(error, {
        severity: 'high',
        path: req.url,
        details: {
          duration,
          method: req.method,
          headers: Object.fromEntries(req.headers),
        },
      }).catch(console.error);

      throw error;
    }
  };
}
