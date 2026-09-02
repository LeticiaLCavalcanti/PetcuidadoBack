import authService from "../services/auth.service.js";

const loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const token = await authService.loginService({ email, password });
    return res.status(200).json({ token });
  } catch (e) {
    return res.status(401).json({ message: e.message });
  }
};

export default { loginController };