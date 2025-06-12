const axios = require('axios'); // CommonJS 방식

/**
 * Authorization 헤더에서 encodedCredentials를 추출하고, 디코딩하여 clientId를 반환합니다.
 * 올바르지 않은 형식일 경우 Error를 throw합니다.
 */
function extractCredentials(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Basic ")) {
        throw new Error("Authorization 헤더가 없거나 올바른 형식이 아닙니다.");
    }
    const encodedCredentials = authHeader.split(" ")[1];
    const decodedCredentials = Buffer.from(encodedCredentials, "base64").toString("utf-8");
    if (!decodedCredentials.includes(":")) {
        throw new Error("잘못된 인증 형식입니다.");
    }
    const [clientId] = decodedCredentials.split(":");
    return { encodedCredentials, clientId };
}

// ApiResponse 구조 (참고용)
// {
//   isSuccess: boolean,
//   statusCode?: number,
//   data?: any,
//   error?: string,
//   message?: string
// }

/**
 * 나이스페이 결제(승인) API 호출
 */
async function nicepayWebhook(req, res) {
    try {
        const { isRealServe, amount, tid } = req.body;
        if (typeof isRealServe !== "boolean" || !amount || !tid) {
            return res.status(400).json({
                isSuccess: false,
                statusCode: 400,
                message: "필수 데이터가 누락되었습니다."
            });
        }

        let encodedCredentials, clientId;
        try {
            ({ encodedCredentials, clientId } = extractCredentials(req));
        } catch (err) {
            console.error(err.message);
            return res.status(401).json({
                isSuccess: false,
                statusCode: 401,
                message: err.message
            });
        }
        console.log("🔹 [카페24] 인증 정보 확인 - clientId:", clientId);

        let nicePayApprovalUrl = `https://api.nicepay.co.kr/v1/payments/${tid}`;
        if (!isRealServe) {
            console.log("🔹 [카페24] 나이스페이 최종 승인 요청 수신: 테스트,", { amount, tid });
            nicePayApprovalUrl = `https://sandbox-api.nicepay.co.kr/v1/payments/${tid}`;
        } else {
            console.log("🔹 [카페24] 나이스페이 최종 승인 요청 수신: 서버,", { amount, tid });
        }
        const approvalData = { amount };

        const response = await axios.post(nicePayApprovalUrl, approvalData, {
            headers: {
                Authorization: `Basic ${encodedCredentials}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ [카페24] 나이스페이 최종 승인 응답:", response.data);
        return res.status(200).json({
            isSuccess: true,
            statusCode: 200,
            message: response.data.resultMsg,
            data: response.data
        });
    } catch (error) {
        console.error("❌ [카페24] 나이스페이 최종 승인 오류 발생!");
        if (error.response) {
            return res.status(500).json({
                isSuccess: false,
                statusCode: error.response.status || 500,
                message: error.response.data.resultMsg || "알 수 없는 오류가 발생했습니다.",
                data: error.response.data
            });
        } else if (error.request) {
            return res.status(500).json({
                isSuccess: false,
                statusCode: 500,
                message: "결제 승인 중 오류 발생 (응답 없음)",
                error: "응답 없음"
            });
        } else {
            return res.status(500).json({
                isSuccess: false,
                statusCode: 500,
                message: "결제 승인 중 오류 발생 (요청 오류)",
                error: error.message
            });
        }
    }
}

/**
 * 나이스페이 정기결제의 카드 등록 API 호출
 */
async function subscribeRegist(req, res) {
    try {
        const { isRealServe, encData, orderId } = req.body;
        if (!encData || !orderId) {
            return res.status(400).json({
                isSuccess: false,
                statusCode: 400,
                message: "필수 데이터가 누락되었습니다."
            });
        }
        console.log("🔹 [카페24] 나이스페이 Webhook 요청 수신:", { orderId });

        let encodedCredentials, clientId;
        try {
            ({ encodedCredentials, clientId } = extractCredentials(req));
        } catch (err) {
            console.error(err.message);
            return res.status(401).json({
                isSuccess: false,
                statusCode: 401,
                message: err.message
            });
        }
        console.log("🔹 [카페24] 인증 정보 확인 - clientId:", clientId);

        let nicePayUrl = "https://api.nicepay.co.kr/v1/subscribe/regist";
        if (!isRealServe) {
            nicePayUrl = "https://sandbox-api.nicepay.co.kr/v1/subscribe/regist";
            console.log("🔹 [카페24] 나이스페이 테스트 서버로 요청 전송");
        }

        const response = await axios.post(
            nicePayUrl,
            { 
                encData, 
                orderId,
                encMode: 'A2' // 이걸 꼭 같이 넣어야 AES-256 처리됨 
            },
            {
                headers: {
                    Authorization: `Basic ${encodedCredentials}`,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log("✅ [카페24] 나이스페이 Webhook 응답:", response.data);
        return res.status(200).json({
            isSuccess: true,
            statusCode: 200,
            data: response.data,
            message: "정상적으로 처리되었습니다."
        });
    } catch (error) {
        console.error("❌ [카페24] 나이스페이 Webhook 오류 발생!");
        if (error.response) {
            return res.status(500).json({
                isSuccess: false,
                statusCode: error.response.status || 500,
                message: error.response.data.resultMsg || "알 수 없는 오류가 발생했습니다.",
                data: error.response.data
            });
        } else if (error.request) {
            return res.status(500).json({
                isSuccess: false,
                statusCode: 500,
                message: "나이스페이 호출 중 오류 발생 (응답 없음)",
                error: "응답 없음"
            });
        } else {
            return res.status(500).json({
                isSuccess: false,
                statusCode: 500,
                message: "나이스페이 호출 중 오류 발생 (요청 오류)",
                error: error.message
            });
        }
    }
}

/**
 * 나이스페이 정기결제에 등록된 카드로 결제 요청 API 호출
 */
async function subscribeBilling(req, res) {
    try {
        const { isRealServe, bid, orderId, amount, goodsName, cardQuota, useShopInterest } = req.body;
        let encodedCredentials, clientId;
        try {
            ({ encodedCredentials, clientId } = extractCredentials(req));
        } catch (err) {
            console.error(err.message);
            return res.status(401).json({
                isSuccess: false,
                statusCode: 401,
                message: err.message
            });
        }
        console.log("🔹 [카페24] 인증 정보 확인 - clientId:", clientId);

        if (!bid || !orderId || !amount || !goodsName) {
            return res.status(400).json({
                isSuccess: false,
                statusCode: 400,
                message: "필수 데이터가 누락되었습니다."
            });
        }
        console.log("🔹 [카페24] 나이스페이 Billing Webhook 요청 수신:", { orderId });

        let nicePayUrl = `https://api.nicepay.co.kr/v1/subscribe/${bid}/payments`;
        if (!isRealServe) {
            nicePayUrl = `https://sandbox-api.nicepay.co.kr/v1/subscribe/${bid}/payments`;
            console.log("🔹 [카페24] 나이스페이 테스트 서버로 요청 전송");
        }

        const response = await axios.post(
            nicePayUrl,
            {
                orderId,
                amount,
                goodsName,
                cardQuota: cardQuota !== undefined ? cardQuota : 0,
                useShopInterest: useShopInterest !== undefined ? useShopInterest : false
            },
            {
                headers: {
                    Authorization: `Basic ${encodedCredentials}`,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log("✅ [카페24] 나이스페이 Billing Webhook 응답:", response.data);
        return res.status(200).json({
            isSuccess: true,
            statusCode: 200,
            data: response.data,
            message: "정상적으로 처리되었습니다."
        });
    } catch (error) {
        console.error("❌ [카페24] 나이스페이 Billing Webhook 오류 발생!");
        if (error.response) {
            console.error("🔴 응답 데이터:", JSON.stringify(error.response.data, null, 2));
            console.error("🔴 응답 상태 코드:", error.response.status);
            return res.status(500).json({
                isSuccess: false,
                statusCode: error.response.status || 500,
                message: error.response.data.resultMsg || "알 수 없는 오류가 발생했습니다.",
                data: error.response.data
            });
        } else if (error.request) {
            console.error("⚠️ 요청이 전송되었으나 응답을 받지 못함:", error.request);
            return res.status(500).json({
                isSuccess: false,
                statusCode: 500,
                message: "나이스페이 호출 중 오류 발생 (응답 없음)",
                error: "응답 없음"
            });
        } else {
            console.error("⚠️ 요청 설정 중 오류 발생:", error.message);
            return res.status(500).json({
                isSuccess: false,
                statusCode: 500,
                message: "나이스페이 호출 중 오류 발생 (요청 오류)",
                error: error.message
            });
        }
    }
}

module.exports = {
    extractCredentials,
    nicepayWebhook,
    subscribeRegist,
    subscribeBilling
};
