const express = require("express");
const router = express.Router();
const controller = require("../controllers/cocktail");

router.post("/", controller.createRecipe);
router.get('/pending',controller.getAllPendingCocktails);
router.get("/:id", controller.getRecipeById);
router.delete("/:id", controller.deleteRecipe);
router.get('/', controller.getAllAcceptedCocktails);
router.patch('/accept/:id', controller.aproveCocktail);
router.patch('/reject/:id', controller.rejectCocktail);

module.exports = router;