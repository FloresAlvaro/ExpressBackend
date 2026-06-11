import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import userRoutes from './modules/users/users.routes.js';
import { logger } from './helper/logger.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware de logging para todas las requests
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(
    { method: req.method, path: req.path, ip: req.ip },
    'Solicitud recibida'
  );
  next();
});

// Middleware
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);

app.get('/health', (req: Request, res: Response) => {
  logger.debug('Endpoint /health consultado');
  res.status(200).json({ status: 'Server is running with TypeScript' });
});

// Middleware para rutas no encontradas (404)
app.use((req: Request, res: Response) => {
  logger.warn(
    { method: req.method, path: req.path },
    'Ruta no encontrada (404)'
  );
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware de manejo de errores global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(
    { error: err.message, stack: err.stack, path: req.path },
    'Error no manejado en la aplicación'
  );
  res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, '🚀 Servidor iniciado correctamente');
});
