# Estructura del Proyecto Express Repo

## 📁 Árbol de Directorios

```
Express Repo/
│
├── src/
│   ├── app.ts                           # Servidor principal con middlewares globales
│   │
│   ├── helper/
│   │   └── logger.ts                    # Configuración de logging con Pino
│   │
│   ├── middleware/
│   │   └── validation.ts                # Middlewares de validación con Zod
│   │
│   └── modules/
│       └── users/
│           ├── users.routes.ts          # Rutas con middlewares de validación
│           ├── users.controller.ts      # Controladores con async/await
│           ├── users.service.ts         # Servicios con async/await
│           ├── users.interface.ts       # Tipos e interfaces de TypeScript
│           └── users.schema.ts          # Esquemas de validación con Zod
│
├── dist/                                 # Código compilado a JavaScript
│
├── node_modules/                         # Dependencias instaladas
│
├── package.json                          # Configuración del proyecto
├── tsconfig.json                         # Configuración de TypeScript
│
├── ASYNC_AWAIT_GUIDE.md                 # Documentación de async/await
├── ZOD_VALIDATION_GUIDE.md              # Documentación de validación con Zod
└── PROJECT_STRUCTURE.md                 # Este archivo
```

## 🔄 Flujo de Datos en una Solicitud

```
Request HTTP
    ↓
┌─────────────────────────────────────────────────────┐
│ Middleware Global (app.ts)                          │
│ - Logging de request                                │
│ - Parser JSON                                       │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│ Middleware de Validación (users.routes.ts)          │
│ - validateQuery (si es GET)                         │
│ - validateBody (si es POST/PUT)                     │
│ - validateParams (si tiene :id)                     │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│ Controlador (users.controller.ts)                   │
│ - Recibe datos ya validados                         │
│ - Llama al servicio con await                       │
│ - Maneja la respuesta                               │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│ Servicio (users.service.ts)                         │
│ - Lógica de negocio asincrónica                     │
│ - Acceso a la "base de datos"                       │
│ - Logging de operaciones                            │
└─────────────────────────────────────────────────────┘
    ↓
Response HTTP
```

## 📋 Archivos Principales

### `src/app.ts`
- **Propósito**: Configurar Express y middleware global
- **Contiene**:
  - Middleware de logging global
  - Middleware de parseo JSON
  - Rutas de usuarios
  - Endpoint de health check
  - Manejo global de errores 404 y 500
- **Logging**: Todas las requests se registran

### `src/middleware/validation.ts`
- **Propósito**: Validación de datos con Zod
- **Exports**:
  - `validateBody()` - Valida el body de la request
  - `validateParams()` - Valida parámetros de ruta
  - `validateQuery()` - Valida query strings
- **Uso**: Se aplica como middleware en las rutas

### `src/modules/users/users.schema.ts`
- **Propósito**: Definir esquemas de validación
- **Esquemas**:
  - `createUserSchema` - Para POST (ambos campos requeridos)
  - `updateUserSchema` - Para PUT (campos opcionales)
  - `userIdSchema` - Para validar IDs en parámetros
  - `userStatusQuerySchema` - Para validar query status
- **Exporta**: Tipos inferidos automáticamente

### `src/modules/users/users.routes.ts`
- **Propósito**: Definir rutas y middlewares de validación
- **Rutas**:
  - `GET /` - Obtener usuarios (con filtro status)
  - `POST /` - Crear nuevo usuario
  - `PUT /:id` - Actualizar usuario
  - `DELETE /:id` - Eliminar usuario (soft delete)
  - `POST /:id/restore` - Restaurar usuario

### `src/modules/users/users.controller.ts`
- **Propósito**: Manejar requests y respuestas
- **Funciones**: 5 controladores async
  - `getUsers()` - GET /
  - `createUserController()` - POST /
  - `updateUserController()` - PUT /:id
  - `deleteUserController()` - DELETE /:id
  - `restoreUserController()` - POST /:id/restore

### `src/modules/users/users.service.ts`
- **Propósito**: Lógica de negocio asincrónica
- **Funciones**: 5 servicios async
  - `getAllUsers()` - Obtener usuarios con filtro
  - `createUser()` - Crear nuevo usuario
  - `updateUser()` - Actualizar usuario activo
  - `softDeleteUser()` - Marcar como inactivo
  - `restoreUser()` - Reactivar usuario
- **Simulación**: Incluye `simulateDbDelay()` para simular BD

### `src/modules/users/users.interface.ts`
- **Propósito**: Definir tipos de TypeScript
- **Tipos**:
  - `User` - Estructura de un usuario
  - `CreateUserData` - Para crear usuario
  - `UpdateUserData` - Para actualizar usuario

### `src/helper/logger.ts`
- **Propósito**: Configuración centralizada de logging
- **Usa**: Pino con pino-pretty
- **Exporta**: `logger` (instancia singleton)

## 🔐 Validación por Endpoint

### GET /api/users
```
Query Parameters:
  ?status = 'active' | 'inactive' | 'all' (por defecto: 'active')

Validación:
  ✓ userStatusQuerySchema
```

### POST /api/users
```
Body (JSON):
  {
    "name": string (2-100 caracteres),
    "email": string (email válido)
  }

Validación:
  ✓ createUserSchema
```

### PUT /api/users/:id
```
Parameters:
  :id = número (se valida que sea numérico)

Body (JSON):
  {
    "name": string (2-100 caracteres) - opcional,
    "email": string (email válido) - opcional
  }
  (Mínimo 1 campo requerido)

Validación:
  ✓ userIdSchema
  ✓ updateUserSchema
```

### DELETE /api/users/:id
```
Parameters:
  :id = número (se valida que sea numérico)

Validación:
  ✓ userIdSchema
```

### POST /api/users/:id/restore
```
Parameters:
  :id = número (se valida que sea numérico)

Validación:
  ✓ userIdSchema
```

## 📊 Niveles de Logging

El proyecto usa 4 niveles de logging con Pino:

| Nivel | Uso | Ejemplos |
|-------|-----|----------|
| `info` | Información general | Usuarios obtenidos, usuario creado, servidor iniciado |
| `warn` | Advertencias | Usuario no encontrado, validación fallida, datos faltantes |
| `error` | Errores | Excepciones, fallos en operaciones |
| `debug` | Detalles | Endpoint consultado, datos específicos |

## 🔄 Flujo de Async/Await

Todas las operaciones son asincrónicas:

```
Controller (async)
    ↓ await
Service (async)
    ↓ await
simulateDbDelay() (50ms)
    ↓
Retorna resultado
    ↓
Response al cliente
```

## ✅ Validación con Zod

Las validaciones se aplican automáticamente:

```
Request
  ↓
Middleware de Validación
  ↓
Schema.parse(data)
  ↓ Si es válido:
Pasa al Controlador
  ↓ Si es inválido:
Retorna 400 con errores detallados
```

## 📦 Dependencias Principales

```json
{
  "express": "^5.2.1",      // Framework web
  "typescript": "^6.0.3",   // Lenguaje de tipado
  "zod": "^4.4.3",          // Validación de esquemas
  "pino": "^10.3.1",        // Logging
  "pino-pretty": "^13.1.3", // Formateo de logs
  "dotenv": "^17.4.2"       // Variables de entorno
}
```

## 🎯 Características Implementadas

- ✅ **async/await** en todos los controladores y servicios
- ✅ **Validación Zod** en todas las rutas
- ✅ **Logging Pino** en toda la aplicación
- ✅ **TypeScript** tipado fuerte
- ✅ **Manejo de errores** consistente
- ✅ **Soft delete** con reactivación
- ✅ **Filtro de usuarios** por estado
- ✅ **Middlewares reutilizables**
- ✅ **Estructura escalable**

## 🚀 Comandos Disponibles

```bash
# Instalar dependencias
npm install

# Desarrollo (con hot reload)
npm run dev

# Compilar a JavaScript
npm run build

# Ejecutar en producción
npm run start

# Ver logs formateados
npm run dev  # usa pino-pretty automáticamente
```

---

**Nota**: Este proyecto está completamente preparado para conectar a una base de datos real (MongoDB, PostgreSQL, etc.) simplemente reemplazando `simulateDbDelay()` con llamadas reales a la BD.
