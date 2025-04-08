import express from "express";
import { Product } from "../models/product.model.js";

const router = express.Router();

const saveProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).send(product);
    } catch (error) {
        res.status(500).send(error);
    }
};

//Crear un servicio para listar todos los productos
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.send(products);
    } catch (error) {
        res.status(500).send(error);
    }
};

//Servicio para consultar productos usando filtros
const getProductsByFilters = async (req, res) => {
    //Vamos a lograr que los filtros que lleguen en la petición se envien dinamicamente
    //a la consulta de MongoDB
    //query params -> /by-filters?price=500&category=tecnologia&page=1&limit=10
    //Modelo.find({ price: 500, category: "tecnologia" }).skip(0).limit(10);
    try {
        console.log(req.query);
        let queryObject = { ...req.query };
        //Limpieza de los parametros que no nos sirven para los filtros
        //Definir que parametros no forman parte de los filtros
        const withOutFields = ["page", "limit", "sort", "fields"];
        //Logica para eliminar los parametros que no forman parte de los filtros
        withOutFields.forEach((field) => delete queryObject[field]);
        //Vamos a usar expresiones regulares para poder agregar el simbolo $ a los operadores
        //La expresion regular que vamos a usar se va a encargar de buscar dentro de una cadena
        //los operadores que vamos definir y cuando los encuentre los vamos a reemplazar de la siguiente forma
        // price: { gte: 200 } -> price: { $gte: 200 }
        let queryString = JSON.stringify(queryObject);
        //Vamos a reemplazar en la cadena los operadores que vamos a usar
        queryString = queryString.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );
        queryObject = JSON.parse(queryString);

        //vAMOS A RECIBIR EL QUERY PARAm para especificar que campos vamos a mostrar en la consulta
        //fields
        let selected = "";
        if (req.query.fields) {
            selected = req.query.fields.split(",").join(" ");
        }
        console.log(selected);

        //El ordemiento utilizando sort
        let sort = "";
        console.log(req.query.sort);
        if (req.query.sort) {
            sort = req.query.sort.split(",").join(" ");
        }
        console.log(sort);

        //Vamos a resolver la paginacion
        //skip
        //limit
        //page -> obtener los elementos de determinada pagina
        //limit -> cantidad de elementos por pagina
        //Vamos a dar valores por defecto en el caso de que no nos lleguen los parametros
        let limit = req.query.limit || 10;
        let page = req.query.page || 1;
        let skip = (page - 1) * limit;
        const products = await Product.find(queryObject)
            .select(selected)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        res.send(products);
    } catch (error) {
        res.status(500).send(error);
    }
};

//Agregaciones
//Nos sirve para poder hacer operaciones mas complicadas en nuestra base de datos
//Pipeline -> es una secuencia de pasos que se ejecutan en orden
const getProductsStatistics = async (req, res) => {
    //Desde el equipo de producto nos han pedido que obtengamos los productos agrupados por categoria
    //Adicionalmente nos piden que mostremos cuantos productos hay por categoria
    //Ademas nos piden que calculemos el precio promedio de los productos por categoria
    //Tambien nos piden sacar el precio maximo y minimo de los productos por categoria
    //una condicion es que el precio de los productos que vamos a obtener sea mayor a 10
    //Vamos a tener etapas dentro de la agrecacion
    //Etapas
    //1) $match -> donde aplicamos filtros a nuestra consulta
    // Vamos a filtrar los productos donde el precio sea mayor a X valor
    const statistics = await Product.aggregate([
        //Primer paso match, aplicar el filtro de precio
        //EL RESULTADO DEL PASO ACTUAL ES EL INPUT DEL SIGUIENTE PASO
        {
            $match: { price: { $gt: 10 } },
        },
        //Segundo paso vamos a procesar LOS PRODUCTOS PARA AGRUPARLOS POR CATEGORIA
        {
            //Vamos a generar un nuevo documento
            $group: {
                //De este documento el identificador va a ser la categoria
                _id: "$category", //ropa, tecnologia, comida, muebles
                //Vamos a calcular la suma de cuantos productos hay por categoria
                count: { $sum: 1 },
                //Vamos a calcular el precio promedio de los productos por categoria
                avgPrice: { $avg: "$price" },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" },
            },
        },
        //El ultimo vamos a aplicar un ordenamiento de acuerdo al precio promedio avgPrice
        {
            $sort: { avgPrice: 1 },
        },
    ]);

    res.send(statistics);
};

//Vamos a crear un servicio para obtener un producto por id
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send({ message: "Producto no encontrado" });
        }
        res.send(product);
    } catch (error) {
        res.status(500).send(error);
    }
};

//Vamos a crear un servicio para actualizar un producto por id
//La idea es retornar el producto actualizado con los nuevos valores
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            return res.status(404).send({ message: "Producto no encontrado" });
        }
        res.send(product);
    } catch (error) {
        res.status(500).send(error);
    }
};

export {
    saveProduct,
    getAllProducts,
    getProductsByFilters,
    getProductsStatistics,
    getProductById,
    updateProduct,
}