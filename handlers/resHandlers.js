// handlers/aligoHandlers.js
const aligoapi = require('aligoapi');
const AuthData = require('../config/auth');

const key = 'QRvUJwa5cIubaa9QHLahkizjCNyKfC76';
const iv = 'QU83jDdX2PrZNL7k';


const { encryptData, decryptData } = require('../utils/encryption.js');

const resEncoDeco = (req, res) => {
    const { oriText, resText } = req.body; // req.body에서 ori와 res를 추출
    // 암호화
    const resultResFromOri = encryptData(oriText, key, iv);
    // URL-safe 
    const urlSafeBase64 = resultResFromOri.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // 복호화
    const resultOriFromRes = decryptData(resText, key, iv);



    // 결과물을 JSON 응답으로 반환
    res.json({
        "from_ori": { "base64": resultResFromOri, "base64 URL-safe": urlSafeBase64 },
        "from_res": { "result": resultOriFromRes },
        "asdf": 311123
    });

};

module.exports = {
    resEncoDeco,

};
