'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Ingredients', [
      {
        name: 'Ron Blanco',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jugo de Limón',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Menta',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Hielo',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Ingredients', null, {});
  }
};
