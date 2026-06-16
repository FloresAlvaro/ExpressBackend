import { User, CreateUserData, UpdateUserData } from './users.interface.js';
import { logger } from '../../helper/logger.js';

// Tipamos el array de la BD simulada
let usersDatabase: User[] = [
  { id: 1, name: 'Alvaro Flores', email: 'alvaro@example.com', isActive: true },
  {
    id: 2,
    name: 'Mariana Costa',
    email: 'mariana@example.com',
    isActive: true,
  },
];

// Función auxiliar para simular delay de base de datos
const simulateDbDelay = async (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 50));
};

// 1. Obtener solo usuarios activos
export const getAllUsers = async (status?: 'active' | 'inactive' | 'all'): Promise<User[]> => {
  try {
    await simulateDbDelay();
    logger.info({ status }, 'Obteniendo usuarios');

    if (status === 'all') {
      return usersDatabase;
    }

    if (status === 'inactive') {
      return usersDatabase.filter((user) => !user.isActive);
    }

    // Por defecto (si es 'active' o si no viene el parámetro), devolvemos los activos
    return usersDatabase.filter((user) => user.isActive);
  } catch (error) {
    logger.error({ error }, 'Error en getAllUsers');
    throw error;
  }
};

// 2. Crear usuario con isActive por defecto en true
export const createUser = async (userData: CreateUserData): Promise<User> => {
  try {
    await simulateDbDelay();
    const newUser: User = {
      id: usersDatabase.length + 1,
      ...userData,
      isActive: true, // Todo usuario inicia activo
    };
    usersDatabase.push(newUser);
    logger.info({ userId: newUser.id, email: newUser.email }, 'Usuario creado exitosamente');
    return newUser;
  } catch (error) {
    logger.error({ error }, 'Error en createUser');
    throw error;
  }
};

// 3. Actualizar solo si el usuario está activo
export const updateUser = async (id: number, data: UpdateUserData): Promise<User | null> => {
  try {
    await simulateDbDelay();
    const index = usersDatabase.findIndex((u) => u.id === id && u.isActive);
    if (index === -1) {
      logger.warn({ userId: id }, 'Intento de actualizar usuario no encontrado');
      return null;
    }

    usersDatabase[index] = { ...usersDatabase[index], ...data };
    logger.info({ userId: id }, 'Usuario actualizado exitosamente');
    return usersDatabase[index];
  } catch (error) {
    logger.error({ error }, 'Error en updateUser');
    throw error;
  }
};

// 4. Soft Delete: Cambiar isActive a false
export const softDeleteUser = async (id: number): Promise<boolean> => {
  try {
    await simulateDbDelay();
    const index = usersDatabase.findIndex((u) => u.id === id && u.isActive);
    if (index === -1) {
      logger.warn({ userId: id }, 'Intento de eliminar usuario no encontrado');
      return false;
    }

    usersDatabase[index].isActive = false;
    logger.info({ userId: id }, 'Usuario eliminado (soft delete)');
    return true;
  } catch (error) {
    logger.error({ error }, 'Error en softDeleteUser');
    throw error;
  }
};

// 5. Reactivar: Buscar un usuario que esté en false (inactivo) y pasarlo a true
export const restoreUser = async (id: number): Promise<User | null> => {
  try {
    await simulateDbDelay();
    const index = usersDatabase.findIndex((u) => u.id === id && !u.isActive);

    if (index === -1) {
      logger.warn({ userId: id }, 'Intento de restaurar usuario no encontrado o ya activo');
      return null;
    }

    usersDatabase[index].isActive = true;
    logger.info({ userId: id }, 'Usuario restaurado exitosamente');
    return usersDatabase[index];
  } catch (error) {
    logger.error({ error }, 'Error en restoreUser');
    throw error;
  }
};
