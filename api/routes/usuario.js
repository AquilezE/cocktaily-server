const express = require('express');
const router = express.Router();
const usuarioCtrl = require('../controllers/usuario');


// GET /api/v1/usuarios
router.get('/', usuarioCtrl.getAll);

// GET /api/v1/usuarios/:id
router.get('/:id', usuarioCtrl.getById);

// POST /api/v1/usuarios
router.post('/', usuarioCtrl.create);

// PUT /api/v1/usuarios/:id
router.put('/:id', usuarioCtrl.update);

// DELETE /api/v1/usuarios/:id
router.delete('/:id', usuarioCtrl.remove);

module.exports = router;
