import animalsService from "../services/animals.service.js";

async function getAnimalsController(req, res) {
  try {
    const animals = await animalsService.getAnimalsService();
    return res.send(animals);
  } catch (e) {
    return res.status(404).send(e.message);
  }
}

async function postAnimalsController(req, res){
const { name, birth, breed, sex, color, weight, chipNumber, photo } = req.body

  try{
    const animals = await animalsService.postAnimalsService({
        name,
        birth,
        breed,
        sex,
        color,
        weight,
        chipNumber,
        photo,
    });
    res.status(201).send(animals);
  } catch(e) {
    return res.status(400).send(e.message);
  }
}

async function findAnimalsByIdController(req, res) {
  try {
    const animals = await animalsService.findAnimalByIdService(
      req.params.id,
    );
    return res.send(animals);
  } catch (e) {
    return res.status(400).send(e.message);
  }
}

async function updateAnimalsController(req, res) {
  try {
    const { name, birth, breed, sex, color, weight, chipNumber, photo } = req.body;
    const { id: animalId } = req.params;

    const response = await animalsService.updateAnimalsService(
      { name, birth, breed, sex, color, weight, chipNumber, photo },
      animalId
    );

    return res.send(response);
  } catch (e) {
    res.status(400).send(e.message);
  }
}

async function deleteAnimalsController(req, res){
  const { id } = req.params;

  try {
    await animalsService.deleteAnimalsService(id);
    return res.send({ message: "Animal deletado com sucesso" });
  } catch (e) {
    return res.status(500).send(e.message);
  }
}

export default {
  getAnimalsController,
  postAnimalsController,
  findAnimalsByIdController,
  updateAnimalsController,
  deleteAnimalsController
};