import Vaccines from "../models/Vaccines.js";

/** Vacinas de um animal específico. */
const getVaccinesByAnimalRepository = (animalId) =>
    Vaccines.find({ animal: animalId });

/** Vacinas de todos os animais informados (ex.: todos os pets do usuário). */
const getVaccinesByAnimalsRepository = (animalIds) =>
    Vaccines.find({ animal: { $in: animalIds } });

const postVaccinesRepository = ({
    animal,
    name,
    date,
    description,
    photo
}) =>
Vaccines.create({
    animal,
    name,
    date,
    description,
    photo
});

const findByIdVaccinesRepository = (id) => Vaccines.findById(id);

const updateVaccinesRepository = (
    id,
    name,
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

/** Remove todas as vacinas de um animal (usado ao excluir o animal). */
function deleteVaccinesByAnimalRepository(animalId) {
    return Vaccines.deleteMany({ animal: animalId });
}

export default {
    getVaccinesByAnimalRepository,
    getVaccinesByAnimalsRepository,
    postVaccinesRepository,
    findByIdVaccinesRepository,
    updateVaccinesRepository,
    deleteVaccinesRepository,
    deleteVaccinesByAnimalRepository
}
