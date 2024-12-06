const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 8001;

// CORS 설정
app.use(cors({
    origin: '*', // 모든 도메인 허용 (필요시 특정 도메인으로 제한 가능)
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'], // 허용할 HTTP 메서드
    allowedHeaders: ['Content-Type', 'Authorization'], // 허용할 헤더
}));

app.options('*', cors()); // 모든 OPTIONS 요청 허용

// 프록시 처리
app.all('/proxy/*', async (req, res) => {
    try {
        const targetUrl = req.originalUrl.replace('/proxy', 'http://wooripoint.cafe24.com');
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.body,
            headers: { ...req.headers, host: undefined }, // Host 헤더 제거
        });
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('프록시 요청 중 오류:', error.message);
        res.status(error.response?.status || 500).send(error.message);
    }
});

app.use(bodyParser.json());
app.listen(PORT, () => {
    console.log(`프록시 서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
