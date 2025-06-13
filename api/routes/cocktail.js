const express = require("express");
const router = express.Router();
const controller = require("../controllers/cocktail");
const {Authorize} = require('../middleware/auth.middleware');

router.post("/", Authorize('user,admin'), controller.createRecipe);
router.get('/pending', Authorize('user,admin'), controller.getAllPendingCocktails);
router.get('/full/:id', Authorize('user,admin'), controller.getFullRecipeById);
router.get("/:id", Authorize('user,admin'), controller.getRecipeById);
router.delete("/:id", Authorize('admin'), controller.deleteRecipe);
router.get('/', Authorize('user,admin'), controller.getAllAcceptedCocktails);
router.patch('/accept/:id', Authorize('admin'), controller.aproveCocktail);
router.patch('/reject/:id', Authorize('admin'), controller.rejectCocktail);

module.exports = router;