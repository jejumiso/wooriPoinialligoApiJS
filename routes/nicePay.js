// routes/boot.js
const express = require('express');
const router = express.Router();
const { nicepayWebhook,subscribeRegist,subscribeBilling } = require('../handlers/nicePayHandlers');

router.post('/nicepayWebhook', nicepayWebhook);
router.post('/subscribeRegist', subscribeRegist);
router.post('/subscribeBilling', subscribeBilling);

module.exports = router;
