const express = require("express");
const router = express.Router();
const controller = require("../controllers/comment");
const {Authorize} = require('../middleware/auth.middleware');

router.post("/", Authorize('user,admin'), controller.createComment);
router.get("/cocktail/:id", Authorize('user,admin'), controller.getCommentsByCocktail);

module.exports = router;