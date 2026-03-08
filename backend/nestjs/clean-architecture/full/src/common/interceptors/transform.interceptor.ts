import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

export const RESPONSE_MESSAGE_KEY = 'responseMessage';
export const SKIP_TRANSFORM_KEY = 'skipTransform';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skip = this.reflector.get<boolean>(SKIP_TRANSFORM_KEY, context.getHandler())
      || this.reflector.get<boolean>(SKIP_TRANSFORM_KEY, context.getClass());

    if (skip) {
      return next.handle();
    }

    const message = this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) || 'Operation successful';

    return next.handle().pipe(
      map(data => {
        // If the response is null/undefined (204 responses), don't wrap
        if (data === undefined || data === null) {
          return data;
        }

        // If response already has pagination (paginated result), flatten it
        if (data && typeof data === 'object' && 'data' in data && 'pagination' in data) {
          return {
            success: true,
            message,
            data: data.data,
            pagination: data.pagination,
          };
        }

        return {
          success: true,
          message,
          data,
        };
      }),
    );
  }
}
