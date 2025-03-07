

const axios = require('axios');
const base64 = require('base-64');



exports.payments = async (req, res) => {
    try {
        const { amount, encodedCredentials, tid } = req.body;

        // ✅ 필수 데이터 검증
        if (!amount || !encodedCredentials || !tid) {
            return res.status(400).json({ error: "필수 데이터가 누락되었습니다." });
        }

        console.log("🔹 [카페24] 나이스페이 최종 승인 요청 수신:", { amount, tid });

        // ✅ 나이스페이 최종 승인 API 요청 설정
        const nicePayApprovalUrl = `https://sandbox-api.nicepay.co.kr/v1/payments/${tid}`;
        const approvalData = { amount: amount };

        // ✅ Authorization 헤더 검증 (Base64 형식인지 체크)
        if (!encodedCredentials.includes(":")) {
            console.warn("⚠️ [카페24] 잘못된 Authorization 형식 감지");
        }

        // ✅ 나이스페이 승인 요청
        const response = await axios.post(nicePayApprovalUrl, approvalData, {
            headers: {
                Authorization: `Basic ${encodedCredentials}`,
                "Content-Type": 'application/json',
            }
        });

        console.log("✅ [카페24] 나이스페이 최종 승인 응답:", response.data);

        return res.json({ success: true, data: response.data });

    } catch (error) {
        console.error("❌ [카페24] 나이스페이 최종 승인 오류:");
        if (error.response) {
            console.error("🔴 응답 데이터:", error.response.data);
            console.error("🔴 응답 상태 코드:", error.response.status);
        } else {
            console.error("🔴 네트워크 오류 또는 요청 실패:", error.message);
        }
        return res.status(500).json({
            error: "결제 승인 중 오류 발생",
            details: error.response?.data || error.message
        });
    }
};






const NICEPAY_CLIENT_KEY_SERVE = 'S2_4a5d3f109c084c85b2fa26f2deb02094'; // 나이스페이 클라이언트 키
const NICEPAY_SECRET_KEY = '2421b138db2441a99bf13f8d6314588b'; // 나이스페이 시크릿 키




//이아래 필요 없다 지우자..



const getKoreanTime = () => {
    return new Date().toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // 24시간 형식 유지
    }).replace('.', '월').replace('.', '일').replace(':', '시').trim() + '분';
};


// ✅ returnUrl에서 현재 실행 중인 Host 추출하는 함수
const getReturnHost = (req) => {
    let returnUrl = req.body.returnUrl || req.headers.referer;

    if (!returnUrl) {
        console.error("❌ Invalid Return URL");
        return null;
    }

    try {
        const urlObject = new URL(returnUrl);
        return urlObject.origin; // "http://localhost:60960" 또는 "https://kakakoalligoapi.cafe24app.com"
    } catch (error) {
        console.error("❌ URL 파싱 오류:", error);
        return null;
    }
};

// ✅ 나이스페이 결제 완료 웹훅 처리
exports.handleNicepayWebhook = async (req, res) => {
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
    } else {
        // ✅ 2. Base64 인코딩된 Authorization 헤더 생성 (Node.js 기본 Buffer 사용)
        const credentials = `${NICEPAY_CLIENT_KEY_SERVE}:${NICEPAY_SECRET_KEY}`;
        const encodedCredentials = Buffer.from(credentials).toString('base64');

        // ✅ 3. 결제 승인 API 요청 데이터 설정
        // 이걸 호출해야하기때문에 cafe24에서 작업하는 것임 고정ip를 나이스페이에 등록해야 함.
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
        } else {

        }

        console.log("🎉 결제 승인 완료:", approvalResponse.data);
    }








    /** redirectUrl
     * ✅ 이동될 페이지 주소 설정
     * - **테스트 환경**: `http://localhost:<포트>/`
     *   - 개발 중에는 포트(예: `60960`)가 매번 변경되므로 요청한 클라이언트의 `URL`을 동적으로 가져와야 함
     * - **운영 환경**: `https://wooripoint-weborder-hosting.web.app/`
     *   - 고정된 도메인을 사용하므로 `URL`을 따로 추출할 필요 없음
     * - 따라서 테스트와 운영 환경 모두에서 사용할 수 있도록 `getReturnHost(req)`를 통해 `host`를 동적으로 설정
     */
    const host = getReturnHost(req);
    if (!host) return res.status(400).send("Invalid Return URL");
    const redirectUrl = `${host}/web/b.html?success=true`;



    console.log(`✅ Redirecting to: ${redirectUrl}`);

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
        const credentials = `${NICEPAY_CLIENT_KEY_SERVE}:${NICEPAY_SECRET_KEY}`;
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




