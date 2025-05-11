'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Cocktails', 'description');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Cocktails', 'description', {
      type: Sequelize.TEXT
    });
  }
};
