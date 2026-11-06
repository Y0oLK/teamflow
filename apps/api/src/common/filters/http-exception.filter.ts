import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorName = 'InternalServerError';
    let message: string | string[] = 'An unexpected internal server error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const responseObj = res as Record<string, unknown>;
        errorName = (responseObj['error'] as string) || exception.name;
        message = (responseObj['message'] as string | string[]) || exception.message;
      }
    } else if (exception instanceof Error) {
      errorName = exception.name;
      // In development, show error message; in production, keep generic to avoid information disclosure
      if (process.env.NODE_ENV !== 'production') {
        message = exception.message;
      }
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    } else {
      this.logger.error('Unhandled non-Error exception', JSON.stringify(exception));
    }

    // Never log sensitive tokens or passwords
    const sanitizedBody = { ...request.body };
    delete sanitizedBody.password;
    delete sanitizedBody.passwordHash;
    delete sanitizedBody.token;

    this.logger.warn(
      `[${request.method}] ${request.url} - Status: ${status} - Error: ${errorName} - IP: ${request.ip}`
    );

    response.status(status).json({
      statusCode: status,
      error: errorName,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

