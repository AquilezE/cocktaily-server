const express = require("express");
const router = express.Router();
const controller = require("../controllers/devices");
const { Authorize } = require("../middleware/auth.middleware");

router.post("/", Authorize('admin,user'),controller.registerDevice);
router.delete("/:deviceId", Authorize('admin,user'), controller.unregisterDevice);



module.exports = router;