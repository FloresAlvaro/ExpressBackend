import { Request, Response, NextFunction } from 'express';
import { logger } from '../helper/logger.js';
import { AppError } from '../errors/AppError.js';
import { ApiResponse } from './response.js';

/**
 * Wrapper para funciones de controlador async
 * Centraliza el manejo de errores y logging
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch((error: Error) => {
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
        return ApiResponse.error(
          res,
          error.message,
          error.statusCode,
          error.code
        );
      }

      // Error genérico
      return ApiResponse.internalError(res);
    });
  };
};
