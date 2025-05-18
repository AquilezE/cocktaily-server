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
const attachSocket = require('./socket');

const server = http.createServer(app);

const io = attachSocket(server);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use('/api', routes);  

models.sequelize.authenticate().then(() => console.log('BD conectada')).catch(err => console.error('pedos con bd: ', err))


module.exports = app;