// src/server.js
const http = require('http');
const app = require('./app');
const attachSocket = require('./socket'); 
const { sequelize } = require('./models');



const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');
    await sequelize.sync();
    console.log('✅ Tables synced');

    const server = http.createServer(app);

    attachSocket(server);

    server.listen(PORT, () =>
      console.log(`✅ API + Socket.IO listening on port ${PORT}`)
    );
  } catch (err) {
    console.error('❌ Startup error:', err);
  }
})();
