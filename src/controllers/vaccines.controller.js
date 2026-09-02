import vaccinesService from "../services/vaccines.service.js";

async function getVaccinesController(req, res) {
  try {
    const vaccines = await vaccinesService.getVaccinesService();
    return res.send(vaccines);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
}

async function postVaccinesController(req, res){
const { name, date, description, photo } = req.body

  try{
    const vaccines = await vaccinesService.postVaccinesService({
        name,
        date,
        description,
        photo,
    });
    return res.status(201).json(vaccines);
  } catch(e) {
    return res.status(400).json({ message: e.message });
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
    return res.status(400).json({ message: e.message });
  }
}

async function updateVaccinesController(req, res) {
  try {
    const { name, date, description, photo } = req.body;
    const { id: vaccineId } = req.params;
    // const userIdLogged = req.userId;

    const response = await vaccinesService.updateVaccinesService(
      { name, date, description, photo },
      vaccineId
      // userIdLogged
    );

    return res.send(response);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

async function deleteVaccinesController(req, res){
  const { id } = req.params;
  // const animalId = req.animalId;

  try {
    await vaccinesService.deleteVaccinesService(id);
    return res.send({ message: "Vacina deletada com sucesso" });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}


export default {
  getVaccinesController,
  postVaccinesController,
  findVaccinesByIdController,
  updateVaccinesController,
  deleteVaccinesController,
}