// routes/smartstore.js
const express = require('express');
const router = express.Router();
const {
    oauthToken,
    getProductOrders,
    dispatchProductOrders
} = require('../handlers/smartstoreHandlers');

// 스마트스토어 OAuth 토큰 발급
router.post('/oauth/token', oauthToken);

// 스마트스토어 상품 주문 조회
router.post('/orders/list', getProductOrders);

// 스마트스토어 상품 주문 발송 처리
router.post('/orders/dispatch', dispatchProductOrders);

module.exports = router;