// handlers/aligoHandlers.js
const aligoapi = require('aligoapi');
const AuthData = require('../config/auth');

// 플러스친구 - 카테고리 조회
const profileCategory = (req, res) => {
    aligoapi.profileCategory(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 플러스친구 - 인증 요청
const profileAuth = (req, res) => {
    aligoapi.profileAuth(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 플러스친구 - 친구등록 심사요청
const profileAdd = (req, res) => {
    aligoapi.profileAdd(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 템플릿 리스트 조회
const templateList = (req, res) => {
    aligoapi.templateList(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 템플릿 등록
const templateAdd = (req, res) => {
    aligoapi.templateAdd(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 템플릿 수정
const templateModify = (req, res) => {
    aligoapi.templateModify(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 템플릿 삭제
const templateDel = (req, res) => {
    aligoapi.templateDel(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 알림톡 전송
const alimtalkSend = (req, res) => {
    aligoapi.alimtalkSend(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

module.exports = {
    profileCategory,
    profileAuth,
    profileAdd,
    templateList,
    templateAdd,
    templateModify,
    templateDel,
    alimtalkSend
};
