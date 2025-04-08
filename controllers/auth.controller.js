import configs from "../configs/configs.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/send-email.js";

const register = async (req, res) => {
    try {
        //Vamos a obtener los campos del usuario que esta enviando el cliente
        //username, password, email -> en el cuerpo de la peticion
        const { username, password, email } = req.body;
        const user = new User({ username, password, email });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        //username, password
        //EL PRIMER PASO ES VALIDAR QUE EL USUARIO EXISTE EN LA BDD
        //vamos a buscar el usuario de acuerdo a su username
        //Obtenemos las credenciales del cuerpo de la peticion
        const { username, password } = req.body;
        //BUSCAMOS EL USUARIO POR USERNAME
        const user = await User.findOne({ username });
        if (!user) {
            //Error de autenticacion -> 401
            return res.status(401).json({ message: "Invalid credentials" });
        }

        //Comparamos las contraseñas
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        //Vamos a generar un token de acceso JWT (Json Web Token)
        //Este token es como la cedula de identidad del usuario
        //Para generar el JWT vamos a usar una dependencia llamada jsonwebtoken
        //El metodo sign recibe los siguientes parametros:
        //1.- Recibe el payload (datos que quiero guardar en el jwt)
        //En nuestro caso el payload va a ser un objeto con los datos del usuario (id del usuario)
        //2.- La clave secreta para firmar nuestro token
        //La firma es util para poder garantizar que nuestro token no ha sido alterado
        //jwt -> HEADER.PAYLOAD.SIGNATURE -> jkdnfkasd%&.jndfkvndjnfgsf.sadfasdf
        //HEADER: { alg: "HS256", typ: "JWT" } -> BASE64
        //PAYLOAD: { userId: "1234567890" } -> BASE64
        //SIGNATURE: HMACSHA256(HEADER + "." + PAYLOAD, SECRET)
        //3.- es pasar el tiempo de expiracion del token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            configs.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    //En este servicio el frontnend esta enviando el correo electronnico
    try {
        const { email } = req.body;
        //Ahora con el email vamos a validar si hay un usuario asociado a ese correo electronico
        //Consular a la BDD el usuario que tenga ese correo
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        //El siguiente paso es generar el token de recuperacion de password
        //Este token va a ser enviado al correo electronico del usuario
        //Vamos a definir el tiempo de expiracion de este token
        //Pero esto no lo vamos a resolver aca, sino va a ser un metodo del modelo del usuario
        //Este token es el que va a ser enviando DENTRO DEL LINK DE RESETEO DE PASSWORD
        const resetToken = user.generateResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        //Crear el enlace para resetear la contraseña
        const resetUrl = `http://localhost:5174/reset-password/${resetToken}`;
        const message = `Hola, para resetear tu contraseña por favor haz click en el siguiente enlace: ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Recuperacion de contraseña",
                message,
            });

            res.json({ message: "El link ha sido enviado a tu correo electronico" });
        } catch (error) {
            console.log(error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });
            res.status(500).json({ message: "Ocurrio un error al enviar el correo" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        //Este servicio recibe como parametro el token de recuperacion de password
        const { token } = req.params;
        //Vamos a recibir la nueva contraseña del usuario dentro del body del request
        const { password } = req.body;
        //Primer paso es validar si el token esta asociado a un usuario y si el token no ha expirado
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() },
        });

        //Si no encontramos el usuario, significa que el token no es valido o ya ha expirado
        if (!user) {
            return res.status(400).json("Token invalido o expirado");
        }

        //Si el token es valido, vamos a actualizar la contraseña del usuario
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ message: "Contraseña actualizada con exito" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { register, login, forgotPassword, resetPassword };