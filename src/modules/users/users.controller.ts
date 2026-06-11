import { Request, Response } from "express";
import * as userService from "./users.service.js";
import { CreateUserData } from "./users.interface.js";
import { logger } from "../../helper/logger.js";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Capturamos el parámetro ?status= de la URL
    const { status } = req.query;

    // Validamos que el estado enviado sea uno de los permitidos
    const allowedStatuses = ["active", "inactive", "all"];
    const filterStatus = allowedStatuses.includes(status as string)
      ? (status as "active" | "inactive" | "all")
      : "active"; // Si mandan cualquier otra cosa, por defecto es active

    const users = await userService.getAllUsers(filterStatus);
    logger.info(
      { count: users.length, filter: filterStatus },
      "Usuarios obtenidos exitosamente"
    );
    res.status(200).json(users);
  } catch (error) {
    logger.error(
      { error, stack: error instanceof Error ? error.stack : undefined },
      "Error al obtener usuarios"
    );
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const createUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Tipamos el body para validar internamente
    const { name, email }: CreateUserData = req.body;

    if (!name || !email) {
      logger.warn(
        { receivedBody: req.body, missingFields: !name ? 'name' : !email ? 'email' : 'both' },
        "Validación fallida: datos faltantes"
      );
      res.status(400).json({ message: "Nombre y email son requeridos" });
      return;
    }

    const newUser = await userService.createUser({ name, email });
    logger.info({ userId: newUser.id, email: newUser.email }, "Usuario creado exitosamente");
    res.status(201).json(newUser);
  } catch (error) {
    logger.error(
      { error, requestBody: req.body, stack: error instanceof Error ? error.stack : undefined },
      "Error al crear el usuario"
    );
    res.status(500).json({ message: "Error al crear el usuario" });
  }
};

export const updateUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedUser = await userService.updateUser(Number(id), req.body);

    if (!updatedUser) {
      logger.warn(
        { userId: id, updateData: req.body },
        "Intento de actualizar usuario inexistente o inactivo"
      );
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    logger.info(
      { userId: id, updatedFields: Object.keys(req.body) },
      "Usuario actualizado exitosamente"
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    logger.error(
      { error, userId: req.params.id, stack: error instanceof Error ? error.stack : undefined },
      "Error al actualizar usuario"
    );
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

export const deleteUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await userService.softDeleteUser(Number(id));

    if (!success) {
      logger.warn({ userId: id }, "Intento de eliminar usuario inexistente o ya inactivo");
      res.status(404).json({ message: "Usuario no encontrado o ya eliminado" });
      return;
    }
    logger.info({ userId: id }, "Usuario eliminado (soft delete) exitosamente");
    res.status(204).send(); // 204 significa "No Content" (éxito)
  } catch (error) {
    logger.error(
      { error, userId: req.params.id, stack: error instanceof Error ? error.stack : undefined },
      "Error al eliminar usuario"
    );
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

export const restoreUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const restoredUser = await userService.restoreUser(id);

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

    logger.info({ userId: id }, "Usuario restaurado exitosamente");
    res.status(200).json({
      message: `Usuario con ID ${id} reactivado con éxito`,
      user: restoredUser,
    });
  } catch (error) {
    logger.error(
      { error, userId: req.params.id, stack: error instanceof Error ? error.stack : undefined },
      "Error al restaurar usuario"
    );
    res.status(500).json({ message: "Error al restaurar usuario" });
  }
};
