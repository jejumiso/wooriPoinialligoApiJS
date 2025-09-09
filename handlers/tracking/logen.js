// handlers/tracking/logen.js
// 로젠택배 조회 구현

const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeDeliveryStatus, formatDateTime } = require('./common');

/**
 * 로젠택배 배송 조회
 * @param {string} trackingNumber - 송장번호
 * @returns {Promise<Object>} 배송 정보
 */
const trackLogen = async (trackingNumber) => {
  try {
    console.log(`🔍 로젠택배 조회 시작: ${trackingNumber}`);
    
    // 송장번호 정규화 (숫자만)
    const normalizedNumber = trackingNumber.replace(/[^0-9]/g, '');
    
    // 로젠택배 조회 URL
    const url = 'https://www.ilogen.com/web/personal/trace/' + normalizedNumber;
    
    // GET 요청으로 조회
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'Referer': 'https://www.ilogen.com/web/personal/tkSearch'
      }
    });
    
    // HTML 파싱
    const $ = cheerio.load(response.data);
    
    // 배송 정보 추출
    const trackingData = {
      trackingNumber: normalizedNumber,
      courierCode: 'logen',
      courierName: '로젠택배'
    };
    
    // 오류 체크
    if (response.data.includes('조회된 데이터가 없습니다') || 
        response.data.includes('운송장 번호를 확인')) {
      throw new Error('조회된 배송 정보가 없습니다. 송장번호를 확인해주세요.');
    }
    
    // 기본 정보 추출 (상단 정보 테이블)
    const infoSection = $('.horizon_tbl').first();
    if (infoSection.length > 0) {
      const rows = infoSection.find('tr');
      
      rows.each((i, row) => {
        const $row = $(row);
        const headers = $row.find('th');
        const cells = $row.find('td');
        
        headers.each((j, header) => {
          const headerText = $(header).text().trim();
          const cellText = cells.eq(j).text().trim();
          
          if (headerText.includes('보내는 분')) {
            trackingData.senderName = cellText;
          } else if (headerText.includes('받는 분')) {
            trackingData.receiverName = cellText;
          } else if (headerText.includes('상품명')) {
            trackingData.productName = cellText;
          } else if (headerText.includes('수량')) {
            trackingData.productQuantity = parseInt(cellText) || 1;
          }
        });
      });
    }
    
    // 현재 배송 상태
    let currentStatus = '조회중';
    let isDelivered = false;
    
    // 배송 상태 스텝 확인
    const statusSteps = $('.step_area .on');
    if (statusSteps.length > 0) {
      const lastStep = statusSteps.last().text().trim();
      if (lastStep.includes('배송완료')) {
        currentStatus = '배송완료';
        isDelivered = true;
      } else if (lastStep.includes('배송중') || lastStep.includes('배송출발')) {
        currentStatus = '배송중';
      } else if (lastStep.includes('상품인수')) {
        currentStatus = '집하';
      }
    }
    
    // 배송 진행 상황 파싱
    const progresses = [];
    const progressTable = $('.horizon_tbl').last();
    
    if (progressTable.length > 0) {
      progressTable.find('tbody tr').each((index, element) => {
        const row = $(element);
        const cells = row.find('td');
        
        if (cells.length >= 4) {
          const dateTime = cells.eq(0).text().trim(); // 날짜/시간
          const location = cells.eq(1).text().trim(); // 현재위치
          const status = cells.eq(2).text().trim();   // 배송상태
          const details = cells.eq(3).text().trim();  // 상세내용
          
          if (dateTime && status) {
            progresses.push({
              dateTime: formatDateTime(dateTime),
              location: location || '',
              status: status,
              description: details || status
            });
            
            // 배송완료 체크
            if (status.includes('배송완료') || status.includes('배달완료')) {
              currentStatus = '배송완료';
              isDelivered = true;
              trackingData.dateDelivered = formatDateTime(dateTime);
            } else if (status.includes('배송출발')) {
              currentStatus = '배송중';
            } else if (status.includes('상품인수') || status.includes('집하')) {
              currentStatus = '집하';
            } else if (status.includes('간선')) {
              currentStatus = '간선이동';
            }
          }
        }
      });
    }
    
    // 진행 상황이 있으면 마지막 상태로 현재 상태 업데이트
    if (progresses.length > 0) {
      const lastProgress = progresses[progresses.length - 1];
      if (lastProgress.status.includes('배송완료') || lastProgress.status.includes('배달완료')) {
        currentStatus = '배송완료';
        isDelivered = true;
      } else if (lastProgress.status.includes('배송출발') || lastProgress.status.includes('배송중')) {
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
    
    console.log(`✅ 로젠택배 조회 성공: ${trackingNumber}`);
    return trackingData;
    
  } catch (error) {
    console.error(`❌ 로젠택배 조회 실패: ${error.message}`);
    
    if (error.response) {
      console.error('응답 상태:', error.response.status);
    }
    
    throw error;
  }
};

module.exports = {
  trackLogen
};