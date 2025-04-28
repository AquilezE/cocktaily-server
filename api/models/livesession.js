'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LiveSession extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'host',
      });
      this.hasMany(models.ChatMessage, {
        foreignKey: 'session_id',
        as: 'messages',
      });
    }
  }
  LiveSession.init({
    user_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    stream_key: DataTypes.STRING,
    url: DataTypes.STRING,
    started_at: DataTypes.DATE,
    ended_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'LiveSession',
  });
  return LiveSession;
};