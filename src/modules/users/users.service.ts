import { User, CreateUserData, UpdateUserData } from './users.interface.js';
import { logger } from '../../helper/logger.js';

// Tipamos el array de la BD simulada
let usersDatabase: User[] = [
  {
    id: 1,
    firstName: 'Alvaro',
    lastName: 'Flores',
    identificationNumber: '12345678',
    dateOfBirth: new Date('1990-01-15'),
    email: 'alvaro@example.com',
    phoneNumber: '+1 234-567-8900',
    createdAt: new Date('2024-01-10T08:30:00'),
    updatedAt: new Date('2024-01-10T08:30:00'),
    isActive: true,
  },
  {
    id: 2,
    firstName: 'Mariana',
    lastName: 'Costa',
    identificationNumber: '87654321',
    dateOfBirth: new Date('1992-05-20'),
    email: 'mariana@example.com',
    phoneNumber: '+1 987-654-3210',
    createdAt: new Date('2024-02-15T10:15:00'),
    updatedAt: new Date('2024-02-15T10:15:00'),
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
    const now = new Date();
    const newUser: User = {
      id: usersDatabase.length + 1,
      ...userData,
      createdAt: now, // Fecha y hora de creación
      updatedAt: now, // Inicialmente igual a createdAt
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

    // Actualizar solo updatedAt, createdAt nunca cambia
    usersDatabase[index] = {
      ...usersDatabase[index],
      ...data,
      updatedAt: new Date(), // Siempre actualiza la fecha de modificación
    };
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
