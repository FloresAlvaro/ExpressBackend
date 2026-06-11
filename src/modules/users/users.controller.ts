import { Request, Response } from "express";
import * as userService from "./users.service.js";
import { CreateUserData } from "./users.interface.js";
import { logger } from "../../helper/logger.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/response.js";
import { NotFoundError } from "../../errors/AppError.js";
import { UserStatus } from "../../constants/UserStatus.enum.js";

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query as { status?: UserStatus };
  const filterStatus = status || UserStatus.ACTIVE;

  const users = await userService.getAllUsers(filterStatus);
  logger.info(
    { count: users.length, filter: filterStatus },
    "Usuarios obtenidos exitosamente"
  );
  return ApiResponse.success(res, users, 200, 'Usuarios obtenidos');
});

export const createUserController = asyncHandler(async (req: Request, res: Response) => {
  const { name, email }: CreateUserData = req.body;

  const newUser = await userService.createUser({ name, email });
  logger.info({ userId: newUser.id, email: newUser.email }, "Usuario creado exitosamente");
  return ApiResponse.success(res, newUser, 201, 'Usuario creado exitosamente');
});

export const updateUserController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedUser = await userService.updateUser(Number(id), req.body);

  if (!updatedUser) {
    logger.warn(
      { userId: id, updateData: req.body },
      "Intento de actualizar usuario inexistente o inactivo"
    );
    throw new NotFoundError('Usuario');
  }
  logger.info(
    { userId: id, updatedFields: Object.keys(req.body) },
    "Usuario actualizado exitosamente"
  );
  return ApiResponse.success(res, updatedUser, 200, 'Usuario actualizado exitosamente');
});

export const deleteUserController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const success = await userService.softDeleteUser(Number(id));

  if (!success) {
    logger.warn({ userId: id }, "Intento de eliminar usuario inexistente o ya inactivo");
    throw new NotFoundError('Usuario');
  }
  logger.info({ userId: id }, "Usuario eliminado (soft delete) exitosamente");
  return ApiResponse.success(res, null, 204, 'Usuario eliminado');
});

export const restoreUserController = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const restoredUser = await userService.restoreUser(id);

  if (!restoredUser) {
    logger.warn(
      { userId: id },
      "Intento de restaurar usuario inexistente o ya activo",
    );
    throw new NotFoundError('Usuario');
  }

  logger.info({ userId: id }, "Usuario restaurado exitosamente");
  return ApiResponse.success(
    res,
    { message: `Usuario con ID ${id} reactivado con éxito`, user: restoredUser },
    200,
    'Usuario restaurado exitosamente'
  );
});
