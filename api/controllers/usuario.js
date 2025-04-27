const { Usuario } = require('../models');

module.exports = {
  async getAll(req, res, next) {
    try {
      const usuarios = await Usuario.findAll();
      res.json(usuarios);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const usuario = await Usuario.findByPk(req.params.id);
      if (!usuario) return res.status(404).json({ error: 'Not found' });
      res.json(usuario);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const newUser = await Usuario.create(req.body);
      res.status(201).json(newUser);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const [updated] = await Usuario.update(req.body, {
        where: { idUsuario: req.params.id }
      });
      if (!updated) return res.status(404).json({ error: 'Not found' });
      const usuario = await Usuario.findByPk(req.params.id);
      res.json(usuario);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const deleted = await Usuario.destroy({
        where: { idUsuario: req.params.id }
      });
      if (!deleted) return res.status(404).json({ error: 'Not found' });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
};
