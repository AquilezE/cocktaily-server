const express = require('express');
const router = express.Router();
const controller = require('../controllers/stats');
const { Authorize } = require('../middleware/auth.middleware');
const { Sequelize } = require('sequelize');

router.get('/users/month',controller.usuariosPorMes);
router.get('/users/per-rol',controller.usuariosPorRol);
router.get('/liquors/popular',controller.licoresMasUsados);
router.get('/users/top-creators', controller.topUsuariosPorRecetas);
router.get('/recipe/likes',controller.recetasConMasLikes);

module.exports = router;