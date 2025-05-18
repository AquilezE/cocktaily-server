const db = require("../models");
const LiveSession = db.LiveSession;
const ChatMessage = db.ChatMessage;
const socketIo = require('socket.io');

module.exports = function attachSocket(server) {
  const io = socketIo(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('join', (streamKey) => {
      socket.join(streamKey);
      console.log(`Socket ${socket.id} se unió a ${streamKey}`);
    });

    socket.on('message', async ({ channel, text, user }) => {
      try {
        const session = await LiveSession.findOne({
          where: { stream_key: channel }
        });
        if (!session) {
          console.warn(`LiveSession no encontrada para key=${channel}`);
          return;
        }

        const chat = await ChatMessage.create({
          session_id: session.id,
          user_id:      user.id,      
          message:      text,
          created_at:   new Date(),
        });

        const payload = {
          id:        chat.id,
          user:      { id: user.id, username: user.username },
          text:      chat.message,
          timestamp: chat.created_at,
        };

        io.to(channel).emit(`message:${channel}`, payload);

      } catch (err) {
        console.error('Error procesando mensaje:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  return io;
};
