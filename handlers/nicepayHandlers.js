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




