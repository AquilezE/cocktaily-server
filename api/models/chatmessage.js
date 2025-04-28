'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      this.belongsTo(models.LiveSession, {
        foreignKey: 'session_id',
        as: 'session',
      });
    }
  }
  ChatMessage.init({
    session_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    created_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ChatMessage',
  });
  return ChatMessage;
};