import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { Response } from 'express'

@Catch(ConflictError)
export class ConflictErrorFilter implements ExceptionFilter {
  catch(exception: ConflictError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    response.status(409).json({
      statusCode: 409,
      error: 'Conflict',
      message: exception.message,
    })
  }
}
