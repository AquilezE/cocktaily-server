const express = require('express');
const router = express.Router();


router.use('/v1/auth', require('./auth'));
router.use('/v1/usuarios', require('./usuario'));
router.use('/v1/chats', require('./chat'));



module.exports = router;
