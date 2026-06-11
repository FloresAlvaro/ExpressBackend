# 🔄 Propuestas de Refactorización para Express Repo

## 1. **Error Handling Centralizado** ⚠️

### Problema Actual
```typescript
// Se repite en cada controlador
try {
  const users = await userService.getAllUsers(filterStatus);
  res.status(200).json(users);
} catch (error) {
  logger.error({ error, stack: error instanceof Error ? error.stack : undefined }, "...");
  res.status(500).json({ message: "Error..." });
}
```

### Solución: Crear un Wrapper
```typescript
// src/utils/asyncHandler.ts
export const asyncHandler = (
  fn: (req: Request, res: Response) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res)).catch(next);
  };
};

// En el controlador
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const users = await userService.getAllUsers(status);
  res.status(200).json(users);
});
```

**Beneficios:**
- ✅ Reduce código duplicado
- ✅ Centraliza manejo de errores
- ✅ Más limpio y mantenible

---

## 2. **Respuestas Estandarizadas** 📦

### Problema Actual
```typescript
res.status(200).json(users);
res.status(201).json(newUser);
res.status(404).json({ message: "Usuario no encontrado" });
res.status(500).json({ message: "Error al obtener usuarios" });
```

### Solución: Crear una Clase de Respuesta
```typescript
// src/utils/response.ts
export class ApiResponse {
  static success(res: Response, data: any, status = 200, message = 'Éxito') {
    return res.status(status).json({
      status: 'success',
      message,
      data,
    });
  }

  static error(res: Response, message: string, status = 500, errors?: any) {
    return res.status(status).json({
      status: 'error',
      message,
      errors,
    });
  }

  static notFound(res: Response, message = 'Recurso no encontrado') {
    return this.error(res, message, 404);
  }
}

// En el controlador
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.getAllUsers(status);
  return ApiResponse.success(res, users, 200, 'Usuarios obtenidos');
});
```

**Beneficios:**
- ✅ Respuestas consistentes
- ✅ Más corto el código
- ✅ Fácil de cambiar el formato global

---

## 3. **Extraer Lógica de Controlador a Servicio** 🎯

### Problema Actual
```typescript
// En el controlador (getUsers)
const { status } = req.query;
const allowedStatuses = ["active", "inactive", "all"];
const filterStatus = allowedStatuses.includes(status as string)
  ? (status as "active" | "inactive" | "all")
  : "active";
const users = await userService.getAllUsers(filterStatus);
```

### Solución: Mover la Lógica al Servicio
```typescript
// En users.service.ts
export const getAllUsersWithFilter = async (status?: string): Promise<User[]> => {
  const allowedStatuses = ["active", "inactive", "all"];
  const filterStatus = allowedStatuses.includes(status as string)
    ? (status as "active" | "inactive" | "all")
    : "active";
  return getAllUsers(filterStatus);
};

// En el controlador
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const users = await userService.getAllUsersWithFilter(status as string);
  ApiResponse.success(res, users, 200, 'Usuarios obtenidos');
});
```

**Beneficios:**
- ✅ Controladores más simples
- ✅ Lógica centralizada en servicios
- ✅ Más fácil de testear

---

## 4. **Usar Tipos de Retorno Estándar** 🏷️

### Problema Actual
```typescript
export const updateUser = async (id: number, data: UpdateUserData): Promise<User | null> => {
  // ...
  return null; // ¿Qué significa esto?
}
```

### Solución: Crear Tipos de Resultado
```typescript
// src/types/result.ts
export type Result<T> = Success<T> | Failure;

export interface Success<T> {
  type: 'success';
  data: T;
}

export interface Failure {
  type: 'error';
  message: string;
  code: string;
}

// En el servicio
export const updateUser = async (id: number, data: UpdateUserData): Promise<Result<User>> => {
  const user = findUser(id);
  if (!user) {
    return { type: 'error', message: 'Usuario no encontrado', code: 'NOT_FOUND' };
  }
  // ...
  return { type: 'success', data: updatedUser };
};

// En el controlador
const result = await userService.updateUser(id, data);
if (result.type === 'error') {
  return ApiResponse.error(res, result.message, 404);
}
return ApiResponse.success(res, result.data);
```

**Beneficios:**
- ✅ Tipo-seguro
- ✅ Explícito (success/error)
- ✅ Mejor manejo de errores

---

## 5. **Consolidar Validación en Middlewares** ✔️

### Problema Actual
```typescript
// En getUsers
const allowedStatuses = ["active", "inactive", "all"];
const filterStatus = allowedStatuses.includes(status as string)
  ? (status as "active" | "inactive" | "all")
  : "active";
```

### Solución: Ya lo tienes con Zod, pero mejorarlo
```typescript
// src/middleware/validation.ts - Mejorado
export const handleValidationError = (error: any, res: Response) => {
  logger.warn(
    { errors: error.errors },
    'Validación fallida'
  );
  res.status(400).json({
    status: 'error',
    message: 'Validación fallida',
    errors: error.errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    })),
  });
};

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error: any) {
      handleValidationError(error, res);
    }
  };
};
```

**Beneficios:**
- ✅ DRY (Don't Repeat Yourself)
- ✅ Reutilizable
- ✅ Fácil de mantener

---

## 6. **Crear una Clase Base para Controladores** 📋

### Solución: Controlador Base
```typescript
// src/base/BaseController.ts
export abstract class BaseController {
  protected logger = logger;

  protected async execute(
    fn: () => Promise<any>,
    res: Response,
    successStatus = 200
  ) {
    try {
      const result = await fn();
      return ApiResponse.success(res, result, successStatus);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  protected handleError(error: any, res: Response) {
    this.logger.error({ error }, 'Error en operación');
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    return ApiResponse.error(res, 'Error interno del servidor', 500);
  }
}

// En el controlador
export class UserController extends BaseController {
  async getUsers(req: Request, res: Response) {
    return this.execute(
      async () => userService.getAllUsersWithFilter(req.query.status as string),
      res
    );
  }
}
```

**Beneficios:**
- ✅ Código repetido eliminado
- ✅ Consistencia en errores
- ✅ Escalable a otros módulos

---

## 7. **Usar DTOs (Data Transfer Objects)** 📊

### Problema Actual
```typescript
// No hay distinción clara entre datos internos y respuestas
export const createUser = async (userData: CreateUserData): Promise<User> => {
  // Retorna el User completo incluyendo isActive internamente
}
```

### Solución: Crear DTOs
```typescript
// src/modules/users/dto/CreateUserRequest.dto.ts
export interface CreateUserRequest {
  name: string;
  email: string;
}

// src/modules/users/dto/UserResponse.dto.ts
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  createdAt?: Date;
}

// src/modules/users/mapper/UserMapper.ts
export class UserMapper {
  static toResponse(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}

// En el controlador
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.getAllUsersWithFilter(status);
  const response = users.map(UserMapper.toResponse);
  ApiResponse.success(res, response);
});
```

**Beneficios:**
- ✅ Separación clara de responsabilidades
- ✅ Más seguro (no expone datos internos)
- ✅ Flexibilidad en respuestas

---

## 8. **Crear Custom Errors** 🚨

### Solución
```typescript
// src/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Datos inválidos') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

// En el servicio
export const updateUser = async (id: number, data: UpdateUserData): Promise<User> => {
  const user = findUser(id);
  if (!user) {
    throw new NotFoundError('Usuario');
  }
  // ...
};

// En el middleware global de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }
  return ApiResponse.error(res, 'Error interno del servidor', 500);
});
```

**Beneficios:**
- ✅ Errores tipados
- ✅ Códigos de error consistentes
- ✅ Stack trace preservado

---

## 9. **Usar Enums para Constantes** 📌

### Problema Actual
```typescript
const allowedStatuses = ["active", "inactive", "all"];
```

### Solución
```typescript
// src/constants/UserStatus.enum.ts
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ALL = 'all',
}

// Usar en Zod
export const userStatusQuerySchema = z.object({
  status: z.nativeEnum(UserStatus).optional().default(UserStatus.ACTIVE),
});

// Usar en servicios
export const getAllUsers = async (status: UserStatus): Promise<User[]> => {
  switch (status) {
    case UserStatus.ACTIVE:
      return usersDatabase.filter(u => u.isActive);
    case UserStatus.INACTIVE:
      return usersDatabase.filter(u => !u.isActive);
    case UserStatus.ALL:
      return usersDatabase;
  }
};
```

**Beneficios:**
- ✅ Type-safe
- ✅ Autocomplete en IDE
- ✅ Evita typos

---

## 10. **Extraer Configuración a Variables de Entorno** 🔧

### Problema Actual
```typescript
const PORT = process.env.PORT || 3000;
const simulateDbDelay = 50; // Hardcoded
```

### Solución
```typescript
// src/config/config.ts
export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  dbDelayMs: parseInt(process.env.DB_DELAY_MS || '50', 10),
  apiVersion: 'v1',
};

// En app.ts
import { config } from './config/config.js';

app.listen(config.port, () => {
  logger.info({ port: config.port }, '🚀 Servidor iniciado');
});

// En .env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
DB_DELAY_MS=50
```

**Beneficios:**
- ✅ Fácil de cambiar sin recompilar
- ✅ Diferente config por ambiente
- ✅ Más seguro (no hardcodear)

---

## 11. **Agregar Request ID para Tracing** 🔍

### Solución
```typescript
// src/middleware/requestId.ts
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.id = req.get('x-request-id') || uuidv4();
  res.setHeader('x-request-id', req.id);
  next();
};

// En app.ts
app.use(requestIdMiddleware);
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(
    { method: req.method, path: req.path, requestId: req.id },
    'Solicitud recibida'
  );
  next();
});

// Todos los logs incluirán requestId automáticamente
```

**Beneficios:**
- ✅ Rastrear requests en logs
- ✅ Debugging más fácil
- ✅ Useful para microservicios

---

## 12. **Usar Dependencia Inyección** 💉

### Solución
```typescript
// src/container/Container.ts
export class Container {
  private static instances = new Map<string, any>();

  static register<T>(key: string, factory: () => T) {
    this.instances.set(key, factory());
  }

  static get<T>(key: string): T {
    return this.instances.get(key);
  }
}

// En config
Container.register('userService', () => userService);
Container.register('userController', () => new UserController(Container.get('userService')));

// En el controlador
export class UserController {
  constructor(private userService: typeof userService) {}

  async getUsers(req: Request, res: Response) {
    const users = await this.userService.getAllUsers();
    ApiResponse.success(res, users);
  }
}
```

**Beneficios:**
- ✅ Más testeable
- ✅ Desacoplado
- ✅ Fácil de mockear

---

## Resumen de Refactorizaciones

| Refactorización | Dificultad | Impacto | Prioridad |
|-----------------|-----------|--------|-----------|
| Error Handling Centralizado | Baja | Alto | 🔴 Alta |
| Respuestas Estandarizadas | Baja | Alto | 🔴 Alta |
| Custom Errors | Media | Alto | 🔴 Alta |
| Extraer Lógica al Servicio | Baja | Medio | 🟡 Media |
| DTOs | Media | Medio | 🟡 Media |
| Enums para Constantes | Baja | Bajo | 🟡 Media |
| Config por Ambiente | Baja | Medio | 🟡 Media |
| Request ID Tracing | Baja | Medio | 🟡 Media |
| Controlador Base | Media | Medio | 🟢 Baja |
| Tipos de Resultado | Media | Bajo | 🟢 Baja |
| DI (Dependency Injection) | Alta | Bajo | 🟢 Baja |

---

## 🎯 Plan de Implementación Recomendado

### **Fase 1 (Inmediata)** - Impacto Alto
1. ✅ Error Handling Centralizado
2. ✅ Respuestas Estandarizadas
3. ✅ Custom Errors

### **Fase 2 (Próxima)** - Mejora Continua
4. ✅ Extraer Lógica al Servicio
5. ✅ Config por Ambiente
6. ✅ Enums para Constantes

### **Fase 3 (Opcional)** - Escalabilidad
7. ✅ DTOs
8. ✅ Request ID Tracing
9. ✅ Controlador Base
10. ✅ DI

---

**Nota:** Cada refactorización incluye ejemplos de código listos para implementar.
