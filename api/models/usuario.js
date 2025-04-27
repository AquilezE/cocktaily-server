'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      this.hasMany(models.Chat, {
        foreignKey: 'idUsuarioCreacion',
        as: 'chatsCreated',
      });

      this.belongsToMany(models.Contacto, {
        through: models.UsuarioContacto,
        foreignKey: 'idUsuario',
        otherKey: 'idContacto',
        as: 'contacts',
      });

      this.hasMany(models.ParticipanteChat, {
        foreignKey: 'idUsuario',
        as: 'chatParticipations',

      });


    }
  }
  Usuario.init({
    idUsuario: DataTypes.STRING,
    email: DataTypes.STRING,
    fechaNacimiento: DataTypes.DATE,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    fotoPerfil: DataTypes.STRING,
    tiempoCreacion: DataTypes.DATE,
    telefono: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuarios',
    timestamps:false,
  });
  return Usuario;
};