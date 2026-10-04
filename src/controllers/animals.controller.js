import animalsService from "../services/animals.service.js";

/** Mapeia o status do AppError; cai no padrão quando o erro é inesperado. */
function fail(res, error, fallbackStatus) {
  return res.status(error.status ?? fallbackStatus).json({ message: error.message });
}

async function getAnimalsController(req, res) {
  try {
    const animals = await animalsService.getAnimalsService(req.userId);
    return res.send(animals);
  } catch (e) {
    return fail(res, e, 400);
  }
}

async function postAnimalsController(req, res) {
  const { name, birth, breed, color, weight, chipNumber, photo } = req.body;

  try {
    // O dono vem do token, nunca do corpo da request.
    const animals = await animalsService.postAnimalsService(
      { name, birth, breed, color, weight, chipNumber, photo },
      req.userId
    );
    return res.status(201).json(animals);
  } catch (e) {
    return fail(res, e, 400);
  }
}

async function findAnimalsByIdController(req, res) {
  try {
    const animals = await animalsService.findAnimalsByIdService(
      req.params.id,
      req.userId
    );
    return res.send(animals);
  } catch (e) {
    return fail(res, e, 400);
  }
}

async function updateAnimalsController(req, res) {
  try {
    const { name, birth, breed, color, weight, chipNumber, photo } = req.body;
    const { id: animalId } = req.params;

    const response = await animalsService.updateAnimalsService(
      { name, birth, breed, color, weight, chipNumber, photo },
      animalId,
      req.userId
    );

    return res.send(response);
  } catch (e) {
    return fail(res, e, 400);
  }
}

async function deleteAnimalsController(req, res) {
  const { id } = req.params;

  try {
    await animalsService.deleteAnimalsService(id, req.userId);
    return res.send({ message: "Animal deletado com sucesso" });
  } catch (e) {
    return fail(res, e, 500);
  }
}

export default {
  getAnimalsController,
  postAnimalsController,
  findAnimalsByIdController,
  updateAnimalsController,
  deleteAnimalsController
};
