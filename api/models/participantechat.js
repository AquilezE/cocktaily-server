'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ParticipanteChat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Chat, {
        foreignKey: 'idChat',
        as: 'chat',
      });
      this.belongsTo(models.Usuario, {
        foreignKey: 'idUsuario',
        as: 'user',
      });
      this.belongsTo(models.Contacto, {
        foreignKey: 'idContacto',
        as: 'contact',
      });
      this.hasMany(models.Mensaje, {
        foreignKey: 'idParticipante',
        as: 'messages',
      });
    }
  }
  ParticipanteChat.init({
    idContacto: DataTypes.INTEGER,
    idChat: DataTypes.INTEGER,
    idUsuario: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ParticipanteChat',
    tableName: 'ParticipanteChats',
    timestamps: false,
  });
  return ParticipanteChat;
};