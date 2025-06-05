const express = require("express");
const router = express.Router();
const controller = require("../controllers/usuario");
const {Authorize} = require('../middleware/auth.middleware');

router.get('/username/:username', controller.getByUsername);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
//router.post('/:id/change-password',Authorize('user,admin'),controller.changePassword);
router.patch('/:id/change-password',controller.changePassword);
router.delete('/:id', controller.remove);
module.exports = router;


