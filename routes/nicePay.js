// routes/nicePay.js
const express = require('express');
const router = express.Router();
const { payments } = require('../handlers/nicePayHandlers');

router.post('/payments', payments);

module.exports = router;
