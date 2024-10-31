const CryptoJS = require('crypto-js');

// 암호화 함수
function encryptData(text, key, iv) {
    const encryptionKey = CryptoJS.enc.Utf8.parse(key);
    const encryptionIV = CryptoJS.enc.Utf8.parse(iv);

    const encrypted = CryptoJS.AES.encrypt(text, encryptionKey, {
        iv: encryptionIV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
}

// 복호화 함수
function decryptData(encryptedText, key, iv) {
    const decryptionKey = CryptoJS.enc.Utf8.parse(key);
    const decryptionIV = CryptoJS.enc.Utf8.parse(iv);

    const decrypted = CryptoJS.AES.decrypt(encryptedText, decryptionKey, {
        iv: decryptionIV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
}

// 모듈 내보내기
module.exports = { encryptData, decryptData };
