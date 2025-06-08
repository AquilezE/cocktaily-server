const express = require("express");
const router = express.Router();
const controller = require("../controllers/verificationCode");

router.post('/send', controller.sendCode);
router.post('/verify', controller.verifyCode);

module.exports = router;
