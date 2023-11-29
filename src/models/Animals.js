import mongoose from "mongoose";

const AnimalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    birth: {
        type: String,
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
    weight: {
        type: String,
        required: false,
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