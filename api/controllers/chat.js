const {Chat, ParticipanteChat, Mensaje, Usuario, Contacto} = require('../models');
const chat = require('../models/chat');

module.exports = {

    
    async createChat(req, res, next){
    
        try{
            const chat = await Chat.create(req.body);
            res.status(201).json(chat);
        }catch(err){
            next(err)
        }

    },

    async getChats(req, res, next){
        try{

            const idUsuario = req.body.idUsuario;
        
            const chats = await Chat.findAll({
                include: {
                    model: ParticipanteChat,
                    where: {
                        idUsuario: {idUsuario},
                    },
                },
            });

            res.json(chats)
        }catch(err){
            next(err)
        }
    },

    async getMessages(req, res, next){

        try{
            const idChat = req.body.idChat;

            const messages = await Mensaje.findAll({
                where: { idChat: {idChat} },
                include: [{
                    model: ParticipanteChat,
                    as: 'participante',
                    include: [
                        {
                            model: Usuario,
                            as: 'usuario',
                            attributes: ['idUsuario', 'username']
                        },
                        {
                            model: Contacto,
                            as: 'contacto',
                            attributes: ['alias']
                        }
                    ]
                }],
                order: [['idMensaje', 'ASC']]
            });

        const payload = messages.map(msg => {
            const p = msg.participant;

            const displayName = p.contacto && p.contacto.alias
            ? p.contacto.alias
            : p.usuario.username;

            return {
                idMensaje: msg.idMensaje,
                contenido: msg.contenido,
                senderName: displayName,
            }

        })

        res.json(payload);

        }catch(err){
            next(err);
        }
    },

    async addParticipant(req, res, next){

            try {
                
                const chatId    = parseInt(req.params.chatId, 10);
                const { idUsuario } = req.body;
          
                const chat = await Chat.findByPk(chatId);
                if (!chat) {
                  return res.status(404).json({ error: 'Chat not found' });
                }
          
                const participante = await ParticipanteChat.create({
                  idChat:    chatId,
                  idUsuario: idUsuario
                });
          
                return res.status(201).json({
                  idParticipante: participante.idParticipante
                });

        }catch(err){
            next(err);
        }
    }
}
