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
        idUsuario: newUser.idUsuario,
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
        return res.status(404).json({ error: 'User not found' });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // If you want to return a token later, you can generate JWT here
      res.json({
        message: 'Login successful',
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
