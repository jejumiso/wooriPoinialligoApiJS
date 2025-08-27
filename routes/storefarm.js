// routes/storefarm.js
const express = require('express');
const router = express.Router();
const {
    oauthToken,
    getProductOrders
} = require('../handlers/storefarmHandlers');

// 스토어팜 OAuth 토큰 발급
router.post('/oauth/token', oauthToken);

// 스토어팜 상품 주문 조회
router.post('/orders', getProductOrders);

module.exports = router;