// web.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // CORS 미들웨어 추가
const aligoRoutes = require('./routes/aligo');

const app = express();
const PORT = 8001;

// CORS 설정: 모든 도메인에서의 요청 허용
app.use(cors());

// JSON 요청 파싱 설정
app.use(bodyParser.json());

// 알리고 API 경로 설정
app.use('/api/aligo', aligoRoutes);

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
