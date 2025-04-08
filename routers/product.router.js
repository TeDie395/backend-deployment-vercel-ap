import express from "express";
import { getAllProducts, getProductsByFilters, getProductById, getProductsStatistics, updateProduct, saveProduct } from "../controllers/product.controller.js";


const router = express.Router();

router.post("/", saveProduct);
router.get("/", getAllProducts);
router.get("/by-filters", getProductsByFilters);
router.get("/statistics", getProductsStatistics);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
//router.delete("/:id", productDelete);


export default router;