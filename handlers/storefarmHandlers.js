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

// StoreFarm 원본 데이터를 프론트엔드 형식으로 변환
function transformOrders(rawOrders) {
    console.log('📦 변환 전 원본 데이터 샘플:', JSON.stringify(rawOrders[0], null, 2));
    
    const transformed = rawOrders.map(item => {
        // 데이터 구조 확인
        const order = item.content?.order || {};
        const productOrder = item.content?.productOrder || {};
        const shippingAddress = productOrder.shippingAddress || {};
        
        const result = {
            productOrderId: item.productOrderId,
            orderId: order.orderId || item.productOrderId,
            buyerName: order.ordererName || '-',
            receiverName: shippingAddress.name || '-',
            receiverPhone: shippingAddress.tel1 || '-',
            productName: productOrder.productName || '-',
            quantity: productOrder.quantity || 0,
            totalPaymentAmount: productOrder.totalPaymentAmount || 0,
            orderedDate: order.orderDate || null,
            productOrderStatus: productOrder.productOrderStatus || 'UNKNOWN',
            // 추가 정보 (필요시 사용)
            paymentDate: order.paymentDate,
            paymentMeans: order.paymentMeans,
            deliveryFeeAmount: productOrder.deliveryFeeAmount || 0,
            baseAddress: shippingAddress.baseAddress,
            detailedAddress: shippingAddress.detailedAddress
        };
        
        console.log('📦 변환 후 데이터:', result);
        return result;
    });
    
    return transformed;
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
                console.log(`📦 ${date} 전체 응답:`, JSON.stringify(response.data, null, 2));
                
                // StoreFarm API 응답에서 실제 주문 배열 추출
                let dayOrders = [];
                if (response.data?.data) {
                    if (Array.isArray(response.data.data)) {
                        dayOrders = response.data.data;
                    } else if (response.data.data.list && Array.isArray(response.data.data.list)) {
                        dayOrders = response.data.data.list;
                    } else if (response.data.data.contents && Array.isArray(response.data.data.contents)) {
                        dayOrders = response.data.data.contents;
                    } else {
                        console.log(`📦 ${date} data 객체 구조:`, Object.keys(response.data.data));
                        dayOrders = [];
                    }
                }
                
                allOrders = allOrders.concat(dayOrders);
                console.log(`✅ ${date}: ${dayOrders.length}건 조회`);
                
                // API 호출 제한을 위한 지연 (1초로 증가)
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
                
            } catch (dayError) {
                console.error(`❌ ${date} 조회 실패:`, dayError.response?.data || dayError.message);
                // 하루 실패해도 다른 날짜는 계속 조회
            }
        }
        
        console.log(`✅ 전체 주문 조회 완료: 총 ${allOrders.length}건`);
        
        // 디버깅: 원본 데이터 확인
        console.log('🔍 변환 전 allOrders 길이:', allOrders.length);
        console.log('🔍 첫 번째 원본 데이터:', allOrders.length > 0 ? JSON.stringify(allOrders[0], null, 2) : '데이터 없음');
        
        // 데이터 변환 적용
        const transformedOrders = allOrders.length > 0 ? transformOrders(allOrders) : [];
        
        console.log('🔍 변환 후 데이터 길이:', transformedOrders.length);
        console.log('🔍 첫 번째 변환 데이터:', transformedOrders.length > 0 ? JSON.stringify(transformedOrders[0], null, 2) : '변환된 데이터 없음');
        
        res.json({
            success: true,
            data: transformedOrders,
            summary: {
                totalCount: transformedOrders.length,
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