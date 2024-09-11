const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Quiz API!');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const quizzes = [];

app.post('/quiz', (req, res) => {
  const quiz = req.body;
  quizzes.push(quiz);
  res.status(201).send('Quiz created');
});

app.get('/quiz', (req, res) => {
  res.status(200).json(quizzes);
});

app.post('/score', (req, res) => {
  const { userId, score } = req.body;
  // Save the score in the database (to be implemented)
  res.status(201).send('Score saved');
});