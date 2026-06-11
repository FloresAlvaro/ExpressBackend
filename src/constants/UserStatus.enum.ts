/**
 * Estados posibles de un usuario
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ALL = 'all',
}

/**
 * Array de estados activos para filtros
 */
export const ACTIVE_USER_STATUSES = [
  UserStatus.ACTIVE,
  UserStatus.INACTIVE,
  UserStatus.ALL,
];
