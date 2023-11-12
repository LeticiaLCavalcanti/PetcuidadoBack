const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const animais = [];

app.get('/animais', (req, res) => {
  res.json({message: 'funfouu'})
});

app.post('/animais', (req, res) => {
  const novoAnimal = req.body;
  animais.push(novoAnimal);
  res.status(201).json(novoAnimal);
});

app.put('/animais/:id', (req, res) => {
  const { id } = req.params;
  const atualizacao = req.body;

  const animalIndex = animais.findIndex((animal) => animal.id === id);

  if (animalIndex === -1) {
    return res.status(404).json({ message: 'Animal não encontrado' });
  }

  animais[animalIndex] = { ...animais[animalIndex], ...atualizacao };
  res.json(animais[animalIndex]);
});

app.delete('/animais/:id', (req, res) => {
  const { id } = req.params;

  const animalIndex = animais.findIndex((animal) => animal.id === id);

  if (animalIndex === -1) {
    return res.status(404).json({ message: 'Animal não encontrado' });
  }

  const animalRemovido = animais.splice(animalIndex, 1);
  res.json(animalRemovido[0]);
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});