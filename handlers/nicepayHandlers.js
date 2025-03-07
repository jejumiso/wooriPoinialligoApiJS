

const axios = require('axios');
const base64 = require('base-64');

const NICEPAY_CLIENT_KEY = 'S1_48f2486344c54b3f95abd8b7b935f6ce'; // 나이스페이 클라이언트 키
const NICEPAY_SECRET_KEY = '652ebd75503346adb1a85307364edad7'; // 나이스페이 시크릿 키

const getKoreanTime = () => {
    return new Date().toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // 24시간 형식 유지
    }).replace('.', '월').replace('.', '일').replace(':', '시').trim() + '분';
};

exports.handleNicepayWebhook = async (req, res) => {
    console.log("🔹 나이스페이 결제 완료 응답:", req.body);

    // ✅ 요청에서 동적으로 현재 실행 중인 `Host` 가져오기
    const host = req.get('Host'); // 예: "localhost:54760" 또는 "kakakoalligoapi.cafe24app.com"

    if (!host) {
        return res.status(400).send("Invalid Host");
    }

    const redirectUrl = `http://${host}/web/b.html?success=true`;

    console.log(`✅ Redirecting to: ${redirectUrl}`);

    // ✅ WebView가 자동으로 `b.html`로 이동하도록 `302 Redirect` 응답
    return res.redirect(302, redirectUrl);
};




exports.handleNicepayWebhook2 = async (req, res) => {
    try {
        const {
            authResultCode,
            authResultMsg,
            tid,
            orderId,
            amount,
            authToken,
            signature
        } = req.body;

        console.log(`[${getKoreanTime()}] 🔹 웹훅 수신 데이터:`, req.body);


        // ✅ 1. 인증 성공 여부 확인
        if (authResultCode !== '0000') {
            console.error("❌ 인증 실패:", authResultMsg);
            return res.status(200).send('OK'); // 실패해도 OK 응답
        }

        // ✅ 2. Base64 인코딩된 Authorization 헤더 생성 (Node.js 기본 Buffer 사용)
        const credentials = `${NICEPAY_CLIENT_KEY}:${NICEPAY_SECRET_KEY}`;
        const encodedCredentials = Buffer.from(credentials).toString('base64');

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

        // ✅ 5. 승인 결과 확인 후 응답
        if (approvalResponse.data.resultCode !== '0000') {
            console.error("❌ 승인 실패:", approvalResponse.data);
            return res.status(200).send('OK'); // 실패해도 OK 응답
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




