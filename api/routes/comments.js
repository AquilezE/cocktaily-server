const express = require("express");
const router = express.Router();
const controller = require("../controllers/comment");

router.post("/", controller.createComment);
router.get("/cocktail/:id", controller.getCommentsByCocktail);

module.exports = router;