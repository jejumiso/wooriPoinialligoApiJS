const CryptoJS = require('crypto-js');
const crypto = require('crypto');


// 암호화 함수
function encryptData(text, key, iv) {

    const encryptionKey = CryptoJS.enc.Utf8.parse(key);
    const encryptionIV = CryptoJS.enc.Utf8.parse(iv);

    const encrypted = CryptoJS.AES.encrypt(text, encryptionKey, {
        iv: encryptionIV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    // URL-safe Base64 변환
    let base64 = encrypted.toString();
    let urlSafeBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return urlSafeBase64;
}

// 복호화 함수
function decryptData(encryptedText, key, iv) {

    const decryptionKey = CryptoJS.enc.Utf8.parse(key);
    const decryptionIV = CryptoJS.enc.Utf8.parse(iv);

    // URL-safe Base64를 일반 Base64로 변환
    let base64 = encryptedText.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
        base64 += '=';
    }
    console.log('base64 : ' + base64)

    try {
        const decrypted = CryptoJS.AES.decrypt(base64, decryptionKey, {
            iv: decryptionIV,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption failed:', error.message);
        return '';
    }
}

module.exports = { encryptData, decryptData };
