// routes/boot.js
const express = require('express');
const router = express.Router();
const { payments } = require('../handlers/nicePayHandlers');

// 부트페이 관련 API 경로
router.post('/payments', payments);

module.exports = router;
