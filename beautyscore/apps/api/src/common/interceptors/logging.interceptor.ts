/**
 * Logging Interceptor
 * Logs all HTTP requests with timing, user info, and response status
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

interface RequestWithUser extends Request {
  user?: { id: string; email?: string };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithUser>();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl, body } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = request.user?.id || 'anonymous';

    // Sanitize body - remove sensitive fields
    const sanitizedBody = this.sanitizeBody(body);

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          this.logger.log(
            `${method} ${originalUrl} ${statusCode} ${duration}ms - User: ${userId} - UA: ${userAgent.substring(0, 50)}`,
          );

          // Log body for non-GET requests (useful for debugging)
          if (method !== 'GET' && Object.keys(sanitizedBody).length > 0) {
            this.logger.debug(`Body: ${JSON.stringify(sanitizedBody)}`);
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.logger.error(
            `${method} ${originalUrl} ${statusCode} ${duration}ms - User: ${userId} - Error: ${error.message}`,
          );
        },
      }),
    );
  }

  /**
   * Remove sensitive fields from request body for logging
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return {};
    }

    const sensitiveFields = [
      'password',
      'currentPassword',
      'newPassword',
      'token',
      'refreshToken',
      'accessToken',
      'apiKey',
      'secret',
      'creditCard',
      'cvv',
    ];

    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
