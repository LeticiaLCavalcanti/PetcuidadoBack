import Vaccines from "../models/Vaccines.js";

const getVaccinesRepository = () => Vaccines.find();

const postVaccinesRepository = ({
    name,
    laboratory,
    date,
    description,
    photo
}) => 
Vaccines.create({
    name,
    laboratory,
    date,
    description,
    photo
});

const findByIdVaccinesRepository = (id) => Vaccines.findById(id);

const updateVaccinesRepository = (
    id,
    name,
    laboratory,
    date,
    description,
    photo
) => 
Vaccines.findOneAndUpdate(
    {
        _id: id,
    },
    {
        name,
        laboratory,
        date,
        description,
        photo
    },
    {
        rawResult: true,
    }
  );

function deleteVaccinesRepository(id) {
    return Vaccines.findOneAndDelete({ _id: id });
}

export default {
    getVaccinesRepository,
    postVaccinesRepository,
    findByIdVaccinesRepository,
    updateVaccinesRepository,
    deleteVaccinesRepository
}