// web.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // CORS 미들웨어 추가
const aligoRoutes = require('./routes/aligo');
const bootpayRoutes = require('./routes/bootpay'); // 새로 추가
const encryptionRoutes = require('./routes/encryption'); // 새로 추가
const nicepayRoutes = require('./routes/nicePay'); // 새로 추가
const smartstoreRoutes = require('./routes/smartstore'); // 스마트스토어 추가
const daesinRoutes = require('./routes/daesin'); // 대신택배 프록시
const nicepayBillingRoutes = require('./routes/nicepayBilling'); // 나이스페이 빌링 프록시
const proxyRoutes = require('./routes/proxy'); // 범용 프록시 (고정IP 전달)


const app = express();
const PORT = 8001;

// CORS 설정: 모든 도메인에서의 요청 허용
app.use(cors());

// JSON 요청 파싱 설정
app.use(bodyParser.json());

// 알리고 API 경로 설정
app.use('/api/aligo', aligoRoutes);
app.use('/api/bootpay', bootpayRoutes);
app.use('/api/encryption', encryptionRoutes);
app.use('/api/nicepay', nicepayRoutes);
app.use('/api/smartstore', smartstoreRoutes); // 스마트스토어 API 경로
app.use('/api/daesin', daesinRoutes); // 대신택배 프록시
app.use('/api/nicepay-billing', nicepayBillingRoutes); // 나이스페이 빌링 프록시
app.use('/api/proxy', proxyRoutes); // 범용 프록시 (어떤 프로젝트든 사용 가능)



// 서버 시작
app.listen(PORT, () => {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = now.getMonth() + 1;
    const monthStr = month < 10 ? '0' + month : String(month);
    const day = now.getDate();
    const dayStr = day < 10 ? '0' + day : String(day);
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const minutesStr = minutes < 10 ? '0' + minutes : String(minutes);
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`서버 시작 시간: ${year}년 ${monthStr}월 ${dayStr}일 ${period} ${displayHours}시 ${minutesStr}분`);
});
