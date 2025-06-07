const db = require('../models');
const { Comment, User } = db;

exports.createComment = async (req, res) => {
  const { user_id, cocktail_id, text } = req.body;

  if (!user_id || !cocktail_id || !text) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  try {
    const nuevoComentario = await Comment.create({
      user_id,
      cocktail_id,
      text,
      created_at: new Date()
    });

    return res.status(201).json(nuevoComentario);
  } catch (error) {
    console.error("Error al crear comentario:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

exports.getCommentsByCocktail = async (req, res) => {
  const { id } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { cocktail_id: id },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_picture_path']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json(comments);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};