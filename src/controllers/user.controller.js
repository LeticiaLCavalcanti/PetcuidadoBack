import userService from "../services/user.service.js";

async function createUserController(req, res) {
  const { name, username, email, password } = req.body;

  try {
    const token = await userService.createUserService({
      name,
      username,
      email,
      password,
    });
    return res.status(201).json({ token });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

async function findAllUserController(req, res) {
  try {
    const users = await userService.findAllUserService();
    return res.send(users);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
}

async function findUserByIdController(req, res) {
  try {
    const user = await userService.findUserByIdService(
      req.params.id,
      req.userId
    );
    return res.send(user);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

async function updateUserController(req, res) {
  try {
    const { name, username, email, password } = req.body;
    const { id: userId } = req.params;
    const userIdLogged = req.userId;

    const response = await userService.updateUserService(
      { name, username, email, password },
      userId,
      userIdLogged
    );

    return res.send(response);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

export default {
  createUserController,
  findAllUserController,
  findUserByIdController,
  updateUserController,
};