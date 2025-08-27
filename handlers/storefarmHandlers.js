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

// 날짜 배열 생성 함수 (하루씩 분할)
function generateDateRange(startDate, endDate) {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const current = new Date(start);
    while (current <= end) {
        dates.push(current.toISOString().split('T')[0]); // YYYY-MM-DD 형식
        current.setDate(current.getDate() + 1);
    }
    
    return dates;
}

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
        // 날짜 범위를 하루씩 분할
        const dateRange = generateDateRange(startDate, endDate);
        console.log('📅 분할된 날짜 범위:', dateRange);
        
        let allOrders = [];
        
        // 각 날짜별로 순차적으로 조회
        for (const date of dateRange) {
            console.log(`📡 ${date} 주문 조회 중...`);
            
            try {
                const response = await axiosInstance.get(
                    `${STORE_FARM_API_BASE}/pay-order/seller/product-orders`,
                    {
                        headers: {
                            'Authorization': `Bearer ${access_token}`,
                            'X-API-Version': '1.0'
                        },
                        params: {
                            from: `${date}T00:00:00.000+09:00`, // 하루 시작
                            to: `${date}T23:59:59.999+09:00`    // 하루 종료
                        }
                    }
                );
                
                // 응답 데이터 구조 디버깅
                console.log(`📦 ${date} 응답 구조:`, {
                    hasData: !!response.data,
                    dataKeys: response.data ? Object.keys(response.data) : [],
                    dataType: typeof response.data?.data,
                    dataLength: Array.isArray(response.data?.data) ? response.data.data.length : 'not array'
                });
                
                const dayOrders = response.data?.data || response.data || [];
                allOrders = allOrders.concat(dayOrders);
                console.log(`✅ ${date}: ${Array.isArray(dayOrders) ? dayOrders.length : 'not array'}건 조회`);
                
                // API 호출 제한을 위한 지연 (1초로 증가)
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
                
            } catch (dayError) {
                console.error(`❌ ${date} 조회 실패:`, dayError.response?.data || dayError.message);
                // 하루 실패해도 다른 날짜는 계속 조회
            }
        }
        
        console.log(`✅ 전체 주문 조회 완료: 총 ${allOrders.length}건`);
        
        res.json({
            success: true,
            data: allOrders,
            summary: {
                totalCount: allOrders.length,
                dateRange: `${startDate} ~ ${endDate}`,
                queriedDates: dateRange.length
            }
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