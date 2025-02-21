### 2.3.2
* 배송등록 api 필드 추가 

### 2.3.1
* requestSubscribePayment 함수 추가 

### 2.3.0
* 계좌 자동 결제 추가 

### 2.1.11
* 필드명 back_username -> bank_username 으로 오타 수정

### 2.1.4
* 날짜 타입을 string -> Date 로 명시적으로 수정 

### 2.1.3
* 정기결제요청시 feedback_url, metadata, content_type 파라미터 정의 추가 

### 2.1.2
* 버전 재배포 

### 2.1.1
* 정기결제 예약시 order_id 파라미터 정의 추가 

### 2.1.0 
* 결제취소 요청시 refund optional 로 수정 

### 2.0.9 ( Stable )

* 네이버페이 포인트, 페이코포인트, 카카오머니, 토스포인트 결제시 리턴되는 포맷 interface 추가 정의

### 2.0.8

* 현금영수증 cash_receipt_data interface 정의

### 2.0.7

* inteface model 정의 parameters 누락 및 optional 체크
* 현금영수증 별건 발행 / 취소 API 추가

### 2.0.6

* SubscriptionBillingResponseParameters interface 누락된 값 추가 ( status, status_locale, gateway_url, method_symbol )

### 2.0.5

* typescript에서 TS7016 root에서 import가 되지 않는 문제 해결

### 2.0.4

* package.json import가 되지 않는 환경 예외처리

### 2.0.3

* 기존 결제 현금영수증 발행
* 별건 현금영수증 발행
* REST API 통신 요청시 Header에 버전 및 SDK 종류 명시 ( 부트페이 서버에서 CS용으로 수집 )

### 2.0.0

새로운 v2 API에 맞도록 수정