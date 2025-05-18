'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.sequelize.query(`
      CREATE EVENT IF NOT EXISTS end_stale_livestreams
      ON SCHEDULE EVERY 30 MINUTE
      DO 
        UPDATE LiveSessions
        SET ended_at = DATE_ADD(started_at, INTERVAL 8 HOUR)
        WHERE ended_at IS NULL
          AND started_at < DATE_SUB(NOW(), INTERVAL 8 HOUR)
          AND DATE_ADD(started_at, INTERVAL 8 HOUR) < NOW();
      `)

  },

  async down (queryInterface, Sequelize) {

    await queryInterface.sequelize.query(`
      DROP EVENT IF EXISTS end_stale_livestreams;
      `);

  }
};
