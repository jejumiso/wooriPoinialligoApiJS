const axios = require('axios'); // CommonJS 방식
import { Request } from 'express';

/**
 * Authorization 헤더에서 encodedCredentials를 추출하고, 디코딩하여 clientId를 반환합니다.
 * 올바르지 않은 형식일 경우 Error를 throw합니다.
 */
export function extractCredentials(req: Request): { encodedCredentials: string; clientId: string } {
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




export interface ApiResponse<T = any> {
    isSuccess: boolean;
    statusCode?: number;
    data?: T;
    error?: string;
    message?: string;
}
/**
 * 나이스페이 결제(승인) API 호출
 */
export const nicepayWebhook = async (req: Request, res: Response) => {
    try {
        const { isRealServe, amount, tid } = req.body;

        if (typeof isRealServe !== "boolean" || !amount || !tid) {
            return res.status(400).json({
                isSuccess: false,
                statusCode: 400,
                message: "필수 데이터가 누락되었습니다.",
            } as ApiResponse);
        }

        let encodedCredentials: string;
        let clientId: string;
        try {
            ({ encodedCredentials, clientId } = extractCredentials(req));
        } catch (err: any) {
            console.error(err.message);
            return res.status(401).json({
                isSuccess: false,
                statusCode: 401,
                message: err.message,
            } as ApiResponse);
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
                "Content-Type": "application/json",
            },
        });

        console.log("✅ [카페24] 나이스페이 최종 승인 응답:", response.data);
        return res.status(200).json({
            isSuccess: true,
            statusCode: 200,
            message: response.data.resultMsg,
            data: response.data,
        } as ApiResponse);
    } catch (error: any) {
        console.error("❌ [카페24] 나이스페이 최종 승인 오류 발생!");
        if (error.response) {
            return res.status(500).json({
                isSuccess: false,
                statusCode: error.response?.status ?? 500,
                message: error.response?.data?.resultMsg ?? "알 수 없는 오류가 발생했습니다.",
                data: error.response?.data,
            } as ApiResponse);
        } else if (error.request) {
            return res.status(500).json({
                isSuccess: false,
                statusCode: 500,
                message: "결제 승인 중 오류 발생 (응답 없음)",
                error: "응답 없음",
            } as ApiResponse);
        } else {
            return res.status(500).json({
                isSuccess: false,
                statusCode: 500,
                message: "결제 승인 중 오류 발생 (요청 오류)",
                error: error.message,
            } as ApiResponse);
        }
    }
};




/**
 * 나이스페이 정기결제의 카드 등록록
 */
export const subscribeRegist = async (req: Request, res: Response) => {
    try {
        const { isRealServe, encData, orderId } = req.body;

        if (!encData || !orderId) {
            return res.status(400).json({
                isSuccess: false,
                statusCode: 400,
                message: "필수 데이터가 누락되었습니다.",
            } as ApiResponse);
        }

        console.log("🔹 [카페24] 나이스페이 Webhook 요청 수신:", { orderId });

        let encodedCredentials: string;
        let clientId: string;
        try {
            ({ encodedCredentials, clientId } = extractCredentials(req));
        } catch (err: any) {
            console.error(err.message);
            return res.status(401).json({
                isSuccess: false,
                statusCode: 401,
                message: err.message,
            } as ApiResponse);
        }
        console.log("🔹 [카페24] 인증 정보 확인 - clientId:", clientId);

        let nicePayUrl = "https://api.nicepay.co.kr/v1/subscribe/regist";
        if (!isRealServe) {
            nicePayUrl = "https://sandbox-api.nicepay.co.kr/v1/subscribe/regist";
            console.log("🔹 [카페24] 나이스페이 테스트 서버로 요청 전송");
        }

        const response = await axios.post(
            nicePayUrl,
            { encData, orderId },
            {
                headers: {
                    Authorization: `Basic ${encodedCredentials}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("✅ [카페24] 나이스페이 Webhook 응답:", response.data);
        return res.status(200).json({
            isSuccess: true,
            statusCode: 200,
            data: response.data,
            message: "정상적으로 처리되었습니다.",
        } as ApiResponse);
    } catch (error: any) {
        console.error("❌ [카페24] 나이스페이 Webhook 오류 발생!");
        if (error.response) {
            return res.status(500).json({
                isSuccess: false,
                statusCode: error.response?.status ?? 500,
                message: error.response?.data?.resultMsg ?? "알 수 없는 오류가 발생했습니다.",
                data: error.response?.data,
            } as ApiResponse);
        } else if (error.request) {
            return res.status(500).json({
                isSuccess: false,
                statusCode: 500,
                message: "나이스페이 호출 중 오류 발생 (응답 없음)",
                error: "응답 없음",
            } as ApiResponse);
        } else {
            return res.status(500).json({
                isSuccess: false,
                statusCode: 500,
                message: "나이스페이 호출 중 오류 발생 (요청 오류)",
                error: error.message,
            } as ApiResponse);
        }
    }
};


/**
 * 나이스페이 정기결제에 등록된 카드로 결제 요청
 */
export const subscribeBilling = async (req: Request, res: Response) => {
    try {
        const { isRealServe, bid, orderId, amount, goodsName, cardQuota, useShopInterest } = req.body;

        // ✅ 필수 데이터 검증
        if (!bid || !orderId || !amount || !goodsName) {
            return res.status(400).json({
                isSuccess: false,
                statusCode: 400,
                message: "필수 데이터가 누락되었습니다.",
            } as ApiResponse);
        }

        console.log("🔹 [카페24] 나이스페이 Billing Webhook 요청 수신:", { orderId });

        // ✅ Authorization 헤더에서 encodedCredentials 및 clientId 추출
        let encodedCredentials: string, clientId: string;
        try {
            ({ encodedCredentials, clientId } = extractCredentials(req));
        } catch (err: any) {
            console.error(err.message);
            return res.status(401).json({
                isSuccess: false,
                statusCode: 401,
                message: err.message,
            } as ApiResponse);
        }
        console.log("🔹 [카페24] 인증 정보 확인 - clientId:", clientId);

        // ✅ 나이스페이 API URL 설정 (실제 서버 vs 테스트 서버)
        let nicePayUrl = `https://api.nicepay.co.kr/v1/subscribe/${bid}/payments`;
        if (isRealServe !== "production") {
            nicePayUrl = `https://sandbox-api.nicepay.co.kr/v1/subscribe/${bid}/payments`;
            console.log("🔹 [카페24] 나이스페이 테스트 서버로 요청 전송");
        }

        // ✅ 나이스페이 API 호출
        const response = await axios.post(
            nicePayUrl,
            {
                orderId,
                amount,
                goodsName,
                cardQuota: cardQuota ?? 0,
                useShopInterest: useShopInterest ?? false,
            },
            {
                headers: {
                    Authorization: `Basic ${encodedCredentials}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("✅ [카페24] 나이스페이 Billing Webhook 응답:", response.data);
        return res.status(200).json({
            isSuccess: true,
            statusCode: 200,
            data: response.data,
            message: "정상적으로 처리되었습니다.",
        } as ApiResponse);
    } catch (error: any) {
        console.error("❌ [카페24] 나이스페이 Billing Webhook 오류 발생!");
        if (error.response) {
            console.error("🔴 응답 데이터:", JSON.stringify(error.response.data, null, 2));
            console.error("🔴 응답 상태 코드:", error.response.status);
            return res.status(500).json({
                isSuccess: false,
                statusCode: error.response?.status ?? 500,
                message: error.response?.data?.resultMsg ?? "나이스페이 호출 중 오류 발생 (API 응답)",
                data: error.response?.data,
            } as ApiResponse);
        } else if (error.request) {
            console.error("⚠️ 요청이 전송되었으나 응답을 받지 못함:", error.request);
            return res.status(500).json({
                isSuccess: false,
                statusCode: 500,
                message: "나이스페이 호출 중 오류 발생 (응답 없음)",
                error: "응답 없음",
            } as ApiResponse);
        } else {
            console.error("⚠️ 요청 설정 중 오류 발생:", error.message);
            return res.status(500).json({
                isSuccess: false,
                statusCode: 500,
                message: "나이스페이 호출 중 오류 발생 (요청 오류)",
                error: error.message,
            } as ApiResponse);
        }
    }
};



