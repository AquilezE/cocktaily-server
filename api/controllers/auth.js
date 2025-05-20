const bcrypt = require('bcrypt');
const { User } = require('../models');
const { GenerarToken, TiempoRestanteToken  } = require('../services/jwtoken.service');



let self = {};

self.login = async function (req, res) {
  const { email, password } = req.body;
  
  try{
    let data = await User.findOne({ 
      where: { email }, 
      raw: true 
    });
   
    if (!data) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectas'});
    }

    const passwordMatch = await bcrypt.compare(password, data.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectas'});
    }

    let token = GenerarToken(data.id, data.email, data.username, data.role);

    return res.status(200).json({
      email: data.email,
      username: data.username,
      role: data.role,
      jwt: token,
    });
  }catch (error) {
    return res.status(400).json(
      { message: 'Error al iniciar sesión', error: error.message }
    );
  }
}


self.tiempoRestanteToken = async function (req, res) {
  const tiempoRestanteToken = await TiempoRestanteToken(req);
  if (!tiempoRestanteToken) {
    return res.status(401).json({ message: 'Token no valido'});
  }
  return res.status(200).json({
    minutos: tiempoRestanteToken.minutes,
    segundos: tiempoRestanteToken.seconds
  });
}

module.exports = self;