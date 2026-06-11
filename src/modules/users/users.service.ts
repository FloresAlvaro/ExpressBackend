import { User, CreateUserData, UpdateUserData } from "./users.interface.js";
import { logger } from "../../helper/logger.js";

// Tipamos el array de la BD simulada
let usersDatabase: User[] = [
  { id: 1, name: "Alvaro Flores", email: "alvaro@example.com", isActive: true },
  {
    id: 2,
    name: "Mariana Costa",
    email: "mariana@example.com",
    isActive: true,
  },
];

// 1. Obtener solo usuarios activos
export const getAllUsers = (status?: "active" | "inactive" | "all"): User[] => {
  logger.info({ status }, "Obteniendo usuarios");

  if (status === "all") {
    return usersDatabase;
  }

  if (status === "inactive") {
    return usersDatabase.filter((user) => !user.isActive);
  }

  // Por defecto (si es 'active' o si no viene el parámetro), devolvemos los activos
  return usersDatabase.filter((user) => user.isActive);
};

// 2. Crear usuario con isActive por defecto en true
export const createUser = (userData: CreateUserData): User => {
  const newUser: User = {
    id: usersDatabase.length + 1,
    ...userData,
    isActive: true, // Todo usuario inicia activo
  };
  usersDatabase.push(newUser);
  logger.info(
    { userId: newUser.id, email: newUser.email },
    "Usuario creado exitosamente",
  );
  return newUser;
};

// 3. Actualizar solo si el usuario está activo
export const updateUser = (id: number, data: UpdateUserData): User | null => {
  const index = usersDatabase.findIndex((u) => u.id === id && u.isActive);
  if (index === -1) {
    logger.warn({ userId: id }, "Intento de actualizar usuario no encontrado");
    return null;
  }

  usersDatabase[index] = { ...usersDatabase[index], ...data };
  logger.info({ userId: id }, "Usuario actualizado exitosamente");
  return usersDatabase[index];
};

// 4. Soft Delete: Cambiar isActive a false
export const softDeleteUser = (id: number): boolean => {
  const index = usersDatabase.findIndex((u) => u.id === id && u.isActive);
  if (index === -1) {
    logger.warn({ userId: id }, "Intento de eliminar usuario no encontrado");
    return false;
  }

  usersDatabase[index].isActive = false;
  logger.info({ userId: id }, "Usuario eliminado (soft delete)");
  return true;
};

// 5. Reactivar: Buscar un usuario que esté en false (inactivo) y pasarlo a true
export const restoreUser = (id: number): User | null => {
  const index = usersDatabase.findIndex((u) => u.id === id && !u.isActive);

  if (index === -1) {
    logger.warn(
      { userId: id },
      "Intento de restaurar usuario no encontrado o ya activo",
    );
    return null;
  }

  usersDatabase[index].isActive = true;
  logger.info({ userId: id }, "Usuario restaurado exitosamente");
  return usersDatabase[index];
};
