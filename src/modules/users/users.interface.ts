export interface User {
  id: number;
  firstName: string;
  lastName: string;
  identificationNumber: string;
  dateOfBirth: Date;
  email: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Útil para cuando creamos un usuario, ya que el 'id', 'createdAt' y 'updatedAt' aún no existen
export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>;

// Para actualizar, excluimos 'id', 'createdAt' (nunca cambia) e 'isActive' (se gestiona por separado)
export type UpdateUserData = Partial<Omit<User, 'id' | 'createdAt' | 'isActive'>>;
