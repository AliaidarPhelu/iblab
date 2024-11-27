const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const config = require('./config');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: config.pgURI,
});

pool
  .connect()
  .then(() => console.log('PostgreSQL connected'))
  .catch((err) => console.log(err));

// Модель
const createUser = async (name, email) => {
  const queryText = 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING *';
  const values = [name, email];
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

// Контроллер
const registerUser = async (req, res) => {
  const { name, email } = req.body;

  console.log('Received data:', { name, email });

  try {
    const user = await createUser(name, email);
    console.log('User created:', user);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ message: error.message });
  }
};

// Маршрут
app.post('/api/users/register', registerUser);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
