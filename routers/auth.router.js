//En este archivo vamos a crear los servicios para registro y para login
import express from "express";
import {
    login,
    register,
    forgotPassword,
    resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

//Servicio para registro
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

export default router;