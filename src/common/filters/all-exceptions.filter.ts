import {
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import {
  getFriendlyErrorMessage,
  getValidationErrorMessage,
} from '../utils/error-messages.util';

/**
 * Filtro global que captura TODOS los errores no manejados del API.
 *
 * - Preserva el manejo de errores amigables del HttpExceptionFilter original.
 * - En producción/staging, los errores 500+ se notifican automáticamente via:
 *     · Discord Webhook  → variable DISCORD_ERROR_WEBHOOK_URL
 *     · Telegram Bot     → variables TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ocurrió un error inesperado. Por favor, intente nuevamente.';
    let errors: unknown = null;
    let logMessage: string = String(exception);

    // ── 1. Clasificar el error ────────────────────────────────────────────

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      logMessage = exception.message;

      if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        if (Array.isArray(responseObj.message)) {
          message = getValidationErrorMessage(responseObj.message as string[]);
          errors = responseObj.message;
        } else {
          message = (responseObj.message as string) || message;
          errors = responseObj.errors || null;
        }
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof QueryFailedError) {
      const friendlyError = getFriendlyErrorMessage(exception);
      status = friendlyError.statusCode;
      message = friendlyError.message;
      logMessage =
        (exception as QueryFailedError & { detail?: string }).detail ||
        exception.message;
    } else if (exception instanceof Error) {
      const friendlyError = getFriendlyErrorMessage(exception);
      status = friendlyError.statusCode;
      message = friendlyError.message;
      logMessage = exception.message;
    }

    const stack =
      exception instanceof Error ? exception.stack : undefined;

    // ── 2. Log técnico completo ───────────────────────────────────────────
    this.logger.error(
      `[${status}] ${request.method} ${request.url} — ${logMessage}`,
      stack,
    );

    // ── 3. Notificar errores críticos en producción/staging ───────────────
    const isProduction = ['production', 'staging'].includes(
      process.env.NODE_ENV ?? '',
    );

    if (status >= 500 && isProduction) {
      this.sendNotifications({ status, message: logMessage, stack, request }).catch(
        (err) => this.logger.warn('No se pudo enviar notificación de error', err),
      );
    }

    // ── 4. Respuesta al cliente ───────────────────────────────────────────
    const errorResponse: Record<string, unknown> = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (errors) {
      errorResponse.errors = errors;
    }

    if (
      process.env.NODE_ENV === 'development' &&
      !(exception instanceof HttpException)
    ) {
      errorResponse.debug = logMessage;
    }

    response.status(status).json(errorResponse);
  }

  // ─────────────────────────────────────────────────────────────────────
  // Coordinador de canales de notificación
  // ─────────────────────────────────────────────────────────────────────

  private async sendNotifications(ctx: NotificationContext) {
    const tasks: Promise<void>[] = [];

    if (process.env.DISCORD_ERROR_WEBHOOK_URL) {
      tasks.push(this.notifyDiscord(ctx));
    }

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      tasks.push(this.notifyTelegram(ctx));
    }

    if (tasks.length === 0) {
      this.logger.warn(
        'AllExceptionsFilter: Ningún canal de notificación configurado. ' +
          'Agrega DISCORD_ERROR_WEBHOOK_URL o TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID en las variables de entorno.',
      );
    }

    await Promise.allSettled(tasks);
  }

  // ─────────────────────────────────────────────────────────────────────
  // Canal 1: Discord Webhook
  // ─────────────────────────────────────────────────────────────────────

  private async notifyDiscord(ctx: NotificationContext) {
    const { status, message, stack, request } = ctx;
    const env = process.env.NODE_ENV ?? 'unknown';
    const appName = process.env.APP_NAME ?? 'API';
    const stackSnippet = stack
      ? stack.split('\n').slice(0, 8).join('\n')
      : 'Sin stack trace';

    const body = {
      username: `${appName} — Error Monitor`,
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
      embeds: [
        {
          title: `🚨 Error ${status} en ${appName} [${env.toUpperCase()}]`,
          color: 0xff0000,
          fields: [
            {
              name: '🏷️ Proyecto',
              value: appName,
              inline: true,
            },
            {
              name: '🌍 Ambiente',
              value: env.toUpperCase(),
              inline: true,
            },
            {
              name: '📍 Endpoint',
              value: `\`${request.method} ${request.url}\``,
              inline: false,
            },
            {
              name: '🕐 Hora',
              value: new Date().toLocaleString('es-MX', {
                timeZone: 'America/Hermosillo',
              }),
              inline: true,
            },
            {
              name: '💬 Mensaje',
              value: message.substring(0, 1024),
            },
            {
              name: '📋 Stack trace',
              value: `\`\`\`\n${stackSnippet.substring(0, 1000)}\n\`\`\``,
            },
          ],
          footer: { text: `${appName} • Error Monitor` },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const res = await fetch(process.env.DISCORD_ERROR_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Discord webhook respondió ${res.status}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // Canal 2: Telegram Bot (Opcional)
  // ─────────────────────────────────────────────────────────────────────

  private async notifyTelegram(ctx: NotificationContext) {
    const { status, message, stack, request } = ctx;
    const env = process.env.NODE_ENV ?? 'unknown';
    const appName = process.env.APP_NAME ?? 'API';
    const stackSnippet = stack
      ? stack.split('\n').slice(0, 6).join('\n')
      : 'Sin stack trace';

    const text =
      `🚨 *Error ${status} en ${appName} [${env.toUpperCase()}]*\n\n` +
      `🏷️ *Proyecto:* ${appName}\n` +
      `📍 \`${request.method} ${request.url}\`\n` +
      `🕐 ${new Date().toLocaleString('es-MX', { timeZone: 'America/Hermosillo' })}\n\n` +
      `💬 *Mensaje:*\n${escapeMarkdown(message.substring(0, 500))}\n\n` +
      `📋 *Stack:*\n\`\`\`\n${stackSnippet.substring(0, 800)}\n\`\`\``;

    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Telegram respondió ${res.status}: ${body}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────
// Tipos e helpers privados
// ─────────────────────────────────────────────────────────────────────

interface NotificationContext {
  status: number;
  message: string;
  stack: string | undefined;
  request: Request;
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}
