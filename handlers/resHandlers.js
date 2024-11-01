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



    // 복호화
    const resultOriFromRes = decryptData(resText, key, iv);

    // 결과물을 JSON 응답으로 반환
    res.json({
        resultResFromOri,
        resultOriFromRes,
        "asdf": 3
    });

};

module.exports = {
    resEncoDeco,

};
