// handlers/tracking/cj.js
// CJ대한통운 택배 조회 구현

const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeDeliveryStatus, formatDateTime } = require('./common');

/**
 * CJ대한통운 배송 조회
 * @param {string} trackingNumber - 송장번호
 * @returns {Promise<Object>} 배송 정보
 */
const trackCJ = async (trackingNumber) => {
  try {
    console.log(`🔍 CJ대한통운 조회 시작: ${trackingNumber}`);
    
    // 송장번호 정규화 (하이픈 제거, 숫자만)
    const normalizedNumber = trackingNumber.replace(/[^0-9]/g, '');
    
    // 1단계: 메인 페이지에서 CSRF 토큰과 쿠키 획득
    const mainPageUrl = 'https://www.cjlogistics.com/ko/tool/parcel/tracking';
    
    console.log('CSRF 토큰 획득 중...');
    const mainPageResponse = await axios.get(mainPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9'
      }
    });
    
    // 쿠키 저장
    const cookies = mainPageResponse.headers['set-cookie'] || [];
    const cookieString = cookies.map(cookie => cookie.split(';')[0]).join('; ');
    
    // CSRF 토큰 추출 (HTML에서 찾기)
    const $ = cheerio.load(mainPageResponse.data);
    let csrfToken = $('meta[name="_csrf"]').attr('content') || 
                    $('input[name="_csrf"]').val() ||
                    '00000000-0000-0000-0000-000000000000';
    
    console.log(`CSRF 토큰: ${csrfToken}`);
    
    // 2단계: API 호출
    const apiUrl = 'https://www.cjlogistics.com/ko/tool/parcel/tracking-detail';
    
    const apiResponse = await axios.post(apiUrl, 
      `_csrf=${csrfToken}&paramInvcNo=${normalizedNumber}`,
      {
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'ko-KR,ko;q=0.9',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': 'https://www.cjlogistics.com',
          'Referer': 'https://www.cjlogistics.com/ko/tool/parcel/tracking',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'X-Requested-With': 'XMLHttpRequest',
          'Cookie': cookieString
        }
      }
    );
    
    const data = apiResponse.data;
    
    // 에러 체크
    if (!data || !data.parcelResultMap) {
      throw new Error('조회된 배송 정보가 없습니다. 송장번호를 확인해주세요.');
    }
    
    // 배송 정보 구성
    const trackingData = {
      trackingNumber: normalizedNumber,
      courierCode: 'cj',
      courierName: 'CJ대한통운'
    };
    
    // 기본 정보 추출 (parcelResultMap에서)
    if (data.parcelResultMap && data.parcelResultMap.resultList && data.parcelResultMap.resultList.length > 0) {
      const parcelInfo = data.parcelResultMap.resultList[0];
      
      trackingData.senderName = parcelInfo.sendrNm || '';
      trackingData.receiverName = parcelInfo.rcvrNm || '';
      trackingData.productName = parcelInfo.itemNm || '';
      trackingData.productQuantity = parseInt(parcelInfo.qty) || 1;
    }
    
    // 현재 배송 상태 확인
    let currentStatus = '조회중';
    let isDelivered = false;
    
    // 배송 진행 상황 파싱 (parcelDetailResultMap에서)
    const progresses = [];
    
    if (data.parcelDetailResultMap && data.parcelDetailResultMap.resultList) {
      const details = data.parcelDetailResultMap.resultList;
      
      // 마지막 상태로 현재 상태 판단
      if (details.length > 0) {
        const lastDetail = details[details.length - 1];
        if (lastDetail.crgSt === '91' || lastDetail.scanNm === '배송완료') {
          currentStatus = '배송완료';
          isDelivered = true;
        } else if (lastDetail.crgSt === '82' || lastDetail.scanNm === '배송출발') {
          currentStatus = '배송중';
        } else if (lastDetail.crgSt === '11' || lastDetail.scanNm === '집화처리') {
          currentStatus = '접수';
        } else {
          currentStatus = lastDetail.scanNm || '배송중';
        }
      }
      
      // 진행 상황 목록 생성
      details.forEach(detail => {
        const dateTime = detail.dTime || '';
        const location = detail.regBranNm || '';
        const status = detail.scanNm || '';
        const description = detail.crgNm || '';
        
        // 배송 담당자 정보 추출 (crgNm에서)
        let driverInfo = '';
        const driverMatch = description.match(/\(.*?(\d{3}-\d{4}-\d{4})\)/);
        if (driverMatch) {
          driverInfo = driverMatch[0];
        }
        
        progresses.push({
          dateTime: dateTime,
          location: location,
          status: status,
          description: description
        });
        
        // 배달완료 시간 저장
        if (detail.crgSt === '91' && !trackingData.dateDelivered) {
          trackingData.dateDelivered = dateTime;
        }
      });
    }
    
    trackingData.deliveryStatus = normalizeDeliveryStatus(currentStatus);
    trackingData.deliveryStatusText = currentStatus;
    trackingData.progresses = progresses; // 이미 시간순으로 정렬됨
    
    console.log(`✅ CJ대한통운 조회 성공: ${trackingNumber}`);
    return trackingData;
    
  } catch (error) {
    console.error(`❌ CJ대한통운 조회 실패: ${error.message}`);
    
    // 에러 상세 정보
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
    
    throw error;
  }
};

module.exports = {
  trackCJ
};