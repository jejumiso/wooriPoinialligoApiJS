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

// 날짜 범위를 최대 7일 단위로 분할하는 함수
function generateDateRanges(startDate, endDate) {
    const ranges = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const current = new Date(start);
    while (current <= end) {
        const rangeStart = new Date(current);
        // 최대 6일 후 (7일 범위) 또는 종료일 중 빠른 날짜
        const rangeEnd = new Date(current);
        rangeEnd.setDate(rangeEnd.getDate() + 6);
        
        if (rangeEnd > end) {
            rangeEnd.setTime(end.getTime());
        }
        
        ranges.push({
            from: rangeStart.toISOString().split('T')[0],
            to: rangeEnd.toISOString().split('T')[0]
        });
        
        // 다음 범위 시작일로 이동
        current.setDate(rangeEnd.getDate() + 1);
    }
    
    return ranges;
}

// StoreFarm 원본 데이터를 프론트엔드 형식으로 변환
function transformOrders(rawOrders) {
    console.log('📦 변환 전 원본 데이터 샘플:', JSON.stringify(rawOrders[0], null, 2));
    
    // productOrder 구조 상세 확인
    if (rawOrders[0]?.content?.productOrder) {
        console.log('📦 productOrder 전체 구조:', JSON.stringify(rawOrders[0].content.productOrder, null, 2));
        const po = rawOrders[0].content.productOrder;
        console.log('📦 송장번호 관련 필드들:', {
            trackingNumber: po.trackingNumber,
            deliveryTrackingNumber: po.deliveryTrackingNumber,
            invoiceNumber: po.invoiceNumber,
            packageTrackingNumber: po.packageTrackingNumber,
            deliveryNumber: po.deliveryNumber,
            allKeys: Object.keys(po).filter(key => key.toLowerCase().includes('track') || key.toLowerCase().includes('invoice') || key.toLowerCase().includes('number') || key.toLowerCase().includes('delivery'))
        });
    }
    
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
            // 배송 정보 추가 (송장번호 포함)
            deliveryCompany: productOrder.expectedDeliveryCompany || 'HYUNDAI', // 기본값: 롯데택배
            trackingNumber: productOrder.trackingNumber || '', // 송장번호 (있다면 자동 입력)
            deliveryInfo: {
                deliveryCompany: productOrder.expectedDeliveryCompany,
                trackingNumber: productOrder.trackingNumber,
                deliveryMethod: productOrder.expectedDeliveryMethod
            },
            // 추가 정보 (필요시 사용)
            paymentDate: order.paymentDate,
            paymentMeans: order.paymentMeans,
            deliveryFeeAmount: productOrder.deliveryFeeAmount || 0,
            baseAddress: shippingAddress.baseAddress,
            detailedAddress: shippingAddress.detailedAddress
        };
        
        console.log('📦 변환 후 데이터 (배송정보 포함):', result);
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
        // 날짜 범위를 최대 7일 단위로 분할
        const dateRanges = generateDateRanges(startDate, endDate);
        console.log('📅 분할된 날짜 범위:', dateRanges);
        
        let allOrders = [];
        
        // 각 날짜 범위별로 조회
        for (let i = 0; i < dateRanges.length; i++) {
            const range = dateRanges[i];
            console.log(`📡 [${i + 1}/${dateRanges.length}] ${range.from} ~ ${range.to} 주문 조회 중...`);
            
            const startTime = Date.now();
            
            try {
                const response = await axiosInstance.get(
                    `${STORE_FARM_API_BASE}/pay-order/seller/product-orders`,
                    {
                        headers: {
                            'Authorization': `Bearer ${access_token}`,
                            'X-API-Version': '1.0'
                        },
                        params: {
                            from: `${range.from}T00:00:00.000+09:00`,
                            to: `${range.to}T23:59:59.999+09:00`
                        }
                    }
                );
                
                const endTime = Date.now();
                console.log(`⏱️ API 호출 시간: ${endTime - startTime}ms`);
                
                // 응답 데이터 구조 디버깅
                console.log(`📦 응답 구조:`, response.data ? Object.keys(response.data) : 'no data');
                
                // StoreFarm API 응답에서 실제 주문 배열 추출
                let rangeOrders = [];
                if (response.data?.data) {
                    if (Array.isArray(response.data.data)) {
                        rangeOrders = response.data.data;
                    } else if (response.data.data.list && Array.isArray(response.data.data.list)) {
                        rangeOrders = response.data.data.list;
                    } else if (response.data.data.contents && Array.isArray(response.data.data.contents)) {
                        rangeOrders = response.data.data.contents;
                    } else {
                        console.log(`📦 data 객체 구조:`, Object.keys(response.data.data));
                        rangeOrders = [];
                    }
                }
                
                allOrders = allOrders.concat(rangeOrders);
                console.log(`✅ ${range.from} ~ ${range.to}: ${rangeOrders.length}건 조회`);
                
                // 여러 범위를 조회하는 경우에만 대기 (마지막 제외)
                if (dateRanges.length > 1 && i < dateRanges.length - 1) {
                    console.log('⏱️ 다음 API 호출 전 0.5초 대기...');
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
            } catch (rangeError) {
                console.error(`❌ ${range.from} ~ ${range.to} 조회 실패:`, rangeError.response?.data || rangeError.message);
                // 한 범위가 실패해도 다른 범위는 계속 조회
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
                apiCalls: dateRanges.length
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

// 상품 주문 발송 처리
const dispatchProductOrders = async (req, res) => {
    console.log('📡 스토어팜 상품 주문 발송 처리 요청:', req.body);
    
    const { access_token, dispatches } = req.body;
    
    if (!access_token) {
        return res.status(400).json({
            success: false,
            message: 'access_token이 필요합니다.'
        });
    }
    
    if (!dispatches || !Array.isArray(dispatches) || dispatches.length === 0) {
        return res.status(400).json({
            success: false,
            message: '발송 처리할 주문 정보(dispatches)가 필요합니다.'
        });
    }
    
    try {
        console.log('📦 받은 dispatches 데이터:', JSON.stringify(dispatches, null, 2));
        
        // StoreFarm API 발송 요청 데이터 구성 - 공식 문서에 따른 올바른 구조
        const requestData = {
            dispatchProductOrders: dispatches.map(dispatch => ({
                productOrderId: dispatch.productOrderId,
                deliveryMethod: "DELIVERY",
                deliveryCompanyCode: dispatch.deliveryCompany, // HYUNDAI, CJGLS, EPOST
                trackingNumber: dispatch.trackingNumber,
                dispatchDate: new Date().toISOString() // ISO-8601 형식: 2025-08-28T08:30:00.000Z
            }))
        };
        
        console.log('📦 발송 처리 요청 데이터:', JSON.stringify(requestData, null, 2));
        
        const response = await axiosInstance.post(
            `${STORE_FARM_API_BASE}/pay-order/seller/product-orders/dispatch`,
            requestData,
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'X-API-Version': '1.0',
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ 스토어팜 발송 처리 성공:', response.data);
        
        res.json({
            success: true,
            data: response.data
        });
        
    } catch (error) {
        console.error('❌ 스토어팜 발송 처리 실패:', error.response?.data || error.message);
        
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message,
            error: error.response?.data || error.message
        });
    }
};

module.exports = {
    oauthToken,
    getProductOrders,
    dispatchProductOrders
};