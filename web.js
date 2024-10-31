// web.js
const express = require('express');
const bodyParser = require('body-parser');
const aligoRoutes = require('./routes/aligo');

const app = express();
const PORT = 8001;

// JSON 요청 파싱 설정
app.use(bodyParser.json());

// 알리고 API 경로 설정
app.use('/api/aligo', aligoRoutes);

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
