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
async changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password_hash = newHashedPassword;
    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada correctamente' });

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

      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(409).json({ error: 'El correo ya está en uso' });
      }

      const usernameExists = await User.findOne({ where: { username } });
      if (usernameExists) {
        return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
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
      const userId = req.params.id;
      const { username, email } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (email && email !== user.email) {
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists && emailExists.id !== parseInt(userId)) {
          return res.status(409).json({ error: 'El correo ya está en uso por otro usuario' });
        }
      }

      if (username && username !== user.username) {
        const usernameExists = await User.findOne({ where: { username } });
        if (usernameExists && usernameExists.id !== parseInt(userId)) {
          return res.status(409).json({ error: 'El nombre de usuario ya está en uso por otro usuario' });
        }
      }

      await user.update(req.body);
      res.json(user);

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
