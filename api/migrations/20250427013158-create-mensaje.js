'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Mensajes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idParticipante: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: 'ParticimanteChats', key: 'idParticipante'},
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      contenido: {
        type: Sequelize.TEXT
      },
      idChat: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: 'Chats', key: 'IdChat'},
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      idArchivo: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Mensajes');
  }
};