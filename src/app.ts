import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import userRoutes from './modules/users/users.routes.js';
import { logger } from './helper/logger.js';
import { config, validateConfig } from './config/config.js';
import { ApiResponse } from './utils/response.js';
import { AppError } from './errors/AppError.js';

dotenv.config();

// Validar configuración
try {
  validateConfig();
} catch (error) {
  logger.error(error, 'Error en configuración');
  process.exit(1);
}

const app: Application = express();

// Middleware de logging para todas las requests
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info({ method: req.method, path: req.path, ip: req.ip }, 'Solicitud recibida');
  next();
});

// Middleware de parseo JSON
app.use(express.json({ limit: config.maxRequestSize }));

// Rutas
app.use(`/api/${config.apiVersion}/users`, userRoutes);

app.get('/health', (req: Request, res: Response) => {
  logger.debug('Endpoint /health consultado');
  return ApiResponse.success(
    res,
    { status: 'Server is running with TypeScript' },
    200,
    'Health check'
  );
});

// Middleware para rutas no encontradas (404)
app.use((req: Request, res: Response) => {
  logger.warn({ method: req.method, path: req.path }, 'Ruta no encontrada (404)');
  return ApiResponse.notFound(res, 'Ruta no encontrada');
});

// Middleware de manejo de errores global
// eslint-disable-next-line no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  // Manejo de errores de aplicación
  if (err instanceof AppError) {
    logger.warn(
      { error: err.message, code: err.code, statusCode: err.statusCode },
      'Error de aplicación'
    );
    return ApiResponse.error(res, err.message, err.statusCode, err.code);
  }

  // Manejo de errores genéricos
  logger.error(
    { error: err.message, stack: err.stack, path: req.path },
    'Error no manejado en la aplicación'
  );
  return ApiResponse.internalError(res);
});

app.listen(config.port, () => {
  logger.info(
    { port: config.port, environment: config.environment },
    '🚀 Servidor iniciado correctamente'
  );
});
