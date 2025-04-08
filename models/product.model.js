//En este archivo vamos a definir el schema y el modelo de nuestro producto
//schema -> define la estructura (atributos) de nuestro documento
//modelo -> es el que nos permite interactuar con la base de datos (CRUD)
//Para poder definir el schema y el modelo vamos a usar mongoose
import mongoose from 'mongoose';

//Definir el schema de nuestro producto
//Definimos los tipos y ademas poder agregar validaciones
const productShema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "El titulo del producto es obligatorio"],
        unique: true,
    },
    description: {
        type: String,
        minlength: [5, "La descripcion debe tener al menos 5 caracteres"],
        maxlength: [100, "La descripcion no puede tener mas de 100 caracteres"],
    },
    price: {
        type: Number,
        required: [true, "El precio del producto es obligatorio"],
        min: [0, "El precio no puede ser negativo"],
        max: [10000, "El precio no puede ser mayor a 10000"],
    },
    category: {
        type: String,
        enum: ["tecnologia", "ropa", "muebles", "comida"],
        required: [true, "La categoria del producto es obligatoria"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export const Product = mongoose.model("products", productShema);