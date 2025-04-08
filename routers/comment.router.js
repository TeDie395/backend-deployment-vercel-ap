import express from "express";
import { addCommentToOrder } from "../controllers/comment.controller.js";


const router = express.Router();

router.post("/", addCommentToOrder);


export default router;