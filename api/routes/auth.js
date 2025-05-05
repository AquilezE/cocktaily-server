const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth');
const {Authorize} = require('../middleware/auth.middleware');



router.post('/login', authCtrl.login);
router.get('/time', Authorize("admin"), authCtrl.tiempoRestanteToken);

module.exports = router;
