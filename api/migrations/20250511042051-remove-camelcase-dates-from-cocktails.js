'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Cocktails', 'createdAt');
    await queryInterface.removeColumn('Cocktails', 'updatedAt');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Cocktails', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false
    });
    await queryInterface.addColumn('Cocktails', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false
    });
  }
};
