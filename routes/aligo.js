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
    kakaoCancel,
    friendTalkSend
} = require('../handlers/aligoHandlers');

const {
    resEncoDeco
} = require('../handlers/resHandlers');
const { requestUserToken } = require('../handlers/bootpayHandlers');

// API 경로와 핸들러 함수 연결
router.post('/profileAuth', profileAuth);
router.post('/profileCategory', profileCategory);
router.post('/profileAdd', profileAdd);
router.post('/friendList', friendList);
router.post('/templateList', templateList);
router.post('/templateAdd', templateAdd);
router.post('/templateModify', templateModify);
router.post('/templateDel', templateDel);
router.post('/templateRequest', templateRequest);
router.post('/alimtalkSend', alimtalkSend);
router.post('/friendTalkSend', friendTalkSend);
router.post('/historyList', historyList);
router.post('/historyDetail', historyDetail);
router.post('/kakaoRemain', kakaoRemain);
router.post('/kakaoCancel', kakaoCancel);

router.post('/resEncoDeco', resEncoDeco);

router.post('/requestUserToken', requestUserToken);

module.exports = router;
