const { VerificationRequest } = require('../models');
const { sendVerificationCode } = require('../services/mailer');
const crypto = require('crypto');

async function sendCode(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email es requerido' });
  }

  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 
  await VerificationRequest.upsert({ email, code, expiresAt });
  await sendVerificationCode(email, code);

  res.status(200).json({ message: 'Código enviado al correo' });
}

async function verifyCode(req, res) {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email y código son requeridos' });
  }

  const request = await VerificationRequest.findOne({ where: { email } });

  if (!request || request.code !== code || new Date() > request.expiresAt) {
    return res.status(400).json({ error: 'Código inválido o expirado' });
  }

  await request.destroy(); 

  res.status(200).json({ message: 'Correo verificado correctamente' });
}

module.exports = {
  sendCode,
  verifyCode
};
