const express = require('express');
const router = express.Router();
const livesessionCtrl = require('../controllers/livesession');
const {Authorize} = require('../middleware/auth.middleware');


router.post('/', livesessionCtrl.createSession);
router.get('/', livesessionCtrl.listSessions);
//router.get('/:id', livesessionCtrl.getById);
router.put('/:id', livesessionCtrl.update);
//router.delete('/:id', livesessionCtrl.delete);

module.exports = router;
