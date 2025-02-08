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

    // Base64 변환 : 암호화 된 encrypted를 문자로 저장하면 자동으로 base64로 변환이 됨.
    let base64 = encrypted.toString();
    return base64;

    // let urlSafeBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    // return urlSafeBase64;
}

// 복호화 함수
function decryptData(encryptedText, key, iv) {

    const decryptionKey = CryptoJS.enc.Utf8.parse(key);
    const decryptionIV = CryptoJS.enc.Utf8.parse(iv);

    // URL-safe Base64를 일반 Base64로 변환하고 끝의 '=' 패딩 제거
    // 암호화 된 문자의 URL-safe화 된것도 같이 사용하기 위해.
    let base64 = encryptedText.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
    // URL-safe Base64를 일반 Base64로 변환 끝

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
