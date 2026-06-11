import { Router } from 'express';
import { 
  getUsers, 
  createUserController, 
  updateUserController, 
  deleteUserController,
  restoreUserController 
} from './users.controller.js';

const router = Router();

router.get('/', getUsers);
router.post('/', createUserController);
router.put('/:id', updateUserController);    // Endpoint para actualizar
router.delete('/:id', deleteUserController); // Endpoint para borrar
router.post('/:id/restore', restoreUserController);

export default router;
