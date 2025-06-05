const express = require('express');
const router = express.Router();


router.use('/v1/auth', require('./auth'));
router.use('/v1/health', require('./serverHealth'));
router.use('/v1/usuarios', require('./user'));
//router.use('/v1/chats', require('./chat'));
router.use('/v1/cocktails', require('./cocktail'));
router.use('/v1/livesession', require('./livesession'));
router.use('/v1/upload', require('./upload'));
router.use('/v1/likes', require('./like'));
router.use('/v1/devices', require('./devices'));
router.use('/v1/verification', require('./vetification'));


module.exports = router;