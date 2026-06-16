import { Request, Response, NextFunction } from 'express';
import { logger } from '../helper/logger.js';
import { AppError } from '../errors/AppError.js';
import { ApiResponse } from './response.js';

/**
 * Wrapper para funciones de controlador async
 * Centraliza el manejo de errores y logging
 */
export const asyncHandler = (
  // eslint-disable-next-line no-unused-vars
  fn: (_req: Request, _res: Response, _next: NextFunction) => Promise<Response | void>
) => {
  return (_req: Request, _res: Response, _next: NextFunction) => {
    return Promise.resolve(fn(_req, _res, _next)).catch((error: Error) => {
      // Log del error
      if (error instanceof AppError) {
        logger.warn(
          { error: error.message, code: error.code, statusCode: error.statusCode },
          'Error de aplicación'
        );
      } else {
        logger.error(
          { error: error.message, stack: error.stack },
          'Error no manejado en controlador'
        );
      }

      // Manejo del error
      if (error instanceof AppError) {
        return ApiResponse.error(_res, error.message, error.statusCode, error.code);
      }

      // Error genérico
      return ApiResponse.internalError(_res);
    });
  };
};
