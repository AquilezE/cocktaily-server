const express = require("express");
const router = express.Router();
const controller = require("../controllers/user");
const {Authorize} = require('../middleware/auth.middleware');

router.get('/username/:username',Authorize('user,admin'), controller.getByUsername);
router.post('/', controller.create);
router.get('/:id',Authorize('user,admin'),controller.getById);
router.put('/:id',Authorize('user,admin'),controller.update);
router.patch('/:id/change-password',Authorize('user,admin'),controller.changePassword);
router.delete('/:id',Authorize('admin'),controller.remove);
module.exports = router;


