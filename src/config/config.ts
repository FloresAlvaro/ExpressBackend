/**
 * Configuración centralizada de la aplicación
 * Los valores se leen de variables de entorno
 */
export const config = {
  // Puerto
  port: parseInt(process.env.PORT || '3000', 10),

  // Entorno
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Simulación de BD (solo desarrollo)
  dbDelayMs: parseInt(process.env.DB_DELAY_MS || '50', 10),

  // Versión de API
  apiVersion: 'v1',

  // Límites
  maxRequestSize: '10mb',
  requestTimeout: 30000, // 30 segundos
};

/**
 * Validar configuración crítica
 */
export const validateConfig = () => {
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error(`Puerto inválido: ${config.port}`);
  }

  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  if (!validLogLevels.includes(config.logLevel)) {
    throw new Error(`Nivel de log inválido: ${config.logLevel}`);
  }
};
