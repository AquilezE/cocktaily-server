const express = require("express");
const router = express.Router();
const controller = require("../controllers/usuario");

router.get('/username/:username', controller.getByUsername);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
module.exports = router;