const express = require('express');
const router = express.Router();
const chatCtrl = require('../controllers/chat.js')

// POST /api/v1/chats/
router.post('/', chatCtrl.createChat)

// GET /api/v1/chats/
router.get('/', chatCtrl.getChats)

// POST /api/v1/chats/:chatId/participants
router.post('/:chatId/participants', chatCtrl.addParticipant)

// GET /api/v1/chats/:chatId/messages
router.get('/:chatId/messages', chatCtrl.getMessages)

// POST /api/v1/chats/:chatId/messages
router.post('/:chatId/messages', chatCtrl.sendMessage)

module.exports = router;