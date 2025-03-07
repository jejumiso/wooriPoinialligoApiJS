// routes/boot.js
const express = require('express');
const router = express.Router();
const { payments } = require('../handlers/nicePayHandlers');

// 암호화 관련 
router.post('/payments', payments);

module.exports = router;
