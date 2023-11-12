const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
const secretKey = '';

app.use(bodyParser.json());

const users = [
  {
    id: 1,
    username: '',
    password: '',
  },
];

function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token de autenticação não fornecido' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ message: 'Usuário não encontrado' });

  if (bcrypt.compareSync(password, user.password)) {
    const accessToken = jwt.sign({ id: user.id, username: user.username }, secretKey, {
      expiresIn: '1h',
    });

    res.json({ accessToken });
  } else {
    res.status(401).json({ message: 'Senha incorreta' });
  }
});

app.get('/protegida', authenticateToken, (req, res) => {
  res.json({ message: 'Esta é uma rota protegida' });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});