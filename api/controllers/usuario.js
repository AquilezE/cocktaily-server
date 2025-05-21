const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = {
  async getAll(req, res, next) {
    try {
      const usuarios = await User.findAll();
      res.json(usuarios);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const usuario = await User.findByPk(req.params.id);
      if (!usuario) return res.status(404).json({ error: 'Not found' });
      res.json(usuario);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { username, email, password, profile_picture_path, bio, role } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Password es requerido' });
      }
      const password_hash = await bcrypt.hash(password, 10);
      
      const newUser = await User.create({
        username,
        email,
        password_hash,
        profile_picture_path,
        bio,
        role
      });
      const userResponse = { ...newUser.toJSON() };
      delete userResponse.password_hash;

      res.status(201).json(userResponse);
    } catch (err) {
      next(err);
    }
  },
  

  async getByUsername(req, res, next) {
    try {
      const usuario = await User.findOne({
        where: { username: req.params.username }
      });
      if (!usuario) return res.status(404).json({ error: 'Not found' });
      res.json(usuario);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const [updated] = await User.update(req.body, {
        where: { id: req.params.id }
      });
      if (!updated) return res.status(404).json({ error: 'Not found' });
      const usuario = await User.findByPk(req.params.id);
      res.json(usuario);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const deleted = await User.destroy({
        where: { idUsuario: req.params.id }
      });
      if (!deleted) return res.status(404).json({ error: 'Not found' });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  
};
