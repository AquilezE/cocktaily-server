const express = require('express');
const router = express.Router();


router.use('/v1/auth', require('./auth'));
router.use('/v1/health', require('./serverHealth'));
//router.use('/v1/usuarios', require('./usuario'));
//router.use('/v1/chats', require('./chat'));
router.use('/v1/cocktails', require('./cocktail'));


module.exports = router;