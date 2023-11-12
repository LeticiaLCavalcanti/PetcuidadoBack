const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

let vacinas = [];

app.get('/vacinas', (req, res) => {
  res.json(vacinas);
});

app.post('/vacinas', (req, res) => {
  const novaVacina = req.body;
  vacinas.push(novaVacina);
  res.json({ message: 'Vacina cadastrada com sucesso', vacina: novaVacina });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});