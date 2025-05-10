let self = {};


self.getHealth = async function (req, res) {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date(),
    };
    return res.status(200).json(health);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener el estado del servidor', error: error.message });
  }
}

module.exports = self;