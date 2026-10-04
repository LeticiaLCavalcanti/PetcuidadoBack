import vaccinesService from "../services/vaccines.service.js";

/** Mapeia o status do AppError; cai no padrão quando o erro é inesperado. */
function fail(res, error, fallbackStatus) {
  return res.status(error.status ?? fallbackStatus).json({ message: error.message });
}

async function getVaccinesController(req, res) {
  try {
    // `?animal=<id>` restringe a listagem a um pet.
    const vaccines = await vaccinesService.getVaccinesService(
      req.userId,
      req.query.animal
    );
    return res.send(vaccines);
  } catch (e) {
    return fail(res, e, 400);
  }
}

async function postVaccinesController(req, res) {
  const { animal, name, date, description, photo } = req.body;

  try {
    const vaccines = await vaccinesService.postVaccinesService(
      { animal, name, date, description, photo },
      req.userId
    );
    return res.status(201).json(vaccines);
  } catch (e) {
    return fail(res, e, 400);
  }
}

async function findVaccinesByIdController(req, res) {
  try {
    const vaccines = await vaccinesService.findVaccinesByIdService(
      req.params.id,
      req.userId
    );
    return res.send(vaccines);
  } catch (e) {
    return fail(res, e, 400);
  }
}

async function updateVaccinesController(req, res) {
  try {
    const { name, date, description, photo } = req.body;
    const { id: vaccineId } = req.params;

    const response = await vaccinesService.updateVaccinesService(
      { name, date, description, photo },
      vaccineId,
      req.userId
    );

    return res.send(response);
  } catch (e) {
    return fail(res, e, 400);
  }
}

async function deleteVaccinesController(req, res) {
  const { id } = req.params;

  try {
    await vaccinesService.deleteVaccinesService(id, req.userId);
    return res.send({ message: "Vacina deletada com sucesso" });
  } catch (e) {
    return fail(res, e, 500);
  }
}

export default {
  getVaccinesController,
  postVaccinesController,
  findVaccinesByIdController,
  updateVaccinesController,
  deleteVaccinesController,
}
