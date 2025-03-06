// routes/nicepay.js
const express = require('express');
const router = express.Router();
const { responseEndpoint } = require('../handlers/nicepayHandlers');

// 나이스페이 관련 API 경로
router.post('/responseEndpoint', responseEndpoint);
router.get('/responseEndpoint', responseEndpoint);

module.exports = router;
