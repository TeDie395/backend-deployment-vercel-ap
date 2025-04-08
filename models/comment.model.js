import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    comment: {
        type: String,
        minlength: [5, "El mensaje debe tener al menos 5 caracteres"],
        maxlength: [100, "El mensaje no puede tener mas de 100 caracteres"],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }

});

export const Comment = mongoose.model("comments", commentSchema);