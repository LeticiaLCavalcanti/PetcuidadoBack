import mongoose from "mongoose";

const AnimalSchema = new mongoose.Schema({
    // Dono do animal. Preenchido a partir do token, nunca do corpo da request.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
    },
    birth: {
        type: Date,
        required: true,
    },
    breed: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: false,
    },
    // Em quilos.
    weight: {
        type: Number,
        required: false,
        min: 0,
    },
    chipNumber: {
        type: String,
        required: false,
    },
    photo: {
        type: String,
        required: false,
    },
});

const Animals = mongoose.model("Animals", AnimalSchema);

export default Animals;
