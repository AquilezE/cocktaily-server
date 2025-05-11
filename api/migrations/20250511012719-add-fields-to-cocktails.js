'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Cocktails', 'creation_steps', {
      type: Sequelize.TEXT,
      allowNull: false
    });

    await queryInterface.addColumn('Cocktails', 'image_url', {
      type: Sequelize.STRING,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Cocktails', 'creation_steps');
    await queryInterface.removeColumn('Cocktails', 'image_url');
  }
};
