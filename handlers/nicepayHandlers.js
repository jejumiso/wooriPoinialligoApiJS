

const axios = require('axios');
const base64 = require('base-64');

const NICEPAY_CLIENT_KEY = 'S2_0629e726ec134bb29c25bd776e76955d'; // 나이스페이 클라이언트 키
const NICEPAY_SECRET_KEY = '8d626d6beb4c474f9179556e6de84c44'; // 나이스페이 시크릿 키

exports.handleNicepayWebhook = async (req, res) => {
    try {
        const {
            authResultCode,
            authResultMsg,
            tid,          // 거래 ID
            orderId,      // 주문 ID
            amount,       // 결제 금액
            authToken,    // 인증 토큰
            signature
        } = req.body;

        console.log("🔹 웹훅 수신 데이터:", req.body);

        // ✅ 1. 인증이 성공했는지 확인
        if (authResultCode !== '0000') {
            console.error("❌ 인증 실패:", authResultMsg);
            return res.status(200).send('OK'); // 실패여도 OK 응답 (나이스페이 요구사항)
        }

        // ✅ 2. Base64 인코딩된 Authorization 헤더 생성
        const credentials = `${NICEPAY_CLIENT_KEY}:${NICEPAY_SECRET_KEY}`;
        const encodedCredentials = base64.encode(credentials);

        // ✅ 3. 결제 승인 API 요청 데이터 설정
        const approvalUrl = `https://sandbox-api.nicepay.co.kr/v1/payments/${tid}`;
        const approvalData = { amount: amount };

        // ✅ 4. 나이스페이 결제 승인 API 요청
        const approvalResponse = await axios.post(approvalUrl, approvalData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${encodedCredentials}`
            }
        });

        console.log("✅ 승인 응답:", approvalResponse.data);

        // ✅ 5. 최종 승인 결과 확인 후 응답
        if (approvalResponse.data.resultCode !== '0000') {
            console.error("❌ 승인 실패:", approvalResponse.data);
            return res.status(200).send('OK'); // 실패여도 OK 응답
        }

        console.log("🎉 결제 승인 완료:", approvalResponse.data);

        return res.status(200).send('OK'); // 정상 응답

    } catch (error) {
        console.error('🚨 결제 승인 처리 중 오류:', error);
        return res.status(200).send('OK'); // 오류 발생 시에도 OK 응답
    }
};

// handlers/nicepayHandlers.js
exports.responseEndpoint = async (req, res) => {
    try {
        const response = { message: "OK" }; // 응답 객체 정의

        // 성공적으로 응답 반환
        return res.status(200).send('OK'); // JSON이 아닌 순수 문자열 응답
    } catch (e) {
        console.error('Error processing NicePay request:', e);

        // 에러 응답 반환
        return res.status(500).json({
            message: 'Failed to process NicePay request',
            error: e.message || e,
        });
    }
};




