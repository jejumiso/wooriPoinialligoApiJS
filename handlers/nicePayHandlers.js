const axios = require('axios'); // CommonJS 방식


const payments = async (req, res) => {
    try {
        const { isTest, amount, encodedCredentials, tid } = req.body;

        // ✅ 필수 데이터 검증
        if (!amount || !encodedCredentials || !tid) {
            return res.status(400).json({ error: "필수 데이터가 누락되었습니다." });
        }

        

        // ✅ 나이스페이 최종 승인 API 요청 설정
        let nicePayApprovalUrl = `https://api.nicepay.co.kr/v1/payments/${tid}`;
        if (isTest) {
            console.log("🔹 [카페24] 나이스페이 최종 승인 요청 수신: 테스트,", { amount, tid });
            nicePayApprovalUrl = `https://sandbox-api.nicepay.co.kr/v1/payments/${tid}`;
        } else {
            console.log("🔹 [카페24] 나이스페이 최종 승인 요청 수신: 서버,", { amount, tid });
        }
        const approvalData = { amount: amount };

        // ✅ Authorization 헤더 검증 (Base64 형식인지 체크)
        const decoded = Buffer.from(encodedCredentials, 'base64').toString('ascii');
        if (!decoded.includes(":")) {
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
        console.error("❌ [카페24] 나이스페이 최종 승인 오류 발생!");

        if (error.response) {
            console.error("🔴 응답 데이터:", JSON.stringify(error.response.data, null, 2));
            console.error("🔴 응답 상태 코드:", error.response.status);
            return res.status(500).json({
                error: "결제 승인 중 오류 발생 (API 응답)",
                details: error.response.data
            });
        } else if (error.request) {
            console.error("⚠️ [카페24] 요청이 전송되었으나 응답을 받지 못함:", error.request);
            return res.status(500).json({
                error: "결제 승인 중 오류 발생 (응답 없음)",
                details: "나이스페이 서버로부터 응답이 오지 않았습니다."
            });
        } else {
            console.error("⚠️ [카페24] 요청 설정 중 오류 발생:", error.message);
            return res.status(500).json({
                error: "결제 승인 중 오류 발생 (요청 오류)",
                details: error.message
            });
        }
    }

};

module.exports = {
    payments,

};
