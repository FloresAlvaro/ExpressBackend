export interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

// Útil para cuando creamos un usuario, ya que el 'id' aún no existe
export type CreateUserData = Omit<User, 'id' | 'isActive'>;
export type UpdateUserData = Partial<Omit<User, 'id' | 'isActive'>>;
