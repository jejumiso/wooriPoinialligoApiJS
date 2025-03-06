// routes/boot.js
const express = require('express');
const router = express.Router();
const { responseEndpoint } = require('../handlers/nicepayHandlers');

// 부트페이 관련 API 경로
router.post('/responseEndpoint', responseEndpoint);
router.get('/responseEndpointget', responseEndpoint);

module.exports = router;


//http://kakakoalligoapi.cafe24app.com/api/nicepay/responseEndpoint