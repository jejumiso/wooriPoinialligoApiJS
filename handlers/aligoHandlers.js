// handlers/aligoHandlers.js
const aligoapi = require('aligoapi');
const AuthData = require('../config/auth');

// 플러스친구 - 인증 요청
const profileAuth = (req, res) => {
    aligoapi.profileAuth(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 플러스친구 - 카테고리 조회
const profileCategory = (req, res) => {
    aligoapi.profileCategory(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 플러스친구 - 친구등록 심사요청
const profileAdd = (req, res) => {
    aligoapi.profileAdd(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 플러스친구 - 등록된 플러스친구 리스트
const friendList = (req, res) => {
    aligoapi.friendList(req, AuthData)
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

// 템플릿 검수 요청
const templateRequest = (req, res) => {
    aligoapi.templateRequest(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 알림톡 전송
const alimtalkSend = (req, res) => {
    aligoapi.alimtalkSend(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 전송결과보기
const historyList = (req, res) => {
    aligoapi.historyList(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 전송결과 상세 보기
const historyDetail = (req, res) => {
    aligoapi.historyDetail(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 발송 가능 건수 조회
const kakaoRemain = (req, res) => {
    aligoapi.kakaoRemain(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

// 예약 취소
const kakaoCancel = (req, res) => {
    aligoapi.kakaoCancel(req, AuthData)
        .then((r) => res.send(r))
        .catch((e) => res.send(e));
};

module.exports = {
    profileAuth,
    profileCategory,
    profileAdd,
    friendList,
    templateList,
    templateAdd,
    templateModify,
    templateDel,
    templateRequest,
    alimtalkSend,
    historyList,
    historyDetail,
    kakaoRemain,
    kakaoCancel
};
