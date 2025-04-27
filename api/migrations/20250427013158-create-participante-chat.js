'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ParticipanteChats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idContacto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: 'Contactos', key: 'idContacto'},
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      idChat: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: 'Chats', key: 'idChat'},
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      idUsuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: 'Usuarios', key: 'idUsuario'},
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('ParticipanteChats');
  }
};