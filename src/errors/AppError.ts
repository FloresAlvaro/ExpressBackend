/**
 * Clase base para todos los errores de la aplicación
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error cuando un recurso no es encontrado
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}

/**
 * Error de validación
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Datos inválidos') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/**
 * Error de conflicto (ej: usuario duplicado)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflicto') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Error de acceso denegado
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso denegado') {
    super(message, 403, 'FORBIDDEN');
  }
}
