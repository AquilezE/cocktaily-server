const db = require("../models");
const { Like } = db;

exports.giveLike = async (req, res) => {
  const cocktailId = req.params.cocktailId;
  const userId = req.user?.id;

  console.log("🧪 userId recibido:", userId);
  console.log("🧪 cocktailId recibido:", cocktailId);

  if (!userId) {
    return res.status(401).json({ message: "No autorizado: usuario no identificado" });
  }

  try {
    const existing = await Like.findOne({
      where: { cocktail_id: cocktailId, user_id: userId },
    });

    console.log("🧪 Resultado de búsqueda existing like:", existing);

    if (existing) {
      return res.status(409).json({ message: "Ya diste like" });
    }

    const newLike = await Like.create({
      user_id: userId,
      cocktail_id: cocktailId,
      created_at: new Date(),
    });

    console.log("✅ Like insertado:", newLike);

    return res.status(201).json({ message: "Like registrado correctamente" });
  } catch (error) {
    console.error("❌ Error al registrar like:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


exports.removeLike = async (req, res) => {
  const cocktailId = req.params.cocktailId;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "No autorizado: usuario no identificado" });
  }

  try {
    const deleted = await Like.destroy({
      where: { cocktail_id: cocktailId, user_id: userId },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Like no encontrado" });
    }

    res.status(200).json({ message: "Like eliminado correctamente" });
  } catch (error) {
    console.error("Error al quitar like:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.hasLiked = async (req, res) => {
  const cocktailId = req.params.cocktailId;
  const userId = parseInt(req.query.userId);

  if (!userId) {
    return res.status(400).json({ message: "Parámetro userId requerido" });
  }

  try {
    const existing = await Like.findOne({
      where: { cocktail_id: cocktailId, user_id: userId },
    });

    res.status(200).json({ hasLiked: !!existing });
  } catch (error) {
    console.error("Error al verificar like:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
