//Este middleware debe encargar de validar lo siguiente
//1.- Que en el request el fronted haya enviando el token de acceso
//2.- Debe validar que el jwt sea valido (que tenga la estructura correcta y que no haya expirado)
//3.- Obtener la informacion que esta dentro del JWT
import jwt from "jsonwebtoken";
import configs from "../configs/configs.js";


const authenticationMiddleware = (req, res, next) => {
    //El JWT nos va a llegar en header del request
    const authHeader = req.header("Authorization");
    //Bearer
    //1.- Que en el request el fronted haya enviando el token de acceso
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    //2.- Debe validar que el jwt sea valido (que tenga la estructura correcta y que no haya expirado)
    //3.- Obtener la informacion que esta dentro del JWT
    try {
        //Lo que nos interesa es el TOKEN con tal
        //Bearer token
        const token = authHeader.split(" ")[1];// ["Bearer","token"]
        //Vamos a verificar el token
        //aparte de verificar el token este metodo tambien retorna el payload o data que se
        //encuentra dentro del token
        const decoded = jwt.verify(token, configs.JWT_SECRET);
        //Los middlewares pueden hacer modificaciones tanto al objeto request como al response
        //Al objeto request le vamos a agregar un atributo
        //Vamos a agregar el key user, que contiene el payload o datos que teniamos en el JWT
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }

};

export default authenticationMiddleware;
