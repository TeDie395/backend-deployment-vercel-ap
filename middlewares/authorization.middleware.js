//Este middleware se va a encargar de validar si el usuario tiene el rol adecuado
//para poder acceder a un recurso
//["admin"]
const authorizationMiddleware = (roles) => (req, res, next) => {
    //Primero vamos a validar que efectivamente el usuario tenga un rol asignado
    if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Access denied, no role provided" });
    }

    //Vamos a validar que el rol que tienen el usuario se encuentra dentro de los roles
    //permitidos para este servicio
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied, invalid role" });
    }
    next();
};

export default authorizationMiddleware;