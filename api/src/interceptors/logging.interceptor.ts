import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    // Log incoming request
    this.logger.log(
      `🚀 ${method} ${url} | Query: ${JSON.stringify(query)} | Params: ${JSON.stringify(params)} | Body: ${JSON.stringify(body)} | User-Agent: ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: data => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const responseTime = Date.now() - now;

          // Log successful response
          this.logger.log(`✅ ${method} ${url} | Status: ${statusCode} | Time: ${responseTime}ms`);
        },
        error: error => {
          const responseTime = Date.now() - now;

          // Log error response
          this.logger.error(
            `❌ ${method} ${url} | Error: ${error.message} | Time: ${responseTime}ms`,
          );
        },
      }),
    );
  }
}
