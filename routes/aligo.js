// routes/aligo.js
const express = require('express');
const aligoapi = require('aligoapi');
const router = express.Router();
const AuthData = require('../config/auth');

// 플러스친구 - 인증요청
router.post('/profileAuth', (req, res) => {
    aligoapi.profileAuth(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
});

// 플러스친구 - 카테고리 조회
router.get('/profileCategory', (req, res) => {
    aligoapi.profileCategory(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
});

// 플러스친구 - 친구등록 심사요청
router.post('/profileAdd', (req, res) => {
    aligoapi.profileAdd(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
});

// 플러스친구 - 등록된 플러스친구 리스트
router.get('/friendList', (req, res) => {
    aligoapi.friendList(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
});

// 템플릿 관리 API 예제 (이하 동일하게 작성)
router.get('/templateList', (req, res) => {
    aligoapi.templateList(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
});

router.post('/templateAdd', (req, res) => {
    aligoapi.templateAdd(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
});

router.post('/templateModify', (req, res) => {
    aligoapi.templateModify(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
});

router.post('/templateDel', (req, res) => {
    aligoapi.templateDel(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
});

router.post('/alimtalkSend', (req, res) => {
    aligoapi.alimtalkSend(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
});

module.exports = router;
