// routes/boot.js
const express = require('express');
const router = express.Router();
const { paymentsr } = require('../handlers/nicePayrHandlers');

// 부트페이 관련 API 경로
router.post('/paymentsr', paymentsr);

module.exports = router;
