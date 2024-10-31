// handlers/aligoHandlers.js
const aligoapi = require('aligoapi');
const AuthData = require('../config/auth');

const key = 'E4rqzxa37VCwz7I/enrUy1S/xwH6BR==';
const iv = 'Hkald6&ksl#usk9@';


import { encryptData, decryptData } from '../utils/encryption.js';

const resEncoDeco = (req, res) => {
    const { oriText, resText } = req.body; // req.body에서 ori와 res를 추출
    // 암호화
    const resultResFromOri = encryptData(oriText, key, iv);


    // 복호화
    const resultOriFromRes = decryptData(resText, key, iv);

    // 결과물을 JSON 응답으로 반환
    res.json({
        resultResFromOri,
        resultOriFromRes,
    });

};

module.exports = {
    resEncoDeco,

};
