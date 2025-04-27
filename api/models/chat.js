'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Usuario, {
        foreignKey: 'idUsuarioCreacion',
        as: 'creator',
      });

      this.hasMany(models.ParticipanteChat, {
        foreignKey: 'idChat',
        as: 'participants',
      });
      this.hasMany(models.Mensaje, {
        foreignKey: 'idChat',
        as: 'messages',
      });
        }
  }
  Chat.init({
    nombre: DataTypes.STRING,
    idTipo: DataTypes.INTEGER,
    tiempoCreacion: DataTypes.DATE,
    idUsuarioCreacion: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Chat',
    tableName: 'Chats',
    timestamps: false,
  });
  return Chat;
};