// routes/boot.js
const express = require('express');
const router = express.Router();
const { requestUserToken,cancel } = require('../handlers/bootpayHandlers');

// 부트페이 관련 API 경로
router.post('/requestUserToken', requestUserToken);
router.post('/cancel', cancel);

module.exports = router;
