// handlers/tracking/common.js
// 공통 포맷터 및 유틸리티

/**
 * 배송 상태 표준화
 */
const normalizeDeliveryStatus = (statusText) => {
  const text = statusText.toLowerCase();
  
  if (text.includes('배달완료') || text.includes('배송완료')) {
    return 'delivered';
  }
  if (text.includes('배송중') || text.includes('배달중') || text.includes('운송중')) {
    return 'in_transit';
  }
  if (text.includes('접수') || text.includes('준비')) {
    return 'pending';
  }
  if (text.includes('취소') || text.includes('반송')) {
    return 'cancelled';
  }
  if (text.includes('실패')) {
    return 'failed';
  }
  
  return 'in_transit'; // 기본값
};

/**
 * 표준 응답 포맷 생성
 */
const createTrackingResponse = (data) => {
  return {
    // 기본 정보
    trackingNumber: data.trackingNumber || '',
    courierCode: data.courierCode || '',
    courierName: data.courierName || '',
    
    // 현재 상태
    deliveryStatus: data.deliveryStatus || 'pending',
    deliveryStatusText: data.deliveryStatusText || '',
    
    // 발송인/수령인 정보
    senderName: data.senderName || '',
    senderPhone: data.senderPhone || '',
    receiverName: data.receiverName || '',
    receiverPhone: data.receiverPhone || '',
    receiverAddress: data.receiverAddress || '',
    
    // 배송 진행 상황
    progresses: data.progresses || [],
    
    // 시간 정보
    dateDelivered: data.dateDelivered || '',
    dateEstimated: data.dateEstimated || '',
    
    // 상품 정보
    productName: data.productName || '',
    productQuantity: data.productQuantity || 0
  };
};

/**
 * 에러 응답 생성
 */
const createErrorResponse = (error, statusCode = 500) => {
  return {
    success: false,
    error: error.message || '알 수 없는 오류가 발생했습니다.',
    statusCode
  };
};

/**
 * 성공 응답 생성
 */
const createSuccessResponse = (data) => {
  return {
    success: true,
    data
  };
};

/**
 * 날짜 포맷 변환 (YYYYMMDD -> YYYY-MM-DD HH:mm:ss)
 */
const formatDateTime = (dateStr, timeStr = '') => {
  if (!dateStr) return '';
  
  // YYYYMMDD 형식
  if (dateStr.length === 8) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    
    if (timeStr) {
      return `${year}-${month}-${day} ${timeStr}`;
    }
    return `${year}-${month}-${day}`;
  }
  
  // 이미 포맷된 경우
  return dateStr;
};

module.exports = {
  normalizeDeliveryStatus,
  createTrackingResponse,
  createErrorResponse,
  createSuccessResponse,
  formatDateTime
};