'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cocktail extends Model {
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
    creation_steps: DataTypes.TEXT,
    preparation_time: DataTypes.INTEGER,
    video_url: DataTypes.STRING,
    image_url: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    is_non_alcoholic: DataTypes.BOOLEAN,
    alcohol_type: DataTypes.STRING,
    status: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    moderated_by: DataTypes.INTEGER,
    moderated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Cocktail',
  });

  return Cocktail;
};