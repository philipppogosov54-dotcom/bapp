import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
        ? exception.message
        : 'Internal server error';

    // Log the error
    console.error('=== EXCEPTION CAUGHT ===');
    console.error('URL:', request.url);
    console.error('Method:', request.method);
    console.error('Status:', status);
    console.error('Exception:', exception);
    if (exception instanceof Error) {
      console.error('Stack:', exception.stack);
    }
    console.error('========================');

    response.status(status).json({
      statusCode: status,
      message: typeof message === 'object' ? (message as any).message || message : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
