// handlers/nicepayHandlers.js
exports.responseEndpoint = async (req, res) => {
    try {
        const response = { message: "NicePay Response Success" }; // 응답 객체 정의

        // 성공적으로 응답 반환
        return res.status(200).json(response);
    } catch (e) {
        console.error('Error processing NicePay request:', e);

        // 에러 응답 반환
        return res.status(500).json({
            message: 'Failed to process NicePay request',
            error: e.message || e,
        });
    }
};




