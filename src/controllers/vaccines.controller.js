import vaccinesService from "../services/vaccines.service.js";

async function getVaccinesController(req, res) {
  try {
    const vaccines = await vaccinesService.getVaccinesService();
    return res.send(vaccines);
  } catch (e) {
    return res.status(404).send(e.message);
  }
}

async function postVaccinesController(req, res){
const { name, laboratory, date, description, photo } = req.body

  try{
    const token = await vaccinesService.postVaccinesService({
        name,
        laboratory,
        date,
        description,
        photo,
    });
    res.status(201).send(token);
  } catch(e) {
    return res.status(400).send(e.message);
  }
}

async function findVaccinesByIdController(req, res) {
  try {
    const vaccines = await vaccinesService.findVaccinesByIdService(
      req.params.id,
      // req.userId
    );
    return res.send(vaccines);
  } catch (e) {
    return res.status(400).send(e.message);
  }
}

async function updateVaccinesController(req, res) {
  try {
    const { name, laboratory, date, description, photo } = req.body;
    const { id: vaccineId } = req.params;
    // const userIdLogged = req.userId;

    const response = await vaccinesService.updateVaccinesService(
      { name, laboratory, date, description, photo },
      vaccineId
      // userIdLogged
    );

    return res.send(response);
  } catch (e) {
    res.status(400).send(e.message);
  }
}

async function deleteVaccinesController(req, res){
  const { id } = req.params;
  // const animalId = req.animalId;

  try {
    await vaccinesService.deleteVaccinesService(id);
    return res.send({ message: "Vacina deletada com sucesso" });
  } catch (e) {
    return res.status(500).send(e.message);
  }
}


export default {
  getVaccinesController,
  postVaccinesController,
  findVaccinesByIdController,
  updateVaccinesController,
  deleteVaccinesController,
}