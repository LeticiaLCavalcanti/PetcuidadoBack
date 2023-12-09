import "dotenv/config";
import jwt from "jsonwebtoken";

function authenticateToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token de autenticação não fornecido' });
  
    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Token inválido' });
      req.user = user;
      next();
    });
  }

  export default authenticateToken;

