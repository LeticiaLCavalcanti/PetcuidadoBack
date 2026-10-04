import mongoose from "mongoose";

import vaccinesRepositories from "../repositories/vaccines.repositore.js";
import animalsRepositories from "../repositories/animals.repositore.js";
import animalsService from "./animals.service.js";
import { badRequest, notFound } from "../errors/AppError.js";
import { parseISODate } from "../utils/date.js";

/** Converte a data recebida, recusando o que não for `YYYY-MM-DD` válido. */
function requireDate(value) {
  const date = parseISODate(value);

  if (!date) throw badRequest("Envie a data da vacina no formato YYYY-MM-DD");

  return date;
}

/**
 * Lista as vacinas do usuário logado.
 *
 * Com `animalId`, restringe a um pet (validando a posse antes). Sem ele,
 * devolve as vacinas de todos os pets do usuário.
 */
async function getVaccinesService(userId, animalId) {
  if (animalId) {
    await animalsService.findAnimalsByIdService(animalId, userId);

    return vaccinesRepositories.getVaccinesByAnimalRepository(animalId);
  }

  const animals = await animalsRepositories.getAnimalsRepository(userId);

  if (animals.length === 0) return [];

  return vaccinesRepositories.getVaccinesByAnimalsRepository(
    animals.map((animal) => animal._id)
  );
}

async function postVaccinesService({ animal, name, date, description, photo }, userId) {
  if (!animal) throw badRequest("Envie o animal ao qual a vacina pertence");

  if (!name || !date)
    throw badRequest("Envie todos os campos obrigatórios para cadastrar");

  // Só deixa cadastrar em um pet que é do próprio usuário.
  await animalsService.findAnimalsByIdService(animal, userId);

  const vaccines = await vaccinesRepositories.postVaccinesRepository({
    animal,
    name,
    date: requireDate(date),
    description,
    photo,
  });

  if (!vaccines)
    throw badRequest("Erro ao cadastrar os dados da vacina, tente novamente");

  return vaccines;
}

/** Busca a vacina validando a posse através do animal dono dela. */
async function findVaccinesByIdService(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw badRequest("ID inválido!");

  const vaccine = await vaccinesRepositories.findByIdVaccinesRepository(id);

  if (!vaccine) throw notFound("Vacina não encontrada");

  await animalsService.findAnimalsByIdService(String(vaccine.animal), userId);

  return vaccine;
}

async function updateVaccinesService({ name, date, description, photo }, vaccineId, userId) {
  if (!name && !date && !description && !photo)
    throw badRequest("Envie ao menos um campo para atualizar os dados da vacina");

  await findVaccinesByIdService(vaccineId, userId);

  await vaccinesRepositories.updateVaccinesRepository(
    vaccineId,
    name,
    date === undefined ? undefined : requireDate(date),
    description,
    photo
  );

  return { message: "Vacina atualizada com sucesso!" };
}

async function deleteVaccinesService(id, userId) {
  await findVaccinesByIdService(id, userId);

  await vaccinesRepositories.deleteVaccinesRepository(id);
}

export default {
  getVaccinesService,
  postVaccinesService,
  updateVaccinesService,
  findVaccinesByIdService,
  deleteVaccinesService,
};
