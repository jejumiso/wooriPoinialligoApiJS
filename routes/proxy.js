/**
 * 범용 프록시 라우트
 *
 * 받은 요청을 목적지 URL로 그대로 전달만 합니다.
 * 서명, 토큰, 변환 등 비즈니스 로직 없음.
 * 고정 IP가 필요한 모든 프로젝트에서 재사용 가능.
 *
 * 보안: x-proxy-key 헤더로 인증
 *
 * 지원하는 요청 형식:
 * - JSON (application/json)
 * - Form (application/x-www-form-urlencoded)
 * - 파일 업로드 (multipart/form-data) — /upload 엔드포인트
 * - XML/SOAP (text/xml, application/xml)
 * - 기타 모든 Content-Type
 *
 * 엔드포인트:
 *   POST /api/proxy         — JSON/Form/XML 요청 전달
 *   POST /api/proxy/upload  — 파일 업로드 전달 (multipart)
 */

const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const router = express.Router();

const PROXY_KEY = 'farmfree-proxy-2026';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// URL 형식 검증 (모든 도메인 허용)
function validateUrl(targetUrl) {
  try {
    new URL(targetUrl);
    return null;
  } catch {
    return '잘못된 URL입니다';
  }
}

// API 키 검증
function validateKey(req) {
  return req.headers['x-proxy-key'] === PROXY_KEY;
}

/**
 * POST /api/proxy
 * JSON, Form, XML 등 일반 요청 전달
 */
router.post('/', async (req, res) => {
  if (!validateKey(req)) {
    return res.status(403).json({ error: '인증 실패' });
  }

  const { targetUrl, method, headers, body } = req.body;

  if (!targetUrl) {
    return res.status(400).json({ error: 'targetUrl은 필수입니다' });
  }

  const urlError = validateUrl(targetUrl);
  if (urlError) {
    return res.status(400).json({ error: urlError });
  }

  try {
    const response = await axios({
      method: method || 'GET',
      url: targetUrl,
      headers: headers || {},
      data: body,
      timeout: 30000,
      validateStatus: () => true,
      transformResponse: [(data) => data],
    });

    const contentType = response.headers['content-type'] || '';
    res.status(response.status);

    if (contentType.includes('application/json')) {
      try {
        res.json(JSON.parse(response.data));
      } catch {
        res.send(response.data);
      }
    } else {
      res.set('content-type', contentType);
      res.send(response.data);
    }
  } catch (error) {
    console.error('프록시 전달 실패:', error.message);
    res.status(502).json({ error: '프록시 전달 실패', message: error.message });
  }
});

/**
 * POST /api/proxy/upload
 * 파일 업로드 (multipart/form-data) 전달
 *
 * 사용법:
 *   FormData로 전송:
 *     - targetUrl: 목적지 URL (필수)
 *     - headers: JSON 문자열 (선택)
 *     - files: 업로드할 파일들
 *     - 기타 필드: 그대로 전달
 */
router.post('/upload', upload.any(), async (req, res) => {
  if (!validateKey(req)) {
    return res.status(403).json({ error: '인증 실패' });
  }

  const { targetUrl } = req.body;

  if (!targetUrl) {
    return res.status(400).json({ error: 'targetUrl은 필수입니다' });
  }

  const urlError = validateUrl(targetUrl);
  if (urlError) {
    return res.status(400).json({ error: urlError });
  }

  try {
    // 새 FormData 생성
    const formData = new FormData();

    // 파일 추가
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        formData.append(file.fieldname || 'files', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      }
    }

    // 기타 필드 추가 (targetUrl, headers 제외)
    for (const [key, value] of Object.entries(req.body)) {
      if (key !== 'targetUrl' && key !== 'headers') {
        formData.append(key, value);
      }
    }

    // 추가 헤더 파싱
    let extraHeaders = {};
    if (req.body.headers) {
      try {
        extraHeaders = JSON.parse(req.body.headers);
      } catch {}
    }

    const response = await axios({
      method: 'POST',
      url: targetUrl,
      headers: {
        ...formData.getHeaders(),
        ...extraHeaders,
      },
      data: formData,
      timeout: 60000, // 파일 업로드는 60초
      validateStatus: () => true,
      maxContentLength: 20 * 1024 * 1024,
      maxBodyLength: 20 * 1024 * 1024,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('프록시 파일 업로드 실패:', error.message);
    res.status(502).json({ error: '프록시 파일 업로드 실패', message: error.message });
  }
});

module.exports = router;
