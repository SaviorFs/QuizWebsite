const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const admin = require('firebase-admin');

// Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK))
});

app.use(express.json());

// checks server
app.get('/', (req, res) => {
  res.send('Quiz Website Backend is running');
});

// signup
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().createUser({ email, password });
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().getUserByEmail(email);
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
