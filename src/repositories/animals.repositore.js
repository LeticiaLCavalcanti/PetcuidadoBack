import Animals from "../models/Animals.js";

/** Só os animais do usuário logado. */
const getAnimalsRepository = (userId) => Animals.find({ user: userId });

const postAnimalsRepository = ({
    user,
    name,
    birth,
    breed,
    color,
    weight,
    chipNumber,
    photo
}) =>
Animals.create({
    user,
    name,
    birth,
    breed,
    color,
    weight,
    chipNumber,
    photo
});

const findByIdAnimalsRepository = (id) => Animals.findById(id);

/**
 * Busca escopada: só devolve o animal se ele for do usuário. Usada nos fluxos
 * que precisam garantir a posse antes de ler ou alterar.
 */
const findByIdAndUserAnimalsRepository = (id, userId) =>
    Animals.findOne({ _id: id, user: userId });

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
    findByIdAndUserAnimalsRepository,
    updateAnimalsRepository,
    deleteAnimalsRepository
}
