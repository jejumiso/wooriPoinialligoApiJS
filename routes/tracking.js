// routes/tracking.js
// 택배 조회 API 라우트

const express = require('express');
const router = express.Router();
const { trace, getCouriers } = require('../handlers/tracking');

/**
 * 택배 조회
 * POST /api/tracking/trace
 * 
 * Request Body:
 * {
 *   "courierCode": "lotte",  // 택배사 코드
 *   "trackingNumber": "123456789012"  // 송장번호
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "trackingNumber": "123456789012",
 *     "courierCode": "lotte",
 *     "courierName": "롯데택배",
 *     "deliveryStatus": "in_transit",
 *     "deliveryStatusText": "배송중",
 *     "receiverName": "홍길동",
 *     "progresses": [...]
 *   }
 * }
 */
router.post('/trace', trace);

/**
 * 지원 택배사 목록 조회
 * GET /api/tracking/couriers
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "couriers": [
 *       {
 *         "code": "lotte",
 *         "name": "롯데택배",
 *         "method": "scraping"
 *       }
 *     ],
 *     "total": 1
 *   }
 * }
 */
router.get('/couriers', getCouriers);

module.exports = router;