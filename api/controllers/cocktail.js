const db = require("../models");
const { Cocktail, CocktailIngredient } = db;

exports.createRecipe = async (req, res) => {
  const {
    name,
    creation_steps,
    video_url,
    image_url,
    user_id,
    ingredients
  } = req.body;

  if (!name || !creation_steps || !video_url || !image_url || !user_id || !ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ mensaje: "Por favor llene todos los campos" });
  }

  try {
    const newRecipe = await Cocktail.create({
      name,
      creation_steps,
      video_url,
      image_url,
      user_id,
      status: "pendiente de revisión",
      created_at: new Date(),
      updated_at: new Date()
    });

    for (const ing of ingredients) {
      await CocktailIngredient.create({
        cocktail_id: newRecipe.id,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity
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

exports.getRecipeById = async (req, res) => {
  const {
     id
  } = req.params;

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
            attributes: ['id', 'username']
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