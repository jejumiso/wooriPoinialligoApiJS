// handlers/tracking/lotte.js
// 롯데택배 조회 구현

const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeDeliveryStatus, formatDateTime } = require('./common');

/**
 * 롯데택배 배송 조회
 * @param {string} trackingNumber - 송장번호
 * @returns {Promise<Object>} 배송 정보
 */
const trackLotte = async (trackingNumber) => {
  try {
    console.log(`🔍 롯데택배 조회 시작: ${trackingNumber}`);
    
    // 송장번호 정규화 (하이픈 제거, 숫자만)
    const normalizedNumber = trackingNumber.replace(/[^0-9]/g, '');
    
    // 롯데택배 조회 URL (POST 방식)
    const url = 'https://www.lotteglogis.com/home/reservation/tracking/linkView';
    
    // POST 요청으로 조회
    const response = await axios.post(url, 
      `InvNo=${normalizedNumber}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Referer': 'https://www.lotteglogis.com/home/reservation/tracking/index',
          'Origin': 'https://www.lotteglogis.com'
        }
      }
    );
    
    // HTML 파싱
    const $ = cheerio.load(response.data);
    
    // 배송 정보 추출
    const trackingData = {
      trackingNumber: normalizedNumber,
      courierCode: 'lotte',
      courierName: '롯데택배'
    };
    
    // 디버깅용 로그
    console.log('응답 받음, HTML 길이:', response.data.length);
    
    // 오류 체크 - 송장번호가 없거나 유효하지 않은 경우
    if (response.data.includes('송장번호를 확인해주세요') || 
        response.data.includes('조회된 정보가 없습니다') ||
        response.data.includes('조회결과가 없습니다')) {
      console.log('오류 메시지 발견');
      throw new Error('조회된 배송 정보가 없습니다. 송장번호를 확인해주세요.');
    }
    
    // 기본 정보 추출 (상단 정보 테이블)
    const basicInfoTable = $('.tbl_type01').first();
    if (basicInfoTable.length > 0) {
      const rows = basicInfoTable.find('tr');
      
      rows.each((i, row) => {
        const $row = $(row);
        const headers = $row.find('th');
        const cells = $row.find('td');
        
        headers.each((j, header) => {
          const headerText = $(header).text().trim();
          const cellText = cells.eq(j).text().trim();
          
          if (headerText.includes('보내는분')) {
            trackingData.senderName = cellText;
          } else if (headerText.includes('받는분')) {
            trackingData.receiverName = cellText;
          } else if (headerText.includes('상품명')) {
            trackingData.productName = cellText;
          } else if (headerText.includes('수량')) {
            trackingData.productQuantity = parseInt(cellText) || 1;
          }
        });
      });
    }
    
    // 현재 배송 상태 확인 - 스텝 이미지나 진행 단계에서 추출
    let currentStatus = '조회중';
    let isDelivered = false;
    
    // 스텝 단계 확인 (step01~step05)
    const stepImages = $('.step_wrap img');
    if (stepImages.length > 0) {
      const lastStepSrc = stepImages.last().attr('src') || '';
      if (lastStepSrc.includes('step05') || lastStepSrc.includes('완료')) {
        currentStatus = '배송완료';
        isDelivered = true;
      } else if (lastStepSrc.includes('step04')) {
        currentStatus = '배송중';
      } else if (lastStepSrc.includes('step03')) {
        currentStatus = '간선상차';
      } else if (lastStepSrc.includes('step02')) {
        currentStatus = '집하';
      } else if (lastStepSrc.includes('step01')) {
        currentStatus = '접수';
      }
    }
    
    // 배송 진행 상황 파싱 (하단 상세 테이블)
    const progresses = [];
    
    // 여러 가능한 테이블 클래스 시도
    let progressTable = $('.tbl_type02').last();
    if (progressTable.length === 0) {
      progressTable = $('.tbl_type01').last();
    }
    if (progressTable.length === 0) {
      progressTable = $('table').last();
    }
    
    console.log('진행상황 테이블 찾음:', progressTable.length > 0);
    
    if (progressTable.length > 0) {
      progressTable.find('tbody tr').each((index, element) => {
        const row = $(element);
        const cells = row.find('td');
        
        if (cells.length >= 4) {
          const status = cells.eq(0).text().trim();   // 배송상태
          const dateTime = cells.eq(1).text().trim(); // 처리일시
          const location = cells.eq(2).text().trim(); // 위치
          const details = cells.eq(3).text().trim();  // 상세내역
          
          if (dateTime && status) {
            progresses.push({
              dateTime: formatDateTime(dateTime),
              location: location || '',
              status: status,
              description: details || status
            });
            
            // 배송완료 체크 및 시간 저장
            if ((status.includes('배달완료') || status.includes('배송완료') || status.includes('배달 완료')) && !trackingData.dateDelivered) {
              currentStatus = '배송완료';
              isDelivered = true;
              trackingData.dateDelivered = formatDateTime(dateTime);
            }
          }
        }
      });
    }
    
    // 진행 상황이 있으면 첫번째(최신) 상태로 현재 상태 업데이트
    if (progresses.length > 0) {
      const firstProgress = progresses[0]; // 첫번째가 최신 상태
      if (firstProgress.status.includes('배달완료') || firstProgress.status.includes('배송완료') || firstProgress.status.includes('배달 완료')) {
        currentStatus = '배송완료';
        isDelivered = true;
      } else if (firstProgress.status.includes('배송출발') || firstProgress.status.includes('배송 출발')) {
        currentStatus = '배송중';
      } else if (firstProgress.status.includes('간선')) {
        currentStatus = '간선이동';
      } else if (firstProgress.status.includes('집하') || firstProgress.status.includes('인수')) {
        currentStatus = '집하';
      }
    }
    
    trackingData.deliveryStatus = normalizeDeliveryStatus(currentStatus);
    trackingData.deliveryStatusText = currentStatus;
    trackingData.progresses = progresses; // 시간순 정렬 유지
    
    console.log('최종 데이터 - 진행상황:', progresses.length, '수령인:', trackingData.receiverName);
    
    // 송장번호가 유효하지 않은 경우 - 진행 상황이 없고 수령인도 없고 HTML이 너무 짧은 경우만
    if (progresses.length === 0 && !trackingData.receiverName && response.data.length < 1000) {
      throw new Error('조회된 배송 정보가 없습니다. 송장번호를 확인해주세요.');
    }
    
    console.log(`✅ 롯데택배 조회 성공: ${trackingNumber}`);
    return trackingData;
    
  } catch (error) {
    console.error(`❌ 롯데택배 조회 실패: ${error.message}`);
    
    // 에러 상세 정보
    if (error.response) {
      console.error('응답 상태:', error.response.status);
    }
    
    throw error;
  }
};

module.exports = {
  trackLotte
};