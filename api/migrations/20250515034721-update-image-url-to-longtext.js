'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Cocktails', 'image_url', {
      type: Sequelize.DataTypes.TEXT('long'),
      allowNull: false,
    });
/*
    await queryInterface.addColumn('Cocktails', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });

    await queryInterface.addColumn('Cocktails', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
    */
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Cocktails', 'image_url', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.removeColumn('Cocktails', 'createdAt');
    await queryInterface.removeColumn('Cocktails', 'updatedAt');
  }
};
