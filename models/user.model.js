//Vamos a definir el schema de nuestra collection y el modelo de la misma
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userShema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        //Vamos a definir un grupo de roles que puede tener el usuario
        enum: ["user", "admin", "author"],
        default: "user",
    },
    //Los siguientes campos que vamos a definir estan relacionados con el reseteo del password
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    createdAt: {
        type: Date,
        default: Date.now,
    },

    deletedAt: {
        type: Date,
        default: null,
    },

});

//Quiero listar todos los usuarios que no hayan sido eliminados
//deletedAt -> null => se puede conseguir aplicando un middleware
//cada vez que hagamos un find voy a validar que el campo deletedAt sea null

//vamos a implementar un middleware que se ejecute antes de la creacion del usuario
// este middleware se va a encargar de hashear la contraseña

userShema.pre("save", async function (next) {
    //primero obtenemos el usuario que se esta creando
    const user = this;

    //Solo si modifica el atributo password vamos a proceder a hashear la contrasena
    if (user.isModified("password")) {
        try {
            //Vamos a hashear la contrasena
            //Generamos una cadena aleatoria que se va a encargar de hashear la contrasena
            //Esta cadena la vamos a generar usando bcrypt
            //Esta generacion puede tener varias rondas, mientras mas rondas mas seguras es la contrasena
            const salt = await bcrypt.genSalt(10);
            //y finalmente hasheamos la contrasena con la cadena generada
            user.password = await bcrypt.hash(user.password, salt);
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

//Cuando el usuario intente hacer login, recibimos el password en texto plano
//Es comparar usando los hash
//Vamos a agrgar un metodo personalizado a nuestro schema
//Este metodo se va a encargar de comparar la contrasena en texto plano con la contrasena hasheada
userShema.methods.comparePassword = async function (plainPassword) {
    //1234 lo comparamos con la contrasena hasheada
    //this -> es el usuario en cuestion
    // Esto retorna un boolean, true -> si las contrasenas coinciden, false -> si no coinciden
    const validationResult = await bcrypt.compare(plainPassword, this.password);
    return validationResult;
};

userShema.methods.generateResetPasswordToken = function () {
    //Este metodo se va a encargar de setear los dos atributos que forman parte del usuario
    //El primer atributo es el token
    //El segundo atributo es la fecha de expiracion del token
    //Para generar este token vamos a usar crypto -> es una dependencia que nos sirve para hashear cosas
    //Crypto vs Bcrypt
    //Crypto es una dependencia mas completa en la cual podemos hashear cosas, utilizando multiples algoritmos
    //Bcrypt es una dependencia que esta enfocada en trabajar con trasenas -> optimizado para este fin
    //Vamos a generar el token de reseteo de password -> Un conjunto de caracteres generados de forma
    //aleatoria
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenHashed = crypto.createHash("sha256").update(resetToken).digest("hex");

    //Vamos a actualizar estos atributos en el usuario
    this.resetPasswordToken = resetTokenHashed;
    this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    return resetTokenHashed;
};

export const User = mongoose.model("users", userShema);