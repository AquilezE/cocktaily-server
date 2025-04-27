// app.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const app = express();

const { Sequelize } = require('sequelize');
const models = require('./models'); 

const server = http.createServer(app)
const { Server} = require("socket.io");

const io = new Server(server);



app.use(express.json());
app.use(cors());

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