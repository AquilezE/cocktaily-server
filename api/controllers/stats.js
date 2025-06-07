
const { Sequelize } = require('sequelize');
const { User, Cocktail, Like } = require('../models');

const usuariosPorMes = async (req, res) => {
  try {
    const result = await User.findAll({
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'mes'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
      ],
      group: ['mes'],
      order: [['mes', 'ASC']]
    });
    res.json(result);
  } catch (error) {
    console.error('Error en usuariosPorMes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const usuariosPorRol = async (req, res) => {
  try {
    const result = await User.findAll({
      attributes: [
        'role',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
      ],
      group: ['role']
    });
    res.json(result);
  } catch (error) {
    console.error('Error en usuariosPorRol:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
const topUsuariosPorRecetas = async (req, res) => {
  try {
    const data = await Cocktail.findAll({
      attributes: [
        'user_id',
        [Sequelize.fn('COUNT', Sequelize.col('Cocktail.id')), 'recetas_creadas']
      ],
      where: { status: 'aceptada' },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username']
      }],
      group: ['user_id', 'author.id', 'author.username'],
      order: [[Sequelize.literal('recetas_creadas'), 'DESC']],
      limit: 10
    });

    res.json(data);
  } catch (error) {
    console.error('Error en topUsuariosPorRecetas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de usuarios más activos.' });
  }
};

const licoresMasUsados = async (req, res) => {
  try {
    const result = await Cocktail.findAll({
      attributes: [
        'alcohol_type',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
      ],
      where: {
        alcohol_type: {
          [Sequelize.Op.ne]: null 
        }
      },
      group: ['alcohol_type'],
      order: [[Sequelize.literal('total'), 'DESC']],
      raw: true
    });
    res.json(result);
  } catch (error) {
    console.error('Error en licoresMasUsados:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
const recetasConMasLikes = async (req, res) => {
  try {
    const result = await Cocktail.findAll({
      attributes: [
        'id',
        'name',
        'user_id',
        [Sequelize.fn('COUNT', Sequelize.col('likes.id')), 'total_likes']
      ],
      include: [
        {
          model: Like,
          as: 'likes',
          attributes: []
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }
      ],
      where: {
        status: 'aceptada'
      },
      group: ['Cocktail.id', 'author.id', 'author.username', 'Cocktail.user_id'],
      order: [[Sequelize.literal('total_likes'), 'DESC']],
      limit: 3,
      raw: true,
      subQuery: false
    });

    res.json(result);
  } catch (error) {
    console.error('Error en recetasConMasLikes:', error);
    res.status(500).json({ message: 'Error al obtener recetas con más likes.' });
  }
};


module.exports = {
  usuariosPorMes,
  usuariosPorRol,
  licoresMasUsados,
  topUsuariosPorRecetas,
  recetasConMasLikes
};
