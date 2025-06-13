const db = require("../models");
const { Cocktail, CocktailIngredient } = db;
const { Op } = require('sequelize');
const { sendCocktailRejectionEmail, sendCocktailApprovalEmail } = require('../services/mailer');

exports.createRecipe = async (req, res) => {
  const {
    name,
    creation_steps,
    video_url,
    image_url,
    user_id,
    preparation_time,
    is_non_alcoholic,
    alcohol_type,
    ingredients
  } = req.body;

  if (!name || !creation_steps || !video_url || !image_url || !user_id || !preparation_time || typeof is_non_alcoholic === 'undefined' || !Array.isArray(ingredients)) {
    return res.status(400).json({ mensaje: "Por favor llene todos los campos" });
  }

  try {
    const existing = await Cocktail.findOne({
      where: {
        status: 'aceptada',
        [db.Sequelize.Op.and]: db.Sequelize.where(
          db.Sequelize.fn('LOWER', db.Sequelize.col('name')),
          name.toLowerCase()
        )
      }
    });

    if (existing) {
      return res.status(409).json({
        mensaje: "Ya existe una receta aceptada con ese nombre. Por favor utiliza otro nombre."
      });
    }

    const newRecipe = await Cocktail.create({
      name,
      creation_steps,
      video_url,
      image_url,
      preparation_time,
      is_non_alcoholic,
      alcohol_type: is_non_alcoholic ? null : alcohol_type,
      user_id,
      status: "pendiente de revision",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    for (const ing of ingredients) {
      const { name, quantity } = ing;
      if (!name || !quantity) {
        console.warn('Ingrediente invalido:', ing);
        continue;
      }
      let ingredient = await db.Ingredient.findOne({ where: { name } });
      if (!ingredient) {
        ingredient = await db.Ingredient.create({ name });
      }
      await db.CocktailIngredient.create({
        cocktail_id: newRecipe.id,
        ingredient_id: ingredient.id,
        quantity
      });
    }
    
    return res.status(201).json({
      mensaje: "La receta ha sido enviada a revisión por un moderador. Recibirás una notificación con una respuesta tan pronto como sea posible."
    });

  } catch (error) {
    console.error("Error al crear la receta:", error);
    return res.status(500).json({
      mensaje: "No pudimos establecer conexión con el servidor. Por favor intente más tarde."
    });
  }
};

exports.getAllAcceptedCocktails = async (req, res) => {
  try {
    const { alcoholType, name, maxPreparationTime, isNonAlcoholic } = req.query;

    const where = {
      status: 'aceptada'
    };

    if (alcoholType) {
      where.alcohol_type = alcoholType;
    }

    if (typeof isNonAlcoholic !== 'undefined') {
      where.is_non_alcoholic = isNonAlcoholic === 'true';
    }

    if (name) {
      where.name = {
        [Op.like]: `%${name}%`  
      };
    }

    if (maxPreparationTime) {
      where.preparation_time = {
        [db.Sequelize.Op.lte]: parseInt(maxPreparationTime)
      };
    }

    const cocktails = await db.Cocktail.findAll({
      where,
      include: [
        {
          model: db.Ingredient,
          as: 'ingredients',
          through: { attributes: ['quantity'] }
        },
        {
          model: db.Like,
          as: 'likes'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formatted = cocktails.map(cocktail => ({
      id: cocktail.id,
      name: cocktail.name,
      creation_steps: cocktail.creation_steps,
      preparation_time: cocktail.preparation_time,
      is_non_alcoholic: cocktail.is_non_alcoholic,
      alcohol_type: cocktail.alcohol_type,
      video_url: cocktail.video_url,
      image_url: cocktail.image_url,
      created_at: cocktail.created_at,
      updated_at: cocktail.updated_at,
      user_id: cocktail.user_id,
      ingredients: cocktail.ingredients,
      comments: [],
      likes: cocktail.likes?.length ?? 0,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error al obtener cócteles con filtros:", error);
    res.status(500).json({ mensaje: "Errorasdas del servidor" });
  }
};

exports.getRecipeById = async (req, res) => {
  const { id } = req.params;
console.log('GET receta id:', req.params.id);
  try {
    const recipe = await Cocktail.findOne({
      where: {
        id,
        status: 'aceptada'
      },
      include: [
        {
          model: db.User,
          as: 'author',
          attributes: ['id', 'username']
        },
        {
          model: db.Ingredient,
          as: 'ingredients',
          through: {
            attributes: ['quantity']
          }
        },
        {
          model: db.Comment,
          as: 'comments',
          include: {
            model: db.User,
            as: 'author',
            attributes: ['id', 'username', 'profile_picture_path']
          }
        },
        {
          model: db.Like,
          as: 'likes'
        }
      ]
    });

    if (!recipe) {
      return res.status(404).json({ mensaje: 'Receta no encontrada o aún no ha sido aceptada' });
    }

    const likesCount = recipe.likes?.length || 0;

    res.status(200).json({
      id: recipe.id,
      name: recipe.name,
      creation_steps: recipe.creation_steps,
      preparation_time: recipe.preparation_time,
      is_non_alcoholic: recipe.is_non_alcoholic,
      alcohol_type: recipe.alcohol_type,
      video_url: recipe.video_url,
      image_url: recipe.image_url,
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
      author: recipe.author,
      ingredients: recipe.ingredients,
      comments: recipe.comments,
      likes: likesCount
    });
  } catch (error) {
    console.error('Error al recuperar la receta:', error);
    res.status(500).json({ mensaje: 'No fue posible conectarse al servidor. Por favor intente más tarde.' });
  }
};

exports.deleteRecipe = async (req, res) => {
  const { id } = req.params;

  try {
    const recipe = await db.Cocktail.findByPk(id);

    if (!recipe) {
      return res.status(404).json({ mensaje: "La receta no existe" });
    }

    if (recipe.status !== "aceptada") {
      return res.status(400).json({ mensaje: "Solo se pueden eliminar recetas aceptadas" });
    }

    recipe.status = "eliminada";
    await recipe.save();

    return res.status(200).json({ mensaje: "La receta ha sido eliminada correctamente" });

  } catch (error) {
    console.error("Error al eliminar la receta:", error);
    return res.status(500).json({
      mensaje: "No pudimos establecer conexión con el servidor. Por favor intente más tarde."
    });
  }

};

exports.getAllPendingCocktails = async (req, res) => {
    try {
    const cocktails = await db.Cocktail.findAll({
      where: { status: 'pendiente de revision' },
      include: [
        {
          model: db.Ingredient,
          as: 'ingredients',
          through: { attributes: ['quantity'] }
        },
        {
          model: db.Like,
          as: 'likes'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formatted = cocktails.map(cocktail => ({
      id: cocktail.id,
      name: cocktail.name,
      creation_steps: cocktail.creation_steps,
      preparation_time: cocktail.preparation_time,
      is_non_alcoholic: cocktail.is_non_alcoholic,
      alcohol_type: cocktail.alcohol_type,
      video_url: cocktail.video_url,
      image_url: cocktail.image_url,
      created_at: cocktail.created_at,
      updated_at: cocktail.updated_at,
      user_id: cocktail.user_id,
      ingredients: cocktail.ingredients,
      comments: [], 
      likes: cocktail.likes?.length ?? 0,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error al obtener cocteles pendientes:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
}

exports.aproveCocktail = async (req, res) => {
  const { id } = req.params;

  try {
    const cocktail = await db.Cocktail.findByPk(id, {
      include: [{ model: db.User, as: 'author', attributes: ['email'] }]
    });

    if (!cocktail) {
      return res.status(404).json({ mensaje: "La receta no existe" });
    }

    cocktail.status = "aceptada";
    await cocktail.save();

    if (cocktail.author?.email) {
      try {
        await sendCocktailApprovalEmail(cocktail.author.email, cocktail.name);
      } catch (e) {
        console.error("Error enviando correo de aprobación:", e);
      }
    }

    return res.status(200).json({ mensaje: "La receta ha sido aceptada correctamente y se notificó al autor por correo." });

  } catch (error) {
    console.error("Error al aceptar la receta:", error);
    return res.status(500).json({
      mensaje: "No pudimos establecer conexión con el servidor. Por favor intente más tarde."
    });
  }
};

exports.rejectCocktail = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const cocktail = await db.Cocktail.findByPk(id, {
      include: [{
        model: db.User,
        as: 'author',
        attributes: ['email', 'username']
      }]
    });

    if (!cocktail) {
      return res.status(404).json({ mensaje: "La receta no existe" });
    }

    if (!reason || typeof reason !== 'string') {
      return res.status(400).json({ mensaje: "Debes proporcionar un motivo de rechazo válido." });
    }

    cocktail.status = "rechazada";
    await cocktail.save();

    const email = cocktail.author?.email;
    if (email) {
      try {
        await sendCocktailRejectionEmail(email, cocktail.name, reason);
      } catch (e) {
        console.error("Error enviando correo:", e);
      }
    }

    return res.status(200).json({ mensaje: "Receta rechazada y notificada por correo." });

  } catch (error) {
    console.error("Error al rechazar la receta:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

exports.getFullRecipeById = async (req, res) => {
  const { id } = req.params;
  try {
    const recipe = await db.Cocktail.findOne({
      where: { id },
      include: [
        {
          model: db.User,
          as: 'author',
          attributes: ['id', 'username']
        },
        {
          model: db.Ingredient,
          as: 'ingredients',
          through: { attributes: ['quantity'] }
        }
      ]
    });

    if (!recipe) {
      return res.status(404).json({ mensaje: 'Receta no encontrada' });
    }

    return res.status(200).json({
      id: recipe.id,
      name: recipe.name,
      creation_steps: recipe.creation_steps,
      preparation_time: recipe.preparation_time,
      is_non_alcoholic: recipe.is_non_alcoholic,
      alcohol_type: recipe.alcohol_type,
      video_url: recipe.video_url,
      image_url: recipe.image_url,
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
      author: recipe.author,
      ingredients: recipe.ingredients
    });
  } catch (error) {
    console.error("Error al obtener receta completa:", error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};