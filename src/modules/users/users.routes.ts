import { Router } from 'express';
import {
  getUsers,
  createUserController,
  updateUserController,
  deleteUserController,
  restoreUserController,
} from './users.controller.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation.js';
import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  userStatusQuerySchema,
} from './users.schema.js';

const router = Router();

// GET /api/users - Obtener usuarios con validación de query
router.get('/', validateQuery(userStatusQuerySchema), getUsers);

// POST /api/users - Crear usuario con validación de body
router.post('/', validateBody(createUserSchema), createUserController);

// PUT /api/users/:id - Actualizar usuario con validación de params y body
router.put(
  '/:id',
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
  updateUserController
);

// DELETE /api/users/:id - Eliminar usuario con validación de params
router.delete('/:id', validateParams(userIdSchema), deleteUserController);

// POST /api/users/:id/restore - Restaurar usuario con validación de params
router.post('/:id/restore', validateParams(userIdSchema), restoreUserController);

export default router;
