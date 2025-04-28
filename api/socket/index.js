const {Server} = require('socket.io');
const {
    Chat, 
    ParticianteChat,
    Mensaje, 
    Usuario
} = require('../models');

module.exports = (server) => {
    const io = new Server(server, {
        cors: {origin: '*'}
    });

io.on('connection', socket => {
    console.log(`Socket Connected: ${socket.id}`);

    socket.on('join_chat', ({ chatId }) => {
        socket.join(`chat_${chatId}`);
        console.log(`<-- ${socket.id} left room chat_${chatId}`);
    });

    socket.on('send_message', async ({chatId, userId, contenido}) => {
        const part = await ParticianteChat.findOne({
            where: { idChat: chatId, idUsuario: userId}
        });

    if (!part) return socket.emit('error', 'No participa en este chat');

    const msg = await Mensaje.create({
        idChat: chatId,
        idParticipante: part.idParticipante, contenido
    });

    const payload = {
        idMensaje: msg.idMensaje, chatId,
        contenido: msg.contenido,
        senderId: userId
    };
    io.to(`chat_${chatId}`).emit('new_message', payload);
    
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});
    return io;
};
