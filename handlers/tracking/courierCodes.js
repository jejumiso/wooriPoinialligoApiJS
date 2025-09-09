// handlers/tracking/courierCodes.js
// 택배사 정보 및 조회 URL 관리

const COURIER_COMPANIES = {
  lotte: {
    name: '롯데택배',
    url: 'https://www.lotteglogis.com/home/reservation/tracking/index',
    trackingUrl: 'https://www.lotteglogis.com/home/reservation/tracking/linkView',
    method: 'scraping',
    active: true
  },
  epost: {
    name: '우체국택배',
    url: 'https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm',
    trackingUrl: 'https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm',
    method: 'scraping',
    active: true
  },
  cj: {
    name: 'CJ대한통운',
    url: 'https://trace.cjlogistics.com/next/tracking.html',
    trackingUrl: 'https://trace.cjlogistics.com/next/tracking.html',
    method: 'scraping',
    active: true
  },
  logen: {
    name: '로젠택배',
    url: 'https://www.ilogen.com/web/personal/trace/',
    trackingUrl: 'https://www.ilogen.com/web/personal/trace/',
    method: 'scraping',
    active: true
  },
  hanjin: {
    name: '한진택배',
    url: 'https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do',
    trackingUrl: 'https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do',
    method: 'scraping',
    active: true
  },
  ilyanglogis: {
    name: '일양로지스',
    url: 'https://www.ilyanglogis.com',
    trackingUrl: 'https://www.ilyanglogis.com/functionality/tracking.asp',
    method: 'scraping',
    active: true
  }
};

// 택배사 코드로 정보 조회
const getCourierInfo = (courierCode) => {
  const courier = COURIER_COMPANIES[courierCode];
  if (!courier) {
    throw new Error(`지원하지 않는 택배사 코드: ${courierCode}`);
  }
  return courier;
};

// 활성화된 택배사 목록
const getActiveCouriers = () => {
  return Object.entries(COURIER_COMPANIES)
    .filter(([code, info]) => info.active)
    .map(([code, info]) => ({
      code,
      name: info.name,
      method: info.method
    }));
};

module.exports = {
  COURIER_COMPANIES,
  getCourierInfo,
  getActiveCouriers
};