const express = require('express');
const {authMiddleware} = require('../middleware/authMiddleware');

const message_controller_api = require('../controller/chat_controller/Message.cotroller.api');

const router = express.Router();

// No Auth follow Routes

// Auth follow Routes
router.use(authMiddleware)

router.post("/send-message", message_controller_api.sendMessage);

module.exports = router;