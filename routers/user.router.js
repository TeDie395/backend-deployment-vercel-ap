//Esta capa se encarga de definir el grupo de rutas asociadas al usuario y los llamados a la capa de controladores
import express from "express";
import { saveUser, getAllUsers, deleteUser, updateUser } from "../controllers/user.controller.js";
import authenticationMiddleware from "../middlewares/authentication.middleware.js";
import authorizationMiddleware from "../middlewares/authorization.middleware.js";

const router = express.Router();
router.use(authenticationMiddleware);

//CRUD DE SERVICIOS PARA ADMINISTRAR EL USUARIO
router.post("/", saveUser); // el saveUser lo llamamos de la capa de controladores
//El servicio de obtencion de usuarios solo lo debe poder acceder el admin
router.get("/", authorizationMiddleware(["admin"]), getAllUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
