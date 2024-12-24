// handlers/bootpayHandlers.js
const { Bootpay } = require('@bootpay/backend-js');

Bootpay.setConfiguration({
    application_id: '6760dc02a3175898bd6e51fa',
    private_key: 'd2iD24U0sVVIY5GRfhz71tq2d+vkHa1KnNaznOjDiZE='
});

exports.requestUserToken = async (req, res) => {
    try {
        // 클라이언트에서 요청으로 받은 데이터를 사용
        const { user_id, email, phone, username, gender, birth } = req.body;

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
