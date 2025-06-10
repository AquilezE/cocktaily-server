'use strict';

const db = require('../models');
const LiveSession = db.LiveSession;
const randomWords = require('random-words');
const { Cocktail} = require('../models');


exports.createSession = async (req, res) => {
  const { user_id, title } = req.body;
  if (!user_id || !title) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
  }

  try {
    const approvedCount = await Cocktail.count({
      where: {
        user_id: user_id,
        status: 'aceptada'
      }
    });

    if (approvedCount < 5) {
      return res.status(403).json({
        mensaje: 'Debes tener al menos 5 cócteles aceptados para crear una sesión en vivo.'
      });
    }

    const word = randomWords.generate({ exactly: 1, minLength: 5, maxLength: 10 })[0];
    const number = Math.floor(1000 + Math.random() * 9000);
    const stream_key = `${word}${number}`;
    const url = `http://${process.env.TRANSMISION_IP}/live/${stream_key}.m3u8`;

    const session = await LiveSession.create({
      user_id,
      title,
      stream_key,
      url,
      started_at: new Date(),
      ended_at: null,
    });

    return res.status(201).json(session);
  } catch (error) {
    console.error('Error al crear LiveSession:', error);
    return res.status(500).json({ mensaje: 'Error del servidor.' });
  }
};

exports.listSessions = async (req, res) => {
  try {
    const where = {};
    if (req.query.active === 'true') {
      where.ended_at = null;
    }
    const sessions = await LiveSession.findAll({
      where,
      include: [{ model: db.User, as: 'host', attributes: ['id', 'username'] }],
    });

    const plain = sessions.map(s => s.get({ plain: true }));
    console.log('Sessions plain:', plain);
    return res.json({sessions: plain});

  } catch (error) {
    console.error('Error al listar LiveSessions:', error);
    return res.status(500).json({ mensaje: 'Error del servidor.' });
  }
};

exports.getById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }
    
    try {
        const session = await LiveSession.findByPk(id, {
        include: [{ model: db.User, as: 'host', attributes: ['id', 'username'] }],
        });
        if (!session) {
        return res.status(404).json({ mensaje: 'LiveSession no encontrada.' });
        }
        return res.json(session);
    } catch (error) {
        console.error('Error al obtener LiveSession:', error);
        return res.status(500).json({ mensaje: 'Error del servidor.' });
    }
}

exports.update = async (req, res) => {
  const { id } = req.params;
  const { title, ended_at } = req.body;

  if (!id || !title || !ended_at) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
  }

  try {
    const session = await LiveSession.findByPk(id);
    if (!session) {
      return res.status(404).json({ mensaje: 'LiveSession no encontrada.' });
    }

    session.title = title;
    session.ended_at = ended_at;

    await session.save();

    return res.json(session);
  } catch (error) {
    console.error('Error al actualizar LiveSession:', error);
    return res.status(500).json({ mensaje: 'Error del servidor.' });
  }
};
