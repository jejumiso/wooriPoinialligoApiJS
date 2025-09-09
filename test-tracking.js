// 택배 조회 API 테스트
const axios = require('axios');

const API_BASE = 'http://localhost:8001/api/tracking';

// 테스트할 택배 정보들 (실제 송장번호)
const testCases = [
  {
    name: 'CJ대한통운',
    courierCode: 'cj', 
    trackingNumber: '689787060824'
  },
  {
    name: '롯데택배',
    courierCode: 'lotte',
    trackingNumber: '408494135210'  
  },
  {
    name: '우체국택배',
    courierCode: 'epost',
    trackingNumber: '6896702202548'
  },
  {
    name: '한진택배',
    courierCode: 'hanjin',
    trackingNumber: '459101028304'
  },
  {
    name: '로젠택배',
    courierCode: 'logen',
    trackingNumber: '38326160493'
  },
  {
    name: '일양로지스',
    courierCode: 'ilyanglogis',
    trackingNumber: '5705664764'
  }
];

// 택배 조회 테스트
async function testTracking(testCase) {
  console.log(`\n📦 ${testCase.name} 테스트 시작...`);
  console.log(`   송장번호: ${testCase.trackingNumber}`);
  
  try {
    const response = await axios.post(`${API_BASE}/trace`, {
      courierCode: testCase.courierCode,
      trackingNumber: testCase.trackingNumber
    });
    
    if (response.data.success) {
      const data = response.data.data;
      console.log(`✅ 조회 성공!`);
      console.log(`   - 상태: ${data.deliveryStatusText}`);
      console.log(`   - 수령인: ${data.receiverName || '정보없음'}`);
      console.log(`   - 상품명: ${data.productName || '정보없음'}`);
      console.log(`   - 진행상황: ${data.progresses.length}건`);
      
      if (data.progresses.length > 0) {
        const latest = data.progresses[data.progresses.length - 1];
        console.log(`   - 최근상태: ${latest.status} (${latest.dateTime})`);
      }
    } else {
      console.log(`❌ 조회 실패: ${response.data.message}`);
    }
  } catch (error) {
    console.log(`❌ 에러 발생: ${error.response?.data?.message || error.message}`);
  }
}

// 택배사 목록 조회 테스트
async function testGetCouriers() {
  console.log('\n📋 지원 택배사 목록 조회...');
  
  try {
    const response = await axios.get(`${API_BASE}/couriers`);
    
    if (response.data.success) {
      const couriers = response.data.data.couriers;
      console.log(`✅ 총 ${couriers.length}개 택배사 지원`);
      couriers.forEach(courier => {
        console.log(`   - ${courier.name} (${courier.code})`);
      });
    }
  } catch (error) {
    console.log(`❌ 에러: ${error.message}`);
  }
}

// 메인 실행 함수
async function runTests() {
  console.log('🚀 택배 조회 API 테스트 시작\n');
  console.log('================================');
  
  // 택배사 목록 조회
  await testGetCouriers();
  
  console.log('\n================================');
  console.log('📦 개별 택배 조회 테스트\n');
  
  // 각 택배사별 테스트 (순차 실행)
  for (const testCase of testCases) {
    await testTracking(testCase);
    // 1초 대기 (API 부하 방지)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n================================');
  console.log('✨ 테스트 완료!\n');
}

// 실행
runTests().catch(console.error);