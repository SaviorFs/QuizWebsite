const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK))
});

app.use(express.json());

// Basic route to check the server
app.get('/', (req, res) => {
  res.send('Quiz Website Backend is running');
});

// Signup Route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().createUser({ email, password });
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().getUserByEmail(email);
    // Add additional password check logic here
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
