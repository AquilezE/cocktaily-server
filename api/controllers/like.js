const db = require("../models");
const admin = require('firebase-admin');                
const { User, Cocktail, DeviceRegistration, Like } = require('../models');
const { getMessaging } = require('firebase-admin/messaging');

exports.giveLike = async (req, res) => {
  const cocktailId = req.params.cocktailId;
  const userId     = req.user?.id;
  const likerName  = req.user?.username;

  if (!userId) {
    return res.status(401).json({ message: "No autorizado: usuario no identificado" });
  }

  try {
    const existing = await Like.findOne({
      where: { cocktail_id: cocktailId, user_id: userId },
    });
    if (existing) {
      return res.status(409).json({ message: "Ya diste like" });
    }

    const cocktail = await Cocktail.findByPk(cocktailId, {
      attributes: ['id', 'name', 'user_id'],
    });
    if (!cocktail) {
      return res.status(404).json({ message: "Cóctel no encontrado" });
    }

    await Like.create({
      user_id:     userId,
      cocktail_id: cocktailId,
      created_at:  new Date(),
    });

    const author = await User.findByPk(cocktail.user_id, {
      attributes: ['id', 'username'],
    });
    if (!author) {
      return res.status(201).json({
        message: "Like registrado, pero no se pudo notificar al autor",
      });
    }


    const regs = await DeviceRegistration.findAll({
      where:      { user_id: author.id },
      attributes: ['registration_token'],
    });
    const tokens = regs
      .map(r => r.registration_token)
      .filter(t => typeof t === 'string' && t.length);

    if (tokens.length > 0) {
      try {
        const multicastMsg = {
          tokens,
          notification: {
            title: "¡Nuevo Like!",
            body:  `${likerName} le dio like a tu cóctel: ${cocktail.name}`,
          },
          data: { cocktailId: String(cocktailId) },
        };
        const response = await getMessaging().sendEachForMulticast(multicastMsg);

        console.log(`${response.successCount}/${tokens.length} notificaciones enviadas a ${tokens}`);
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              console.warn(`Token ${tokens[idx]}: ${resp.error.code}`);
            }
          });
        }
      } catch (err) {
        console.error("Error al enviar notificaciones multicast:", err);
      }
    } else {
      console.log("El autor no tiene tokens registrados; no se envió notificación.");
    }

    return res.status(201).json({ message: "Like registrado correctamente" });

  } catch (error) {
    console.error("❌ Error al registrar like:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
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
