import { Request, Response } from "express";
import * as userService from "./users.service.js";
import { CreateUserData } from "./users.interface.js";
import { logger } from "../../helper/logger.js";

export const getUsers = (req: Request, res: Response): void => {
  try {
    // Capturamos el parámetro ?status= de la URL
    const { status } = req.query;

    // Validamos que el estado enviado sea uno de los permitidos
    const allowedStatuses = ["active", "inactive", "all"];
    const filterStatus = allowedStatuses.includes(status as string)
      ? (status as "active" | "inactive" | "all")
      : "active"; // Si mandan cualquier otra cosa, por defecto es active

    const users = userService.getAllUsers(filterStatus);
    logger.debug({ count: users.length }, "Usuarios obtenidos");
    res.status(200).json(users);
  } catch (error) {
    logger.error(error, "Error al obtener usuarios");
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const createUserController = (req: Request, res: Response): void => {
  try {
    // Tipamos el body para validar internamente
    const { name, email }: CreateUserData = req.body;

    if (!name || !email) {
      logger.warn({ body: req.body }, "Validación fallida: datos faltantes");
      res.status(400).json({ message: "Nombre y email son requeridos" });
      return;
    }

    const newUser = userService.createUser({ name, email });
    res.status(201).json(newUser);
  } catch (error) {
    logger.error(error, "Error al crear el usuario");
    res.status(500).json({ message: "Error al crear el usuario" });
  }
};

export const updateUserController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const updatedUser = userService.updateUser(Number(id), req.body);

  if (!updatedUser) {
    logger.warn({ userId: id }, "Intento de actualizar usuario inexistente");
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }
  res.status(200).json(updatedUser);
};

export const deleteUserController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const success = userService.softDeleteUser(Number(id));

  if (!success) {
    logger.warn({ userId: id }, "Intento de eliminar usuario inexistente");
    res.status(404).json({ message: "Usuario no encontrado o ya eliminado" });
    return;
  }
  res.status(204).send(); // 204 significa "No Content" (éxito)
};

export const restoreUserController = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id as string);
  const restoredUser = userService.restoreUser(id);

  if (!restoredUser) {
    logger.warn(
      { userId: id },
      "Intento de restaurar usuario inexistente o ya activo",
    );
    res.status(404).json({
      message: "Usuario no encontrado o no requería restauración",
    });
    return;
  }

  res.status(200).json({
    message: `Usuario con ID ${id} reactivado con éxito`,
    user: restoredUser,
  });
};
