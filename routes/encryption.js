// routes/boot.js
const express = require('express');
const router = express.Router();
const { resEncoDeco } = require('../handlers/resHandlers');

// 암호화 관련 
router.post('/resEncoDeco', resEncoDeco);

module.exports = router;
