import jwt from "jsonwebtoken";
import "dotenv/config";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Token não enviado." });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
    return res.status(401).send({ message: "Formato de token inválido." });
  }

  const [, token] = parts;

  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: "Token expirado ou inválido." });
    }

    req.userId = decoded.id;
    return next();
  });
}
