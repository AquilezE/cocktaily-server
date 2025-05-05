'use strict';
const bcrypt = require('bcrypt');
const { User } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('password456', 10);

    await queryInterface.bulkInsert('Users', [
      {
        username: 'adminUser',
        email: 'admin@example.com',
        password_hash: hashedPassword1,
        role: 'admin',
        profile_picture_path: null,
        bio: 'Administrator account',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'regularUser',
        email: 'user@example.com',
        password_hash: hashedPassword2,
        role: 'user',
        profile_picture_path: null,
        bio: 'Regular user account',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
