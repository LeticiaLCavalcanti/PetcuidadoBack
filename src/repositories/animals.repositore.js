import Animals from "../models/Animals.js";

const getAnimalsRepository = () => Animals.find();

const postAnimalsRepository = ({
    name,
    birth,
    breed,
    color,
    weight,
    chipNumber,
    photo
}) => 
Animals.create({
    name,
    birth,
    breed,
    color,
    weight,
    chipNumber,
    photo
});

const findByIdAnimalsRepository = (id) => Animals.findById(id);

const updateAnimalsRepository = (
    id,
    name, 
    birth,
    breed,
    color,
    weight,
    chipNumber,
    photo
) => 
Animals.findOneAndUpdate(
    {
        _id: id,
    },
    {
    name,
    birth,
    breed,
    color,
    weight,
    chipNumber,
    photo
    },
    {
        rawResult: true,
    }
  );

function deleteAnimalsRepository(id) {
    return Animals.findOneAndDelete({ _id: id });
}

export default {
    getAnimalsRepository,
    postAnimalsRepository,
    findByIdAnimalsRepository,
    updateAnimalsRepository,
    deleteAnimalsRepository
}