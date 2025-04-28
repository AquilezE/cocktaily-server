'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Cocktail, {
        foreignKey: 'user_id',
        as: 'cocktails',
      });
      this.hasMany(models.Comment, {
        foreignKey: 'user_id',
        as: 'comments',
      });
      this.hasMany(models.Like, {
        foreignKey: 'user_id',
        as: 'likes',
      });
      this.hasMany(models.LiveSession, {
        foreignKey: 'user_id',
        as: 'liveSessions',
      });
      this.hasMany(models.ChatMessage, {
        foreignKey: 'user_id',
        as: 'chatMessages',
      });
      this.hasMany(models.Cocktail, {
        foreignKey: 'moderated_by',
        as: 'moderatedCocktails',
      });    
    }
  }
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    profile_picture_path: DataTypes.STRING,
    bio: DataTypes.TEXT,
    role: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};