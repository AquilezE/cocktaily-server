const express = require("express");
const router = express.Router();
const likeController = require("../controllers/like");
const { Authorize } = require("../middleware/auth.middleware");

router.post("/:cocktailId", Authorize("user,admin"), likeController.giveLike);
router.delete("/:cocktailId", Authorize("user,admin"), likeController.removeLike);
router.get("/:cocktailId/hasLiked", likeController.hasLiked);

module.exports = router;
