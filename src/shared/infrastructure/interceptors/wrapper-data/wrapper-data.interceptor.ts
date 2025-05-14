import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable, map } from 'rxjs'

@Injectable()
export class WrapperDataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(body => {
        if (
          body &&
          typeof body === 'object' &&
          ('accessToken' in body || 'meta' in body)
        ) {
          return body
        }

        return { data: body }
      }),
    )
  }
}
