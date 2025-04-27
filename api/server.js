// src/server.js
const app = require('./app');
const { sequelize } = require('./models');



const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synced');

    app.listen(PORT, () =>
        console.log(`listening on port ${PORT}`)
    );
  } catch (err) {
    console.error('❌ Startup error:', err);
  }
})();
