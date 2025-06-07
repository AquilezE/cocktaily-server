const express = require('express');
const router = express.Router();
const controller = require('../controllers/stats');
const { Authorize } = require('../middleware/auth.middleware');
const { Sequelize } = require('sequelize');

router.get('/usuarios/mensual', controller.usuariosPorMes);
router.get('/usuarios/por-rol', controller.usuariosPorRol);
router.get('/licores/populares', controller.licoresMasUsados);
router.get('/usuarios/top-creadores', controller.topUsuariosPorRecetas);
router.get('/recetas/mas-likes', controller.recetasConMasLikes);

module.exports = router;
