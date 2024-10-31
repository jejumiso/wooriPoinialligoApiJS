// routes/aligo.js
const express = require('express');
const router = express.Router();
const {
    profileAuth,
    profileCategory,
    profileAdd,
    friendList,
    templateList,
    templateAdd,
    templateModify,
    templateDel,
    templateRequest,
    alimtalkSend,
    historyList,
    historyDetail,
    kakaoRemain,
    kakaoCancel
} = require('../handlers/aligoHandlers');

// API 경로와 핸들러 함수 연결
router.post('/profileAuth', profileAuth);
router.get('/profileCategory', profileCategory);
router.post('/profileAdd', profileAdd);
router.get('/friendList', friendList);
router.get('/templateList', templateList);
router.post('/templateAdd', templateAdd);
router.post('/templateModify', templateModify);
router.post('/templateDel', templateDel);
router.post('/templateRequest', templateRequest);
router.post('/alimtalkSend', alimtalkSend);
router.get('/historyList', historyList);
router.get('/historyDetail', historyDetail);
router.get('/kakaoRemain', kakaoRemain);
router.post('/kakaoCancel', kakaoCancel);

module.exports = router;
