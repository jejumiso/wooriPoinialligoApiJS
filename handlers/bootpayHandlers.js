// handlers/bootpayHandlers.js
const { Bootpay } = require('@bootpay/backend-js');



exports.requestUserToken = async (req, res) => {
    try {
        // 클라이언트에서 요청으로 받은 데이터를 사용
        const { companyId,
            isReal,
            user_id, email, phone, username, gender, birth } = req.body;


        console.log("간변비밀번호 token발행 시작   companyId : " + companyId);

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
        if (companyId == "topping-up") {
            if (isReal) {
                application_id = "6760f9414fb27baaf86e522d";
                private_key = "pzWm9qcLC/HfHV71/PdDfloRKiuxjZhEYMT9Qol33H0=";
            } else {
                application_id = "67a2815d692d0516c36e5578";
                private_key = "WfOtF7Fn9RzM0hDK+T8OiHpyhvngazPbsd7LPlqGxMU=";
            }
        }
        if (companyId == "jerajune_duty_free") {
            application_id = "67b5418986fd08d2213fcd55";
            private_key = "x0sYAt86UH7IqJEKBDqlgKtubzn1lLPCsro3I98vdQ4=";
        }
        console.log("간변비밀번호 token발행 시작   application_id : " + application_id);
        console.log("간변비밀번호 token발행 시작   private_key : " + private_key);
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
