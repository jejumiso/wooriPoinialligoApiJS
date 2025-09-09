// handlers/tracking/koreapost.js
// 우체국택배 조회 구현

const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeDeliveryStatus, formatDateTime } = require('./common');

/**
 * 우체국택배 배송 조회
 * @param {string} trackingNumber - 송장번호  
 * @returns {Promise<Object>} 배송 정보
 */
const trackKoreaPost = async (trackingNumber) => {
  try {
    console.log(`🔍 우체국택배 조회 시작: ${trackingNumber}`);
    
    // 송장번호 정규화 (숫자만)
    const normalizedNumber = trackingNumber.replace(/[^0-9]/g, '');
    
    // 우체국 택배 조회 URL
    const url = 'https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm';
    
    // POST 요청으로 조회
    const response = await axios.post(url,
      `sid1=${normalizedNumber}&displayHeader=N`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9',
          'Referer': 'https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm'
        }
      }
    );
    
    // HTML 파싱 (스크립트 태그 제거)
    const $ = cheerio.load(response.data);
    $('script').remove(); // 스크립트 태그 제거
    $('style').remove();  // 스타일 태그 제거
    
    // 배송 정보 추출
    const trackingData = {
      trackingNumber: normalizedNumber,
      courierCode: 'koreapost',
      courierName: '우체국택배'
    };
    
    // 오류 체크
    if (response.data.includes('배송정보를 찾을 수 없습니다') || 
        response.data.includes('등기번호를 다시 확인')) {
      throw new Error('조회된 배송 정보가 없습니다. 송장번호를 확인해주세요.');
    }
    
    // 기본 정보 추출
    const infoTable = $('.table_col').first();
    if (infoTable.length > 0) {
      const rows = infoTable.find('tr');
      
      rows.each((i, row) => {
        const $row = $(row);
        const header = $row.find('th').text().trim();
        const value = $row.find('td').text().trim();
        
        if (header.includes('보내는 사람')) {
          trackingData.senderName = value.split('/')[0].trim();
        } else if (header.includes('받는 사람')) {
          trackingData.receiverName = value.split('/')[0].trim();
        } else if (header.includes('배달 예정일')) {
          trackingData.expectedDeliveryDate = value;
        }
      });
    }
    
    // 현재 배송 상태
    let currentStatus = '조회중';
    let isDelivered = false;
    
    // 배송 진행 상황 파싱
    const progresses = [];
    const progressTable = $('.table_col').eq(1); // 두 번째 테이블이 진행 상황
    
    if (progressTable.length > 0) {
      progressTable.find('tbody tr').each((index, element) => {
        const row = $(element);
        const cells = row.find('td');
        
        if (cells.length >= 4) {
          const dateTime = cells.eq(0).text().trim() + ' ' + cells.eq(1).text().trim(); // 날짜 + 시간
          const location = cells.eq(2).text().trim(); // 발생국
          let status = cells.eq(3).text().trim();   // 처리현황
          
          // 상태 텍스트 정리 (첫 줄만 추출)
          status = status.split('\n')[0].trim();
          status = status.replace(/\s+/g, ' '); // 중복 공백 제거
          
          if (dateTime && status) {
            progresses.push({
              dateTime: formatDateTime(dateTime),
              location: location || '',
              status: status,
              description: status
            });
            
            // 배송완료 체크
            if (status.includes('배달완료')) {
              currentStatus = '배송완료';
              isDelivered = true;
              trackingData.dateDelivered = formatDateTime(dateTime);
            } else if (status.includes('배달준비')) {
              currentStatus = '배송중';
            } else if (status.includes('접수')) {
              currentStatus = '접수';
            } else if (status.includes('발송')) {
              currentStatus = '발송';
            }
          }
        }
      });
    }
    
    // 진행 상황이 있으면 마지막 상태로 현재 상태 업데이트
    if (progresses.length > 0) {
      const lastProgress = progresses[progresses.length - 1];
      if (lastProgress.status.includes('배달완료')) {
        currentStatus = '배송완료';
        isDelivered = true;
      } else if (lastProgress.status.includes('배달준비') || lastProgress.status.includes('배달출발')) {
        currentStatus = '배송중';
      }
    }
    
    trackingData.deliveryStatus = normalizeDeliveryStatus(currentStatus);
    trackingData.deliveryStatusText = currentStatus;
    trackingData.progresses = progresses;
    
    // 송장번호가 유효하지 않은 경우
    if (progresses.length === 0) {
      throw new Error('조회된 배송 정보가 없습니다. 송장번호를 확인해주세요.');
    }
    
    console.log(`✅ 우체국택배 조회 성공: ${trackingNumber}`);
    return trackingData;
    
  } catch (error) {
    console.error(`❌ 우체국택배 조회 실패: ${error.message}`);
    
    if (error.response) {
      console.error('응답 상태:', error.response.status);
    }
    
    throw error;
  }
};

module.exports = {
  trackKoreaPost
};