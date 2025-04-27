'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contacto extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
      this.belongsToMany(models.Usuario, {
        through: models.UsuarioContacto,
        foreignKey: 'idContacto',
        otherKey: 'idUsuario',
        as: 'owners',
      });

      this.hasMany(models.ParticipanteChat, {
        foreignKey: 'idContacto',
        as: 'chatParticipations',
      });
    }
  }
  Contacto.init({
    nombre: DataTypes.STRING,
    alias: DataTypes.STRING,
    idEstatus: DataTypes.INTEGER,
    tiempoCreacion: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Contacto',
    tableName: 'Contactos',
    timestamps: false,
  });
  return Contacto;
};