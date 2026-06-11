# Guía de Validación con Zod en Express Repo

## 📚 Descripción General

Se ha integrado **Zod** para validación de datos en el proyecto. Zod proporciona validación de esquemas declarativa y en tiempo de ejecución con mensajes de error claros.

## 🔧 Componentes Implementados

### 1. **Esquemas de Validación (users.schema.ts)**

Define los esquemas Zod para validar datos:

```typescript
// Crear usuario - Ambos campos requeridos
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' })
    .trim(),
  email: z
    .string()
    .email({ message: 'Debes proporcionar un email válido' })
    .toLowerCase(),
});

// Actualizar usuario - Ambos campos opcionales
export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().toLowerCase().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Debes proporcionar al menos un campo para actualizar',
});

// Validar ID en parámetros
export const userIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, { message: 'El ID debe ser un número' })
    .transform((val) => parseInt(val, 10)),
});

// Validar query parameters
export const userStatusQuerySchema = z.object({
  status: z.enum(['active', 'inactive', 'all']).optional().default('active'),
});
```

### 2. **Middleware de Validación (validation.ts)**

Proporciona middlewares reutilizables para validar diferentes partes de la request:

```typescript
// Validar el body
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validatedData = schema.parse(req.body);
    req.body = validatedData;
    next();
  };
};

// Validar parámetros (:id)
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validatedData = schema.parse(req.params);
    req.params = validatedData as any;
    next();
  };
};

// Validar query strings (?status=...)
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validatedData = schema.parse(req.query);
    req.query = validatedData as any;
    next();
  };
};
```

### 3. **Rutas Actualizadas (users.routes.ts)**

Las rutas ahora usan los middlewares de validación:

```typescript
// GET con validación de query
router.get('/', validateQuery(userStatusQuerySchema), getUsers);

// POST con validación de body
router.post('/', validateBody(createUserSchema), createUserController);

// PUT con validación de params y body
router.put(
  '/:id',
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
  updateUserController
);

// DELETE con validación de params
router.delete('/:id', validateParams(userIdSchema), deleteUserController);

// POST restore con validación de params
router.post('/:id/restore', validateParams(userIdSchema), restoreUserController);
```

## 📊 Ejemplos de Uso y Validación

### ✅ Crear Usuario (Válido)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan Pérez", "email": "juan@example.com"}'
```

**Respuesta:**
```json
{
  "id": 3,
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "isActive": true
}
```

### ❌ Crear Usuario (Nombre muy corto)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "J", "email": "juan@example.com"}'
```

**Respuesta (400 Bad Request):**
```json
{
  "message": "Validación fallida",
  "errors": [
    {
      "field": "name",
      "message": "El nombre debe tener al menos 2 caracteres"
    }
  ]
}
```

### ❌ Crear Usuario (Email inválido)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan Pérez", "email": "juan-sin-arroba"}'
```

**Respuesta (400 Bad Request):**
```json
{
  "message": "Validación fallida",
  "errors": [
    {
      "field": "email",
      "message": "Debes proporcionar un email válido"
    }
  ]
}
```

### ✅ Actualizar Usuario (Válido - Nombre y Email)
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Alvaro Updated", "email": "alvaro.new@example.com"}'
```

### ✅ Actualizar Usuario (Válido - Solo Nombre)
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Alvaro Actualizado"}'
```

### ❌ Actualizar Usuario (Sin campos)
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Respuesta (400 Bad Request):**
```json
{
  "message": "Validación fallida",
  "errors": [
    {
      "field": "",
      "message": "Debes proporcionar al menos un campo para actualizar"
    }
  ]
}
```

### ✅ Obtener Usuarios Activos
```bash
GET http://localhost:3000/api/users
# o
GET http://localhost:3000/api/users?status=active
```

### ✅ Obtener Usuarios Inactivos
```bash
GET http://localhost:3000/api/users?status=inactive
```

### ✅ Obtener Todos los Usuarios
```bash
GET http://localhost:3000/api/users?status=all
```

### ❌ Obtener Usuarios (Status inválido)
```bash
GET http://localhost:3000/api/users?status=pending
```

**Respuesta (400 Bad Request):**
```json
{
  "message": "Validación fallida",
  "errors": [
    {
      "field": "status",
      "message": "Invalid enum value. Expected 'active' | 'inactive' | 'all'"
    }
  ]
}
```

### ❌ Actualizar Usuario (ID inválido)
```bash
curl -X PUT http://localhost:3000/api/users/abc \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```

**Respuesta (400 Bad Request):**
```json
{
  "message": "Validación fallida",
  "errors": [
    {
      "field": "id",
      "message": "El ID debe ser un número"
    }
  ]
}
```

## 🎯 Ventajas de Usar Zod

1. **Tipado Seguro**: Los tipos se infieren automáticamente de los esquemas
2. **Validación Declarativa**: Define qué es válido de forma clara
3. **Mensajes de Error Personalizados**: Mensajes claros en español
4. **Transformación de Datos**: Convierte automáticamente (ej: toLowerCase, parseInt)
5. **Reutilizable**: Los middlewares se pueden usar en múltiples rutas
6. **Type-safe**: TypeScript infiere tipos automáticamente

## 📝 Estructura de Errores de Validación

Todos los errores de validación devuelven:
- **Status Code**: 400 (Bad Request)
- **Format**: 
  ```json
  {
    "message": "Validación fallida",
    "errors": [
      {
        "field": "nombre_del_campo",
        "message": "Descripción del error"
      }
    ]
  }
  ```

## 🔧 Cómo Agregar Nueva Validación

### 1. Crear un esquema en `users.schema.ts`:
```typescript
export const mySchema = z.object({
  field: z.string().min(3).max(50),
  age: z.number().min(18),
});
```

### 2. Usar en la ruta:
```typescript
router.post('/my-endpoint', validateBody(mySchema), myController);
```

### 3. El controlador recibe datos ya validados:
```typescript
export const myController = async (req: Request, res: Response) => {
  // req.body está garantizado que cumple el esquema
  const { field, age } = req.body; // Tipado automáticamente
};
```

## 💡 Validaciones Disponibles en Zod

```typescript
z.string()
  .min(n)              // Longitud mínima
  .max(n)              // Longitud máxima
  .email()             // Formato de email
  .url()               // Formato de URL
  .regex(/pattern/)    // Expresión regular
  .toLowerCase()       // Transformar a minúsculas
  .toUpperCase()       // Transformar a mayúsculas
  .trim()              // Eliminar espacios

z.number()
  .min(n)              // Valor mínimo
  .max(n)              // Valor máximo
  .int()               // Debe ser entero

z.enum(['a', 'b', 'c']) // Una de estas opciones

z.object({...})        // Objeto con propiedades
  .optional()          // Campo opcional
  .refine(fn)          // Validación personalizada

z.array(z.string())    // Array de strings
```

## ✅ Compilación

El proyecto compila sin errores:
```bash
npm run build
```

---

**Nota**: Con Zod, tu API ahora es más robusta y segura. Los datos validados garantizan que tus funciones de negocio reciben datos correctos.
