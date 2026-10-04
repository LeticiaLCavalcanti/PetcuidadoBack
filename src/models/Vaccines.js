import mongoose from "mongoose";

const VaccinesSchema = new mongoose.Schema({
    // Animal ao qual a vacina pertence. A posse é validada pelo dono do animal.
    animal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Animals",
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
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
