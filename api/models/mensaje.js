'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mensaje extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      this.belongsTo(models.ParticipanteChat, {
        foreignKey: 'idParticipante',
        as: 'participant',
      });

      this.belongsTo(models.Chat, {
        foreignKey: 'idChat',
        as: 'chat',
      });
      // Si se hace la cosa del arhcivo:
      // this.belongsTo(models.Archivo, {
      //   foreignKey: 'idArchivo',
      //   as: 'attachment',
      // });
    }
  }
  Mensaje.init({
    idParticipante: DataTypes.INTEGER,
    contenido: DataTypes.STRING,
    idChat: DataTypes.INTEGER,
    idArchivo: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Mensaje',
  });
  return Mensaje;
};