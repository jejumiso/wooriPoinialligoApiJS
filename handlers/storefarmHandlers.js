// handlers/storefarmHandlers.js
const axios = require('axios');
const bcrypt = require('bcryptjs');

const STORE_FARM_API_BASE = 'https://api.commerce.naver.com/external/v1';

const axiosInstance = axios.create({
    timeout: 10000
});

// 서명 생성 함수
function generateSignature(clientId, clientSecret, timestamp) {
    const data = `${clientId}_${timestamp}`;
    const hash = bcrypt.hashSync(data, clientSecret);
    return Buffer.from(hash).toString('base64');
}

// OAuth 토큰 발급
const oauthToken = async (req, res) => {
    console.log('📡 스토어팜 OAuth 토큰 요청:', req.body);
    
    const { client_id, client_secret } = req.body;
    
    if (!client_id || !client_secret) {
        return res.status(400).json({
            success: false,
            message: 'client_id와 client_secret이 필요합니다.'
        });
    }
    
    try {
        const timestamp = Date.now();
        const signature = generateSignature(client_id, client_secret, timestamp);
        
        const params = new URLSearchParams();
        params.append('client_id', client_id);
        params.append('timestamp', timestamp.toString());
        params.append('client_secret_sign', signature);
        params.append('grant_type', 'client_credentials');
        params.append('type', 'SELF');
        
        console.log('📝 토큰 요청 데이터:', {
            client_id,
            timestamp,
            grant_type: 'client_credentials',
            type: 'SELF',
            signature_length: signature.length
        });
        
        const response = await axiosInstance.post(
            `${STORE_FARM_API_BASE}/oauth2/token`,
            params.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            }
        );
        
        console.log('✅ 스토어팜 OAuth 토큰 발급 성공');
        
        res.json({
            success: true,
            data: response.data
        });
        
    } catch (error) {
        console.error('❌ 스토어팜 OAuth 토큰 발급 실패:', error.response?.data || error.message);
        
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message,
            error: error.response?.data || error.message
        });
    }
};

// 상품 주문 조회
const getProductOrders = async (req, res) => {
    console.log('📡 스토어팜 상품 주문 조회 요청:', req.body);
    
    const { access_token, startDate, endDate } = req.body;
    
    if (!access_token) {
        return res.status(400).json({
            success: false,
            message: 'access_token이 필요합니다.'
        });
    }
    
    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: 'startDate와 endDate가 필요합니다.'
        });
    }
    
    try {
        // 조건형 상품 주문 상세 내역 조회 API 사용
        const response = await axiosInstance.get(
            `${STORE_FARM_API_BASE}/pay-order/seller/product-orders`,
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'X-API-Version': '1.0'
                },
                params: {
                    from: `${startDate}T00:00:00+09:00`, // 한국시간 시작 (00:00:00)
                    to: `${endDate}T23:59:59+09:00`      // 한국시간 종료 (23:59:59)
                }
            }
        );
        
        console.log('✅ 스토어팜 상품 주문 조회 성공:', response.status);
        
        res.json({
            success: true,
            data: response.data?.data || []
        });
        
    } catch (error) {
        console.error('❌ 스토어팜 상품 주문 조회 실패:', error.response?.data || error.message);
        
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message,
            error: error.response?.data || error.message
        });
    }
};

module.exports = {
    oauthToken,
    getProductOrders
};