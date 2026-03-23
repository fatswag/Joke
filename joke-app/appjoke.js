const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log("RUNNING JOKE APP DB VERSION -", __filename);

const app = express();
const PORT = process.env.JOKE_PORT || process.env.PORT || 3000;

app.use(bodyParser.json()) // json method parse json data into the req.body
app.use(express.static(path.join(__dirname, 'public'))) // Serve static web pages

// DB connection
// moved into lib/joke-db.js for separation of concerns
const db = require('./lib/joke-db.js');

// ROUTES

// GET /types  -> from types table
app.get('/types', async (req, res) => {
  try {
    const types = await db.getTypes();
    res.json(types);
  } catch (err) {
    res.status(500).send(err);
  }
});

// jokes to return all jokes from DB
app.get('/jokes', async (req, res) => {
  try {
    const jokes = await db.getAllJokes();
    res.json(jokes);
  } catch (err) {
    res.status(500).send(err);
  }
});

// GET /joke/:type?count=n  -> from jokes table
app.get('/joke/:type', async (req, res) => {
  try {
    const type = req.params.type.toLowerCase();
    let count = parseInt(req.query.count) || 1;
    if (isNaN(count) || count < 1) count = 1;

    if (!type) return res.sendStatus(400);

    let rows;

    if (type === 'any') {
      rows = await db.getAllJokes();
    } else {
      rows = await db.getJokesByType(type); // uses placeholder to prevent SQL injection (inside db file)
    }

    if (!rows || rows.length === 0) return res.sendStatus(404);

    if (count > rows.length) count = rows.length;

    // Random selection (done in JS to keep logic similar)
    const shuffled = rows.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    res.json(selected);

  } catch (err) {
    res.status(500).send(err);
  }
});

db.createConnectionPool();

async function start() {
  try {
    const dbName = await db.isConnected();
    console.log(`Connected to MySQL database "${dbName}"`);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
}

start();