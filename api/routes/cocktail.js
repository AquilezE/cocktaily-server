const express = require("express");
const router = express.Router();
const controller = require("../controllers/cocktail");

router.post("/", controller.createRecipe);
router.get("/:id", controller.getRecipeById);
router.delete("/:id", controller.deleteRecipe);

module.exports = router;
