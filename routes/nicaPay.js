// routes/nicepay.js
const express = require('express');
const router = express.Router();
const { responseEndpoint, handleNicepayWebhook, payments } = require('../handlers/nicePayHandlers');

// 나이스페이 관련 API 경로
router.post('/responseEndpoint', responseEndpoint);
router.get('/responseEndpoint', responseEndpoint);
router.post('/nicepayWebhook', handleNicepayWebhook);
router.post('/payments', payments);

module.exports = router;
