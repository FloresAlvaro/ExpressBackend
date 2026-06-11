# Guía de Async/Await en Express Repo

## 📚 Descripción General

Se han agregado **async/await** a todos los controladores y servicios del proyecto para manejar operaciones asincrónicas. Esto permite que el código sea más limpio, legible y mantenga mejor el control del flujo asincrónico.

## 🔄 Cambios Realizados

### 1. **Servicios (users.service.ts)**

Todas las funciones ahora son **asincrónicas**:

```typescript
// ANTES (Síncrono)
export const getAllUsers = (status?: "active" | "inactive" | "all"): User[] => {
  return usersDatabase.filter(...);
};

// AHORA (Asincrónico)
export const getAllUsers = async (status?: "active" | "inactive" | "all"): Promise<User[]> => {
  try {
    await simulateDbDelay();
    return usersDatabase.filter(...);
  } catch (error) {
    logger.error({ error }, "Error en getAllUsers");
    throw error;
  }
};
```

**Funciones asincrónicas en el servicio:**
- `getAllUsers()` - Retorna `Promise<User[]>`
- `createUser()` - Retorna `Promise<User>`
- `updateUser()` - Retorna `Promise<User | null>`
- `softDeleteUser()` - Retorna `Promise<boolean>`
- `restoreUser()` - Retorna `Promise<User | null>`

### 2. **Controladores (users.controller.ts)**

Todos los controladores ahora son **async** y usan **await**:

```typescript
// ANTES (Síncrono)
export const getUsers = (req: Request, res: Response): void => {
  const users = userService.getAllUsers(filterStatus);
  res.status(200).json(users);
};

// AHORA (Asincrónico)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.getAllUsers(filterStatus);
    res.status(200).json(users);
  } catch (error) {
    logger.error({ error }, "Error al obtener usuarios");
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};
```

**Cambios en los controladores:**
- Se agregó `async` a la función
- Se agregó `await` antes de cada llamada al servicio
- El tipo de retorno es `Promise<void>`
- Se incluye manejo de errores con try-catch

### 3. **Simulación de Delay de Base de Datos**

Se agregó una función auxiliar que simula el delay de operaciones de BD:

```typescript
const simulateDbDelay = async (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 50));
};
```

Esto simula un delay de 50ms en cada operación, que representa el tiempo que tomaría una verdadera base de datos.

## 💡 Ejemplos de Uso

### Obtener todos los usuarios activos
```bash
GET http://localhost:3000/api/users
```

Respuesta:
```json
[
  { "id": 1, "name": "Alvaro Flores", "email": "alvaro@example.com", "isActive": true },
  { "id": 2, "name": "Mariana Costa", "email": "mariana@example.com", "isActive": true }
]
```

### Obtener solo usuarios inactivos
```bash
GET http://localhost:3000/api/users?status=inactive
```

### Crear un nuevo usuario
```bash
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com"
}
```

### Actualizar un usuario (ahora es asincrónico)
```bash
PUT http://localhost:3000/api/users/1
Content-Type: application/json

{
  "name": "Alvaro Updated",
  "email": "alvaro.updated@example.com"
}
```

### Eliminar un usuario (soft delete, ahora es asincrónico)
```bash
DELETE http://localhost:3000/api/users/1
```

### Restaurar un usuario (ahora es asincrónico)
```bash
POST http://localhost:3000/api/users/1/restore
```

## 🎯 Ventajas del Async/Await

1. **Mejor legibilidad**: El código se ve más síncrono, aunque es asincrónico
2. **Manejo de errores**: Con try-catch en lugar de .catch()
3. **Debugging**: Más fácil de rastrear con stack traces
4. **Escalabilidad**: Listo para operaciones de BD reales (MongoDB, PostgreSQL, etc.)
5. **Performance**: Las operaciones no bloquean el event loop de Node.js

## 🔧 Cómo Expandir a una Base de Datos Real

Para conectar a una BD real (MongoDB, PostgreSQL, etc.), simplemente reemplaza `simulateDbDelay()` con llamadas reales:

```typescript
// Ejemplo con MongoDB
import { User.collection } from 'your-mongodb-connection';

export const getAllUsers = async (status?: "active" | "inactive" | "all"): Promise<User[]> => {
  try {
    const query = status === "all" ? {} : { isActive: status === "active" };
    return await User.collection.find(query).toArray();
  } catch (error) {
    logger.error({ error }, "Error en getAllUsers");
    throw error;
  }
};
```

## 📊 Estructura de Errores

Los errores ahora se manejan de forma consistente:

```typescript
try {
  await userService.someOperation();
  res.status(200).json(result);
} catch (error) {
  logger.error(
    { error, stack: error instanceof Error ? error.stack : undefined },
    "Descripción del error"
  );
  res.status(500).json({ message: "Error al procesar la solicitud" });
}
```

## ✅ Compilación

El proyecto compila sin errores:
```bash
npm run build
```

Ejecutar en desarrollo:
```bash
npm run dev
```

Ejecutar en producción:
```bash
npm run start
```

---

**Nota**: El código ahora está completamente preparado para trabajar con bases de datos reales y otras operaciones asincrónicas.
