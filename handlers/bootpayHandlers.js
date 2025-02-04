// handlers/bootpayHandlers.js
const { Bootpay } = require('@bootpay/backend-js');



exports.requestUserToken = async (req, res) => {
    try {
        // 클라이언트에서 요청으로 받은 데이터를 사용
        const { companyId,
            isReal,
            user_id, email, phone, username, gender, birth } = req.body;

        var application_id = "";
        var private_key = "";
        //서버에서 갖고와야 하지만 임시...
        if (companyId == "cafebombomjejunamwon") {

            if (isReal) {
                application_id = "67a26d0d4fb27baaf86e5592";
                private_key = "WASa2Rmp2YasnAfJ7V75Ay1n2S3yFapZlBV+liEiGkM=";
            } else {
                application_id = "67a27319a3175898bd6e55f2";
                private_key = "Gu35HLZCQ8Sqj7QAVZSXWESGNgbx6jG2TOIQqFIVh6A=";
            }
        }
        if (topping - up == "cafebombomjejunamwon") {
            if (isReal) {
                application_id = "67a26d0d4fb27baaf86e5592";
                private_key = "WASa2Rmp2YasnAfJ7V75Ay1n2S3yFapZlBV+liEiGkM=";
            } else {
                application_id = "67a27319a3175898bd6e55f2";
                private_key = "Gu35HLZCQ8Sqj7QAVZSXWESGNgbx6jG2TOIQqFIVh6A=";
            }
        }
        //서버에서 갖고와야 하지만 임시... END

        // Bootpay 설정을 클라이언트로부터 받은 값으로 설정
        Bootpay.setConfiguration({
            application_id,
            private_key,
        });

        // Bootpay API 호출
        await Bootpay.getAccessToken(); // Access Token 발급
        const response = await Bootpay.requestUserToken({
            user_id,
            email,
            phone,
            username,
            gender,
            birth,
        });

        // 성공적으로 응답 반환
        return res.status(200).json(response);
    } catch (e) {
        console.error('Error requesting user token:', e);

        // 에러 응답 반환
        return res.status(500).json({
            message: 'Failed to request user token',
            error: e.message || e,
        });
    }
};
