// web.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // CORS 미들웨어 추가
const axios = require('axios'); // axios 추가

const app = express();
const PORT = 8001;

// CORS 설정: 모든 도메인에서의 요청 허용
app.use(cors());

// JSON 요청 파싱 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // URL-encoded 요청도 허용

// 프록시 엔드포인트
app.all("/proxy/*", async (req, res) => {
    try {
        // 프록시 대상 URL 생성
        const targetUrl = "http://kakakoalligoapi.cafe24.com" + req.originalUrl.replace("/proxy", "");
        console.log(`Proxying request to: ${targetUrl}`);

        // Axios를 사용하여 요청 전달
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.body,
            headers: {
                ...req.headers,
                host: undefined, // 호스트 헤더 제거 (필요 시 추가)
            },
        });

        // 클라이언트에 응답 전달
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error(`Error proxying request: ${error.message}`);
        res.status(500).send({ error: 'Proxy error', message: error.message });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
