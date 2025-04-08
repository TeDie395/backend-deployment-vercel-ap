//Un servicio que nos permita agregar un nuevo comentario a la orden
//el id de la orden para saber a donde asociar el comentario
//el mensaje que vamos a colocar a la orden
// el ide del usuario que esta haciendo el comentario
// Primero deben guardar el comment y luego con ese ide que fue generado deber hacer un update de la orden
//al campo comments que es un array
import { Comment } from '../models/comment.model.js';
import { Order } from '../models/order.model.js';

const addCommentToOrder = async (req, res) => {
    try {
        const { orderId, userId, comment } = req.body;
        const newComment = new Comment({
            user: userId,
            comment,
        });

        await newComment.save();

        const order = await Order.findById(orderId);
        console.log(order);
        order.comments.push(newComment._id);

        await order.save();

        res.status(201).json({ message: "Comentario Creado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "error al agregar el comentario" });
    }
};
export { addCommentToOrder };
