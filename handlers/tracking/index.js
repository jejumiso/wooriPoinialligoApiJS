// handlers/tracking/index.js
// 택배 조회 메인 핸들러

const { getCourierInfo, getActiveCouriers } = require('./courierCodes');
const { createTrackingResponse, createErrorResponse, createSuccessResponse } = require('./common');
const { trackLotte } = require('./lotte');
const { trackCJ } = require('./cj');
const { trackKoreaPost } = require('./koreapost');
const { trackHanjin } = require('./hanjin');
const { trackLogen } = require('./logen');
const { trackIlyanglogis } = require('./ilyanglogis');

/**
 * 택배 조회 메인 핸들러
 * @param {Object} req - Express request 객체
 * @param {Object} res - Express response 객체
 */
const trace = async (req, res) => {
  try {
    const { courierCode, trackingNumber } = req.body;
    
    // 필수 파라미터 체크
    if (!courierCode || !trackingNumber) {
      return res.status(400).json(
        createErrorResponse(
          new Error('택배사 코드와 송장번호는 필수입니다.'),
          400
        )
      );
    }
    
    console.log(`📦 택배 조회 요청: ${courierCode} / ${trackingNumber}`);
    
    // 택배사 정보 확인
    const courierInfo = getCourierInfo(courierCode);
    
    // 택배사별 조회 처리
    let trackingData;
    switch (courierCode) {
      case 'lotte':
        trackingData = await trackLotte(trackingNumber);
        break;
        
      case 'epost':
      case 'koreapost':
        trackingData = await trackKoreaPost(trackingNumber);
        break;
        
      case 'cj':
        trackingData = await trackCJ(trackingNumber);
        break;
        
      case 'logen':
        trackingData = await trackLogen(trackingNumber);
        break;
        
      case 'hanjin':
        trackingData = await trackHanjin(trackingNumber);
        break;
        
      case 'ilyanglogis':
        trackingData = await trackIlyanglogis(trackingNumber);
        break;
        
      default:
        throw new Error(`지원하지 않는 택배사: ${courierCode}`);
    }
    
    // 표준 응답 포맷으로 변환
    const response = createTrackingResponse(trackingData);
    
    console.log(`✅ 택배 조회 성공: ${courierCode} / ${trackingNumber}`);
    return res.json(createSuccessResponse(response));
    
  } catch (error) {
    console.error('❌ 택배 조회 실패:', error);
    
    // 에러 응답
    if (error.message.includes('지원하지 않는') || 
        error.message.includes('구현 준비 중')) {
      return res.status(400).json(createErrorResponse(error, 400));
    }
    
    return res.status(500).json(createErrorResponse(error, 500));
  }
};

/**
 * 지원 택배사 목록 조회
 */
const getCouriers = async (req, res) => {
  try {
    const activeCouriers = getActiveCouriers();
    
    return res.json(createSuccessResponse({
      couriers: activeCouriers,
      total: activeCouriers.length
    }));
    
  } catch (error) {
    console.error('❌ 택배사 목록 조회 실패:', error);
    return res.status(500).json(createErrorResponse(error, 500));
  }
};

module.exports = {
  trace,
  getCouriers
};