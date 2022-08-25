const express = require('express')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.broadcast.emit('chat message', 'User joined.');
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.use(express.static(path.join(__dirname, 'public')))
  .get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  })
  .get('/db', async (req, res) => {
    const results = await getQuery('SELECT * FROM test');
    console.log(results);
    if (results !== null) {
      res.render('pages/db', results);
    }
  }
  );

server.listen(3000, () => console.log(`Listening on ${3000}`));

async function getQuery(query) {
  try {
    const client = await pool.connect();
    const result = await client.query(query);
    const results = { 'results': (result) ? result.rows : null };
    client.release();
    return results;
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
}