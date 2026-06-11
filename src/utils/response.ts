import { Response } from 'express';

/**
 * Interfaz para respuestas exitosas
 */
export interface SuccessResponse<T> {
  status: 'success';
  message: string;
  data: T;
}

/**
 * Interfaz para respuestas de error
 */
export interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  errors?: any[];
}

/**
 * Clase para estandarizar respuestas de la API
 */
export class ApiResponse {
  /**
   * Envía una respuesta exitosa
   */
  static success<T>(
    res: Response,
    data: T,
    status: number = 200,
    message: string = 'Éxito'
  ): Response {
    return res.status(status).json({
      status: 'success',
      message,
      data,
    });
  }

  /**
   * Envía una respuesta de error
   */
  static error(
    res: Response,
    message: string,
    status: number = 500,
    code?: string,
    errors?: any[]
  ): Response {
    return res.status(status).json({
      status: 'error',
      message,
      ...(code && { code }),
      ...(errors && { errors }),
    });
  }

  /**
   * Envía un error 404 (No encontrado)
   */
  static notFound(
    res: Response,
    message: string = 'Recurso no encontrado'
  ): Response {
    return this.error(res, message, 404, 'NOT_FOUND');
  }

  /**
   * Envía un error 400 (Solicitud inválida)
   */
  static badRequest(
    res: Response,
    message: string = 'Solicitud inválida',
    errors?: any[]
  ): Response {
    return this.error(res, message, 400, 'BAD_REQUEST', errors);
  }

  /**
   * Envía un error 409 (Conflicto)
   */
  static conflict(
    res: Response,
    message: string = 'Conflicto'
  ): Response {
    return this.error(res, message, 409, 'CONFLICT');
  }

  /**
   * Envía un error 403 (Acceso denegado)
   */
  static forbidden(
    res: Response,
    message: string = 'Acceso denegado'
  ): Response {
    return this.error(res, message, 403, 'FORBIDDEN');
  }

  /**
   * Envía un error 500 (Error interno del servidor)
   */
  static internalError(
    res: Response,
    message: string = 'Error interno del servidor'
  ): Response {
    return this.error(res, message, 500, 'INTERNAL_ERROR');
  }
}
