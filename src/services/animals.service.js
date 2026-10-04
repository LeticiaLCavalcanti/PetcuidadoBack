import mongoose from "mongoose";

import animalsRepositories from "../repositories/animals.repositore.js";
import vaccinesRepositories from "../repositories/vaccines.repositore.js";
import { badRequest, notFound } from "../errors/AppError.js";
import { parseISODate } from "../utils/date.js";

/** Converte a data recebida, recusando o que não for `YYYY-MM-DD` válido. */
function requireDate(value, field) {
  const date = parseISODate(value);

  if (!date) throw badRequest(`Envie ${field} no formato YYYY-MM-DD`);

  return date;
}

/** Peso é opcional, mas quando vem precisa ser um número de quilos. */
function optionalWeight(value) {
  if (value === undefined || value === null || value === "") return undefined;

  const weight = Number(value);

  if (!Number.isFinite(weight) || weight < 0)
    throw badRequest("Peso deve ser um número em quilos (ex.: 7.5)");

  return weight;
}

/** Lista apenas os animais do usuário logado. Sem animais, devolve `[]`. */
async function getAnimalsService(userId) {
  return animalsRepositories.getAnimalsRepository(userId);
}

async function postAnimalsService(
  { name, birth, breed, color, weight, chipNumber, photo },
  userId
) {
  if (!name || !birth || !breed)
    throw badRequest("Envie todos os campos obrigatórios para cadastrar");

  const animals = await animalsRepositories.postAnimalsRepository({
    user: userId,
    name,
    birth: requireDate(birth, "a data de nascimento"),
    breed,
    color,
    weight: optionalWeight(weight),
    chipNumber,
    photo,
  });

  if (!animals) throw badRequest("Erro ao cadastrar o animal, tente novamente");

  return animals;
}

/**
 * Busca o animal garantindo que ele pertence ao usuário. Responde 404 tanto
 * para inexistente quanto para "é de outro dono", para não revelar a
 * existência de registros alheios.
 */
async function findAnimalsByIdService(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw badRequest("ID inválido!");

  const animal = await animalsRepositories.findByIdAndUserAnimalsRepository(
    id,
    userId
  );

  if (!animal) throw notFound("Animal não encontrado");

  return animal;
}

async function updateAnimalsService(
  { name, birth, breed, color, weight, chipNumber, photo },
  animalId,
  userId
) {
  if (!name && !birth && !breed && !color && !weight && !chipNumber && !photo)
    throw badRequest("Envie ao menos um campo para atualizar o animal");

  await findAnimalsByIdService(animalId, userId);

  await animalsRepositories.updateAnimalsRepository(
    animalId,
    name,
    birth === undefined ? undefined : requireDate(birth, "a data de nascimento"),
    breed,
    color,
    optionalWeight(weight),
    chipNumber,
    photo
  );

  return { message: "Animal atualizado com sucesso!" };
}

async function deleteAnimalsService(id, userId) {
  await findAnimalsByIdService(id, userId);

  // O animal sai primeiro de propósito: não há transação aqui, e se o segundo
  // passo falhar é melhor sobrar vacina órfã (invisível nas listagens, e o
  // script de migração limpa) do que apagar as vacinas e manter o pet.
  await animalsRepositories.deleteAnimalsRepository(id);

  await vaccinesRepositories.deleteVaccinesByAnimalRepository(id);
}

export default {
  getAnimalsService,
  postAnimalsService,
  updateAnimalsService,
  findAnimalsByIdService,
  deleteAnimalsService,
};
