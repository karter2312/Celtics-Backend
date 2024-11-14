require('dotenv').config();

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Add a new route to handle adding data to the database
app.post('/add', (req, res) => {
  const { name, age } = req.body;
  const query = 'INSERT INTO users (name, age) VALUES (?, ?)';
  db.query(query, [name, age], (err, result) => {
    if (err) {
      console.error('Error adding data:', err);
      res.status(500).send('Error adding data');
    } else {
      res.send('Data added successfully');
    }
  });
});

// Add a new route to handle fetching data from the database
app.get('/users', (req, res) => {
  const query = 'SELECT * FROM users';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
    } else {
      res.json(results);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
