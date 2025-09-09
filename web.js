// web.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // CORS 미들웨어 추가
const aligoRoutes = require('./routes/aligo');
const bootpayRoutes = require('./routes/bootpay'); // 새로 추가
const encryptionRoutes = require('./routes/encryption'); // 새로 추가
const nicepayRoutes = require('./routes/nicePay'); // 새로 추가
const smartstoreRoutes = require('./routes/smartstore'); // 스마트스토어 추가
const trackingRoutes = require('./routes/tracking'); // 택배 조회 추가


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
app.use('/api/tracking', trackingRoutes); // 택배 조회 API 경로



// 서버 시작
app.listen(PORT, () => {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`서버 시작 시간: ${year}년 ${month}월 ${day}일 ${period} ${displayHours}시 ${minutes}분`);
});
