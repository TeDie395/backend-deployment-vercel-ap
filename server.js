//Debemos definir nuestra api usando express
//Conexion a la base de datos (Llamado)
//El llamado a nuestras rutas
import express from "express";
import { connectDB } from "./db/db.js";
import userRoutes from "./routers/user.router.js"
import authRoutes from "./routers/auth.router.js"
import productRoutes from "./routers/product.router.js"
import orderRoutes from "./routers/order.router.js"
import commentRoutes from "./routers/comment.router.js";
import cors from "cors";


const app = express();

connectDB();

app.use(cors({}));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/comment", commentRoutes);

app.listen(8080, () => {
    console.log("Servidor iniciado en el puerto 8080");
});