const bcrypt = require('bcrypt');
const { Usuario } = require('../models');

module.exports = {
  async signup(req, res, next) {
    try {
      const { username, email, password, telefono, fechaNacimiento } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      
      const newUser = await Usuario.create({
        username,
        email,
        password: hashedPassword,
        telefono,
        fechaNacimiento
      });

      res.status(201).json({
        idUsuario: newUser.id,
        username: newUser.username,
        email: newUser.email
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await Usuario.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Nel' });
      }

      //JWT luego pa
      res.json({
        message: 'Login hecho',
        user: {
          idUsuario: user.idUsuario,
          username: user.username,
          email: user.email
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
