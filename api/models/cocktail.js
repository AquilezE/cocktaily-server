'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cocktail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'author',
      });
      this.belongsTo(models.User, {
        foreignKey: 'moderated_by',
        as: 'moderator',
      });
      this.hasMany(models.Comment, {
        foreignKey: 'cocktail_id',
        as: 'comments',
      });
      this.hasMany(models.Like, {
        foreignKey: 'cocktail_id',
        as: 'likes',
      });
      this.belongsToMany(models.Ingredient, {
        through: models.CocktailIngredient,
        foreignKey: 'cocktail_id',
        otherKey: 'ingredient_id',
        as: 'ingredients',
      });

    }
  }
  Cocktail.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    video_url: DataTypes.STRING,
    status: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    user_id: DataTypes.INTEGER,
    moderated_by: DataTypes.INTEGER,
    moderated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Cocktail',
  });
  return Cocktail;
};