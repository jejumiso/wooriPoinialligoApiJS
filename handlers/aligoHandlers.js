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

const alimtalkSend = (req, res) => {
    const { button_1 } = req.body;

    // button_1이 배열인 경우와 객체인 경우 모두 처리 가능하게 설정
    if (Array.isArray(button_1)) {
        // 배열을 각각의 버튼 객체로 처리하는 로직 추가
        button_1.forEach(button => {
            // 각 버튼에 필요한 데이터가 있는지 확인하고 처리
            if (button.name && button.linkType) {
                // 버튼 처리 로직 (예시)
                console.log(`버튼 이름: ${button.name}, 링크 타입: ${button.linkType}`);
            }
        });
    } else if (button_1 && typeof button_1 === "object") {
        // 단일 객체로 전송된 경우의 처리
        console.log(`버튼 이름: ${button_1.name}, 링크 타입: ${button_1.linkType}`);
    } else {
        return res.status(400).send({ message: "button_1 형식이 잘못되었습니다." });
    }

    // 이후 알림톡 전송 프로세스 로직
    aligoapi.alimtalkSend(req, AuthData)
        .then((response) => {
            res.status(200).send(response);  // 성공 응답
        })
        .catch((error) => {
            console.error("알림톡 전송 오류:", error);  // 오류 로깅
            res.status(500).send({
                message: "알림톡 전송 중 오류가 발생했습니다. 다시 시도해 주세요.",
                error: error.message || error  // 사용자에게 기본 메시지와 함께 오류 정보 제공
            });
        });
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
