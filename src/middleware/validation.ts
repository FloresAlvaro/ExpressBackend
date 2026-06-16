import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../helper/logger.js';
import { ApiResponse } from '../utils/response.js';

interface ValidationErrorItem {
  field: string;
  message: string;
  code: string;
}

/**
 * Formatea errores de validación de Zod
 */
const formatValidationErrors = (error: ZodError): ValidationErrorItem[] => {
  return error.issues.map((err) => ({
    field: err.path.join('.') || 'root',
    message: err.message,
    code: err.code,
  }));
};

/**
 * Maneja errores de validación de forma centralizada
 */
const handleValidationError = (error: ZodError, res: Response, context: string) => {
  const formattedErrors = formatValidationErrors(error);
  logger.warn({ errors: formattedErrors, context }, 'Validación fallida');
  return ApiResponse.badRequest(res, 'Validación fallida', formattedErrors);
};

/**
 * Middleware para validar el body de la request
 * @param schema - Esquema de Zod a validar
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        handleValidationError(error, res, 'body');
      }
    }
  };
};

/**
 * Middleware para validar los parámetros de la request
 * @param schema - Esquema de Zod a validar
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData as Record<string, string>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        handleValidationError(error, res, 'params');
      }
    }
  };
};

/**
 * Middleware para validar las queries de la request
 * @param schema - Esquema de Zod a validar
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData as Record<string, string | string[]>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        handleValidationError(error, res, 'query');
      }
    }
  };
};
