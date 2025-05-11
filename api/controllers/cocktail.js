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