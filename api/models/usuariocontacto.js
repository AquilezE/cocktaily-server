'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsuarioContacto extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Usuario, {
        foreignKey: 'idUsuario',
        as: 'user',
      });
      this.belongsTo(models.Contacto, {
        foreignKey: 'idContacto',
        as: 'contact',
      });
    }
  }
  UsuarioContacto.init({
    idUsuario: DataTypes.INTEGER,
    idContacto: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UsuarioContacto',
    tableName: 'UsuarioContactos',
    timestamps: false,
  });
  return UsuarioContacto;
};