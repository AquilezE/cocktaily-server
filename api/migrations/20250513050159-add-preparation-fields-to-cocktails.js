'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Cocktails', 'preparation_time', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('Cocktails', 'is_non_alcoholic', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    await queryInterface.addColumn('Cocktails', 'alcohol_type', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Cocktails', 'preparation_time');
    await queryInterface.removeColumn('Cocktails', 'is_non_alcoholic');
    await queryInterface.removeColumn('Cocktails', 'alcohol_type');
  }
};
