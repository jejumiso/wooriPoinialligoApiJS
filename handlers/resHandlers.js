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
    // 1. base64 인코딩
    const base64Encoded = Buffer.from(resultResFromOri).toString('base64');
    // 2. URL에 안전하게 포함하기 위해 encodeURIComponent 적용
    const encodeURIResIdCompany = encodeURIComponent(base64Encoded);




    // 복호화
    const resultOriFromRes = decryptData(resText, key, iv);

    // 결과물을 JSON 응답으로 반환
    res.json({
        "from_ori": { "result_res": resultResFromOri, "result_url": encodeURIResIdCompany },
        "from_res": { "result": resultOriFromRes },
        "asdf": 311123
    });

};

module.exports = {
    resEncoDeco,

};
