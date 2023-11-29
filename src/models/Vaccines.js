import mongoose from "mongoose";

const VaccinesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    photo: {
        type: String,
        required: false,
    },
})

const Vaccines = mongoose.model("Vaccines", VaccinesSchema);

export default Vaccines;