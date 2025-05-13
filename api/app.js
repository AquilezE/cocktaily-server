const express = require('express');
const cors = require('cors');
const http = require('http');
const app = express();
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
}

const { Sequelize } = require('sequelize');
const models = require('./models');
const routes = require('./routes'); // <<< THIS

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use('/api', routes);   // <<< MOUNT the routes here

models.sequelize.authenticate().then(() => console.log('BD conectada')).catch(err => console.error('pedos con bd: ', err))

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
});

module.exports = app;