// routes/daesin.js
// 대신택배 프록시 - Cloud Run에서 직접 접근이 차단되어 카페24 서버를 통해 우회

const express = require('express');
const axios = require('axios');
const iconv = require('iconv-lite');
const router = express.Router();

/**
 * 대신택배 조회 프록시
 * GET /api/daesin/track?billno=5611502022792
 *
 * 대신택배 서버에서 EUC-KR로 응답하므로 UTF-8로 변환하여 반환
 */
router.get('/track', async (req, res) => {
    try {
        const { billno } = req.query;

        if (!billno) {
            return res.status(400).json({
                success: false,
                error: 'billno 파라미터가 필요합니다.'
            });
        }

        // 대신택배 조회 URL
        const url = `https://www.ds3211.co.kr/freight/internalFreightSearch.ht?billno=${billno}`;

        // 대신택배 서버 요청 (EUC-KR 인코딩)
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 30000,
        });

        // EUC-KR → UTF-8 변환
        const html = iconv.decode(Buffer.from(response.data), 'euc-kr');

        // UTF-8 HTML 반환
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);

    } catch (error) {
        console.error('대신택배 프록시 에러:', error.message);

        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({
                success: false,
                error: '대신택배 서버 응답 시간 초과'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
