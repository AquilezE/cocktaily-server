'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CocktailIngredient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Cocktail, {
        foreignKey: 'cocktail_id',
        as: 'cocktail',
      });
      this.belongsTo(models.Ingredient, {
        foreignKey: 'ingredient_id',
        as: 'ingredient',
      });
    }
  }
  CocktailIngredient.init({
    cocktail_id: DataTypes.INTEGER,
    ingredient_id: DataTypes.INTEGER,
    quantity: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CocktailIngredient',
  });
  return CocktailIngredient;
};