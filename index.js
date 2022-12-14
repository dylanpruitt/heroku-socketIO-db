const express = require('express')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

io.on('connection', async (socket) => {
  const queryResults = await getQuery('SELECT * FROM test');
  io.to(socket.id).emit('recipe query', queryResults);
  console.log(queryResults);
  socket.emit('recipe query', queryResults);
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  })
  .get('/db', async (req, res) => {
    const results = await getQuery('SELECT * FROM test');
    console.log(results);
  }
  );

server.listen(PORT, () => console.log(`Listening on ${PORT}`));

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