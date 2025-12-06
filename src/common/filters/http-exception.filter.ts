import { type ExceptionFilter, Catch, type ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common"
import type { Response } from "express"
import { QueryFailedError } from "typeorm"
import { getFriendlyErrorMessage, getValidationErrorMessage } from "../utils/error-messages.util"

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = "Ocurrió un error inesperado. Por favor, intente nuevamente."
    let errors: any = null
    let technicalDetails: string | undefined

    // Registrar el error para debugging
    this.logger.error(`Error en ${request.method} ${request.url}:`, exception)

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === "object") {
        const responseObj = exceptionResponse as any
        
        // Manejar errores de validación de class-validator
        if (Array.isArray(responseObj.message)) {
          message = getValidationErrorMessage(responseObj.message)
          errors = responseObj.message
        } else {
          message = responseObj.message || message
          errors = responseObj.errors || null
        }
      } else {
        message = exceptionResponse as string
      }
    } else if (exception instanceof QueryFailedError) {
      // Errores de base de datos (PostgreSQL, etc.)
      const friendlyError = getFriendlyErrorMessage(exception)
      status = friendlyError.statusCode
      message = friendlyError.message
      technicalDetails = (exception as any).detail || exception.message
    } else if (exception instanceof Error) {
      // Otros errores estándar de JavaScript
      const friendlyError = getFriendlyErrorMessage(exception)
      status = friendlyError.statusCode
      message = friendlyError.message
      technicalDetails = exception.message
    }

    // Construir la respuesta
    const errorResponse: any = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    }

    // Incluir errores de validación si existen
    if (errors) {
      errorResponse.errors = errors
    }

    // En desarrollo, incluir detalles técnicos para debugging
    if (process.env.NODE_ENV !== 'production' && technicalDetails) {
      errorResponse.technicalDetails = technicalDetails
    }

    response.status(status).json(errorResponse)
  }
}
