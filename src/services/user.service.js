import authService from "../services/auth.service.js";
import bcrypt from "bcrypt";
import userRepositories from "../repositories/user.repositore.js";

async function createUserService({
  name,
  username,
  email,
  password,
}) {
  if (!username || !name || !email || !password)
    throw new Error("Envie todos os campos para cadastrar");

  const foundUser = await userRepositories.findByEmailUserRepository(email);

  if (foundUser) throw new Error("O usuário já existe");

  const user = await userRepositories.createUserRepository({
    name,
    username,
    email,
    password,
  });

  if (!user) throw new Error("Erro ao criar o usuário");

  const token = authService.generateToken(user.id);

  return token;
}

async function findAllUserService() {
  const users = await userRepositories.findAllUserRepository();

  if (users.length === 0) throw new Error("Não há nenhum usuário encontrado");

  return users;
}

async function findUserByIdService(userIdParam, userIdLogged) {
  let idParam;
  if (!userIdParam) {
    userIdParam = userIdLogged;
    idParam = userIdParam;
  } else {
    idParam = userIdParam;
  }
  if (!idParam)
    throw new Error("Envie um ID nos parâmetros para pesquisar usuário");

  const user = await userRepositories.findByIdUserRepository(idParam);

  if (!user) throw new Error("Usuário não encontrado");

  return user;
}

async function updateUserService(
  { name, username, email, password },
  userId,
  userIdLogged
) {
  if (!name && !username && !email && !password)
    throw new Error("Envie ao menos um campo para atualizar usuário");

  const user = await userRepositories.findByIdUserRepository(userId);

  if (user._id != userIdLogged) throw new Error("Você não pode atualizar este usuário");

  if (password) password = await bcrypt.hash(password, 10);

  await userRepositories.updateUserRepository(
    userId,
    name,
    username,
    email,
    password,
  );

  return { message: "Usuário atualizado com sucesso!" };
}

export default {
  createUserService,
  findAllUserService,
  findUserByIdService,
  updateUserService,
};