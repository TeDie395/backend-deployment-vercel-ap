//La capa de controladores debe encargarse de recibir el request y dar una respuesta
//Puede tener validaciones
// * Esta capa tendra la logica de negocio
import { User } from "../models/user.model.js";

const saveUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({
            deletedAt: null

        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    //Implementar el borrado logico
    // Realmente no vamos a eliminar el registro de la base de datos
    //vamos a actualizar al usuario definiendo una fecha en el campo deletedAt
    try {
        //Primero necesito obtener el id del usuario que vamos a eliminar
        const userId = req.params.id;
        const user = await User.findByIdAndUpdate(userId, {
            deletedAt: new Date(),
        });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndUpdate(userId, req.body, {
            new: true,
            runValidators: true
        });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json(user);

    } catch (error) {
        res.status(500).send(error)
    }
};

export { saveUser, getAllUsers, deleteUser, updateUser };