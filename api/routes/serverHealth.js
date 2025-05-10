const express = require('express');
const router = express.Router();
const healthCtrl = require('../controllers/serverHealth');
const {Authorize} = require('../middleware/auth.middleware');



router.get('/', healthCtrl.getHealth);

module.exports = router;
