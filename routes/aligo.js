// routes/aligo.js
const express = require('express');
const router = express.Router();
const {
    profileCategory,
    profileAuth,
    profileAdd,
    templateList,
    templateAdd,
    templateModify,
    templateDel,
    alimtalkSend
} = require('../handlers/aligoHandlers');

// API 경로와 핸들러 함수 연결
router.get('/profileCategory', profileCategory);
router.post('/profileAuth', profileAuth);
router.post('/profileAdd', profileAdd);
router.get('/templateList', templateList);
router.post('/templateAdd', templateAdd);
router.post('/templateModify', templateModify);
router.post('/templateDel', templateDel);
router.post('/alimtalkSend', alimtalkSend);

module.exports = router;
