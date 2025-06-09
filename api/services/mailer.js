const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationCode(email, code) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Código de verificación',
    text: `Tu código de verificación es: ${code}`,
  });
}

async function sendCocktailApprovalEmail(email, cocktailName) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `¡Tu receta "${cocktailName}" ha sido aprobada!`,
    text: `¡Felicidades!

Tu receta "${cocktailName}" ha sido revisada por nuestro equipo de moderadores y ha sido **aprobada** exitosamente.

Ya está disponible públicamente en la aplicación y otros usuarios pueden verla, comentarla y darle like.

Gracias por compartir tu creatividad con la comunidad de coctelería. ¡Sigue creando más deliciosas recetas!

🥂 El equipo de CoctelesApp
`,
  });
}


async function sendCocktailRejectionEmail(email, cocktailName, reason) {
  const reglas = `
Reglas básicas para que tu cóctel sea aprobado:

• El nombre del cóctel debe ser claro y específico.
• Debes subir una imagen representativa del cóctel.
• Debes subir un video de preparación válido.
• Los pasos de preparación deben estar escritos correctamente.
• El tiempo de preparación debe ser un número válido.
• Agrega al menos 1 ingrediente con nombre y cantidad.

🚫 No se permite:
• Contenido ofensivo, vulgar o inapropiado.
• Imágenes copiadas de internet sin contexto.
• Nombres o pasos ambiguos.
• Repetir recetas que ya existen en el sistema.

Te sugerimos revisar y corregir tu receta antes de volver a enviarla.
`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Tu receta "${cocktailName}" fue rechazada`,
    text: `Hola,

Tu receta "${cocktailName}" ha sido rechazada por el siguiente motivo:

"${reason}"

${reglas}

Gracias por formar parte de nuestra comunidad de coctelería.
`,
  });
}

module.exports = {
  sendVerificationCode,
  sendCocktailRejectionEmail,
  sendCocktailApprovalEmail
};