// routes/storefarm.js
const express = require('express');
const router = express.Router();
const {
    oauthToken,
    getProductOrders,
    dispatchProductOrders
} = require('../handlers/storefarmHandlers');

// 스토어팜 OAuth 토큰 발급
router.post('/oauth/token', oauthToken);

// 스토어팜 상품 주문 조회
router.post('/orders', getProductOrders);

// 스토어팜 상품 주문 발송 처리
router.post('/dispatch', dispatchProductOrders);

module.exports = router;