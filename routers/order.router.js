import express from "express";
import { createOrder, getOrdersByUserId } from "../controllers/order.controller.js";


const router = express.Router();


router.post("/", createOrder);
router.get("/user/:userId", getOrdersByUserId);


export default router;