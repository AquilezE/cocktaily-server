const express = require('express');
const cors = require('cors');
const http = require('http');
const app = express();
const path = require('path');
const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');


require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
}

const keyFile = process.env.SERVICE_ACCOUNT_PATH;
admin.initializeApp({credential: admin.credential.cert(require(keyFile))});



const { Sequelize } = require('sequelize');
const models = require('./models');
const routes = require('./routes'); // <<< THIS
const attachSocket = require('./socket');
const server = http.createServer(app);
const io = attachSocket(server);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', routes);  

models.sequelize.authenticate().then(() => console.log('BD conectada')).catch(err => console.error('.'));

module.exports = app;