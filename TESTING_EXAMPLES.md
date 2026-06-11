# Ejemplos de Testing de la API

## 🧪 Cómo Probar la API Express Repo

### 1. **Iniciar el Servidor**

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### 2. **Health Check**

```bash
curl http://localhost:3000/health
```

**Respuesta esperada:**
```json
{
  "status": "Server is running with TypeScript"
}
```

---

## 📝 Ejemplos de Requests

### **GET - Obtener Todos los Usuarios Activos**

```bash
curl http://localhost:3000/api/users
```

**Respuesta (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Alvaro Flores",
    "email": "alvaro@example.com",
    "isActive": true
  },
  {
    "id": 2,
    "name": "Mariana Costa",
    "email": "mariana@example.com",
    "isActive": true
  }
]
```

---

### **GET - Obtener Usuarios Inactivos**

```bash
curl "http://localhost:3000/api/users?status=inactive"
```

**Respuesta (200 OK):**
```json
[]
```

---

### **GET - Obtener Todos los Usuarios (Activos e Inactivos)**

```bash
curl "http://localhost:3000/api/users?status=all"
```

---

### **GET - Query Inválida (Status incorrecto)**

```bash
curl "http://localhost:3000/api/users?status=pending"
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

---

## ✅ POST - Crear Usuario (Válido)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }'
```

**Respuesta (201 Created):**
```json
{
  "id": 3,
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "isActive": true
}
```

---

## ❌ POST - Crear Usuario (Nombre muy corto)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "J",
    "email": "juan@example.com"
  }'
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

---

## ❌ POST - Crear Usuario (Email inválido)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan-sin-arroba"
  }'
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

---

## ❌ POST - Crear Usuario (Campos Faltantes)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Respuesta (400 Bad Request):**
```json
{
  "message": "Validación fallida",
  "errors": [
    {
      "field": "name",
      "message": "Required"
    },
    {
      "field": "email",
      "message": "Required"
    }
  ]
}
```

---

## ✅ PUT - Actualizar Usuario (Ambos Campos)

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alvaro Actualizado",
    "email": "alvaro.nuevo@example.com"
  }'
```

**Respuesta (200 OK):**
```json
{
  "id": 1,
  "name": "Alvaro Actualizado",
  "email": "alvaro.nuevo@example.com",
  "isActive": true
}
```

---

## ✅ PUT - Actualizar Usuario (Solo Nombre)

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alvaro Solo Nombre"
  }'
```

**Respuesta (200 OK):**
```json
{
  "id": 1,
  "name": "Alvaro Solo Nombre",
  "email": "alvaro.nuevo@example.com",
  "isActive": true
}
```

---

## ❌ PUT - Actualizar Usuario (Sin Campos)

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

---

## ❌ PUT - Actualizar Usuario (ID inválido)

```bash
curl -X PUT http://localhost:3000/api/users/abc \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test"
  }'
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

---

## ❌ PUT - Actualizar Usuario (Usuario No Encontrado)

```bash
curl -X PUT http://localhost:3000/api/users/999 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario Inexistente"
  }'
```

**Respuesta (404 Not Found):**
```json
{
  "message": "Usuario no encontrado"
}
```

---

## ✅ DELETE - Eliminar Usuario (Soft Delete)

```bash
curl -X DELETE http://localhost:3000/api/users/1
```

**Respuesta (204 No Content):**
```
(Sin contenido en el body)
```

---

## ❌ DELETE - Eliminar Usuario (ID inválido)

```bash
curl -X DELETE http://localhost:3000/api/users/abc
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

---

## ❌ DELETE - Eliminar Usuario (No Encontrado)

```bash
curl -X DELETE http://localhost:3000/api/users/999
```

**Respuesta (404 Not Found):**
```json
{
  "message": "Usuario no encontrado o ya eliminado"
}
```

---

## ✅ POST - Restaurar Usuario

```bash
curl -X POST http://localhost:3000/api/users/1/restore
```

**Respuesta (200 OK):**
```json
{
  "message": "Usuario con ID 1 reactivado con éxito",
  "user": {
    "id": 1,
    "name": "Alvaro Actualizado",
    "email": "alvaro.nuevo@example.com",
    "isActive": true
  }
}
```

---

## ❌ POST - Restaurar Usuario (ID inválido)

```bash
curl -X POST http://localhost:3000/api/users/abc/restore
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

---

## ❌ POST - Restaurar Usuario (No Encontrado o Ya Activo)

```bash
curl -X POST http://localhost:3000/api/users/999/restore
```

**Respuesta (404 Not Found):**
```json
{
  "message": "Usuario no encontrado o no requería restauración"
}
```

---

## 🧪 Prueba Completa (Escenario Real)

### 1. Ver usuarios activos iniciales
```bash
curl http://localhost:3000/api/users
```

### 2. Crear un nuevo usuario
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'
```

### 3. Actualizar el usuario creado
```bash
curl -X PUT http://localhost:3000/api/users/3 \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User Updated"}'
```

### 4. Eliminar (soft delete) el usuario
```bash
curl -X DELETE http://localhost:3000/api/users/3
```

### 5. Verificar que el usuario está inactivo
```bash
curl "http://localhost:3000/api/users?status=inactive"
```

### 6. Restaurar el usuario
```bash
curl -X POST http://localhost:3000/api/users/3/restore
```

### 7. Verificar que el usuario está activo nuevamente
```bash
curl http://localhost:3000/api/users
```

---

## 📊 Herramientas Recomendadas para Testing

### **Postman**
- Interfaz gráfica para hacer requests
- Guarda colecciones de requests
- Variables y entornos

### **Insomnia**
- Similar a Postman pero más ligero
- Buen soporte para GraphQL y REST

### **curl (Línea de Comandos)**
- Lo que mostramos en los ejemplos
- Preinstalado en Linux y macOS
- Disponible en Windows (PowerShell)

### **VSCode REST Client**
- Extensión para VSCode
- Escribe requests en archivos `.http`
- Ejecución directa desde el editor

---

## 🔍 Ver los Logs

Los logs se muestran automáticamente cuando ejecutas:

```bash
npm run dev
```

Verás algo como:

```
[INFO] Solicitud recibida { method: 'GET', path: '/api/users', ip: '::1' }
[INFO] Obteniendo usuarios { status: 'active' }
[INFO] Usuarios obtenidos exitosamente { count: 2, filter: 'active' }
```

---

## 📋 Tabla de Códigos de Estado HTTP

| Código | Significado | Cuándo Ocurre |
|--------|-------------|---------------|
| 200 | OK | Solicitud exitosa (GET, PUT) |
| 201 | Created | Usuario creado exitosamente (POST) |
| 204 | No Content | Usuario eliminado exitosamente (DELETE) |
| 400 | Bad Request | Validación fallida |
| 404 | Not Found | Recurso no encontrado |
| 500 | Server Error | Error interno del servidor |

---

**Nota**: Prueba todos estos ejemplos para verificar que tu API funciona correctamente con async/await y validación Zod.
