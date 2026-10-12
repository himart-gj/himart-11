/**
 * [롯데하이마트 경기광주점] 구글 스프레드시트 & 자동 확정 SMS 발송 Google Apps Script (Code.gs)
 * 
 * ==============================================================================
 * [설치 및 연동 방법 - 3분 완성 가이드]
 * 1. 구글 스프레드시트 열기 -> 상단 메뉴 [확장 프로그램] -> [Apps Script] 클릭
 * 2. 기존 코드를 모두 지우고 이 파일 전체 내용을 그대로 복사(Ctrl+C)하여 붙여넣기(Ctrl+V)
 * 3. 아래 [SMS 발송 설정] 부분에서 사장님이 사용하시는 알리고(Aligo) 또는 쿨SMS(CoolSMS) 정보 입력
 *    - 알리고(Aligo): https://smartsms.aligo.in (가입 시 무료 테스트 문자 제공)
 * 4. 우측 상단 [배포] -> [새 배포] 클릭
 * 5. 유형 선택(톱니바퀴): [웹 앱(Web App)] 선택
 *    - 설명: "하이마트 예약 및 자동 SMS v2"
 *    - 다음 사용자로 실행: "나(내 계정)"
 *    - 액세스 권한이 있는 사용자: 반드시 "모든 사용자(Anyone)" 선택!
 * 6. [배포] 버튼 클릭 후 표시되는 [웹 앱 URL] 복사
 * ==============================================================================
 */

// ==============================================================================
// 1. SMS API 연동 설정 (알리고 또는 쿨SMS 중 선택하여 입력)
// ==============================================================================
const SMS_CONFIG = {
  // 사용하실 서비스: 'ALIGO' 또는 'COOLSMS'
  PROVIDER: 'ALIGO', 

  // [알리고(Aligo) 설정] - 국내 구글 시트 연동에서 가장 널리 쓰이는 간편 SMS
  ALIGO: {
    API_KEY: 'YOUR_ALIGO_API_KEY',     // 알리고에서 발급받은 API Key
    USER_ID: 'YOUR_ALIGO_USER_ID',     // 알리고 아이디
    SENDER: '031-767-1044'             // 발신 번호 (알리고에 사전 등록된 매장 번호)
  },

  // [쿨SMS/솔라피(CoolSMS) 설정]
  COOLSMS: {
    API_KEY: 'YOUR_COOLSMS_API_KEY',
    API_SECRET: 'YOUR_COOLSMS_API_SECRET',
    SENDER: '031-767-1044'
  },

  // 예약 발생 시 매장 관리자에게도 무료 알림 이메일 전송 여부
  ADMIN_EMAIL_NOTIFY: true,
  ADMIN_EMAIL: 'aa01051745672@gmail.com' // 알림 받을 관리자 이메일
};

/**
 * 웹 앱 POST 요청 핸들러 (랜딩페이지 폼 제출 수신)
 */
function doPost(e) {
  try {
    const params = e.parameter || {};
    
    // 폼 데이터 추출
    const custName = (params['이름'] || params.name || '고객').trim();
    const custPhone = (params['연락처'] || params.phone || '').trim().replace(/[^0-9]/g, ''); // 숫자만 정제
    const custType = (params['관심품목'] || params.type || '일반 상담').trim();
    const homeService = (params['추가서비스'] || params.services || '선택안함').trim();
    const trafficSource = (params['유입채널'] || params.source || '직접 방문').trim();
    const campaign = (params['광고캠페인'] || params.campaign || '-').trim();
    const storeName = params['매장명'] || '롯데하이마트 경기광주점';
    const storeTel = params['매장전화'] || '031-767-1044';

    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

    // 1. 구글 스프레드시트에 예약 데이터 기록
    const sheet = getOrCreateReservationSheet();
    
    // 2. 예약자에게 보낼 자동 확정 SMS 내용 구성 (LMS 장문 문자)
    const smsMessage = `[${storeName}] 상담 예약 접수 완료

안녕하세요, ${custName} 고객님!
1주년 리뉴얼 단독 프로모션 1:1 맞춤 상담 예약이 정상 접수되었습니다.

■ 예약 신청 내역
- 고객명: ${custName}님
- 구매 유형: ${custType}
- 제휴 추가 견적: ${homeService}
- 신청 일시: ${timestamp}

■ 매장 방문 안내
- 주소: 경기도 광주시 이배재로 8 (경안동)
- 문의: ${storeTel}

전문 가전 전문 매니저가 배정되어 확인 후 신속하게 일정 조율 및 VIP 혜택 안내 연락을 드리겠습니다.
감사합니다.`;

    // 3. SMS 발송 실행
    let smsResultText = '미발송 (API 키 설정 필요)';
    if (custPhone && custPhone.length >= 10) {
      smsResultText = dispatchSMS(custPhone, smsMessage, `[${storeName}] 예약 접수 안내`);
    } else {
      smsResultText = '발송 실패 (연락처 오류)';
    }

    // 4. 시트에 행 추가
    sheet.appendRow([
      timestamp,
      custName,
      formatPhoneNumber(custPhone),
      custType,
      homeService,
      trafficSource,
      campaign,
      smsResultText
    ]);

    // 5. 관리자 무료 이메일 알림 (옵션)
    if (SMS_CONFIG.ADMIN_EMAIL_NOTIFY && SMS_CONFIG.ADMIN_EMAIL) {
      try {
        MailApp.sendEmail({
          to: SMS_CONFIG.ADMIN_EMAIL,
          subject: `[신규 예약] ${custName}님 (${custType}) - ${storeName}`,
          body: `새로운 상담 예약이 접수되었습니다.\n\n- 고객명: ${custName}\n- 연락처: ${formatPhoneNumber(custPhone)}\n- 관심 유형: ${custType}\n- 추가 견적: ${homeService}\n- 유입 경로: ${trafficSource}\n- 광고 캠페인: ${campaign}\n- 접수 시간: ${timestamp}\n- 고객 문자 발송: ${smsResultText}`
        });
      } catch (mailErr) {
        Logger.log('Admin email notification error: ' + mailErr);
      }
    }

    // 6. 결과 반환 (CORS 허용)
    return ContentService.createTextOutput(JSON.stringify({
      result: 'success',
      message: '예약 및 SMS 발송 처리 완료',
      smsStatus: smsResultText
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('doPost Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET 요청 (연동 테스트용)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    service: '롯데하이마트 경기광주점 자동 예약 & SMS 연동 서버',
    time: Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss')
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 스프레드시트 시트 가져오기 또는 헤더 생성
 */
function getOrCreateReservationSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('예약접수현황');
  
  if (!sheet) {
    sheet = ss.insertSheet('예약접수현황');
    // 헤더 행 생성
    const headers = [
      '접수일시',
      '고객명',
      '연락처',
      '구매유형',
      '제휴추가견적',
      '유입채널(UTM)',
      '광고캠페인',
      'SMS안내문자발송결과'
    ];
    sheet.appendRow(headers);
    
    // 헤더 서식 스타일 적용
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#c80815'); // 하이마트 레드
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
  
  return sheet;
}

/**
 * SMS 발송 라우팅 함수
 */
function dispatchSMS(receiverPhone, message, title) {
  // API 설정 여부 확인
  if (SMS_CONFIG.PROVIDER === 'ALIGO') {
    if (!SMS_CONFIG.ALIGO.API_KEY || SMS_CONFIG.ALIGO.API_KEY === 'YOUR_ALIGO_API_KEY') {
      return '발송 대기 (알리고 API Key 미설정 - 시트에만 저장됨)';
    }
    return sendViaAligo(receiverPhone, message, title);
  } else if (SMS_CONFIG.PROVIDER === 'COOLSMS') {
    if (!SMS_CONFIG.COOLSMS.API_KEY || SMS_CONFIG.COOLSMS.API_KEY === 'YOUR_COOLSMS_API_KEY') {
      return '발송 대기 (쿨SMS API Key 미설정 - 시트에만 저장됨)';
    }
    return sendViaCoolSMS(receiverPhone, message);
  }
  return '지원하지 않는 SMS 프로바이더';
}

/**
 * [알리고 Aligo] SMS/LMS 발송 연동
 * 공식 API 엔드포인트: https://apis.aligo.in/send/
 */
function sendViaAligo(receiverPhone, message, title) {
  try {
    const payload = {
      key: SMS_CONFIG.ALIGO.API_KEY,
      user_id: SMS_CONFIG.ALIGO.USER_ID,
      sender: SMS_CONFIG.ALIGO.SENDER.replace(/[^0-9]/g, ''),
      receiver: receiverPhone,
      msg: message,
      title: title || '[롯데하이마트] 예약 안내',
      msg_type: message.length > 90 ? 'LMS' : 'SMS' // 90바이트 초과 시 장문 LMS 자동 전환
    };

    const options = {
      method: 'post',
      payload: payload,
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch('https://apis.aligo.in/send/', options);
    const json = JSON.parse(response.getContentText());

    if (json.result_code === '1' || json.result_code === 1) {
      return '발송 성공 (알리고 ' + json.msg_type + ')';
    } else {
      return '발송 실패 (' + json.message + ')';
    }
  } catch (e) {
    Logger.log('Aligo Error: ' + e);
    return '발송 오류 (' + e.message + ')';
  }
}

/**
 * [쿨SMS CoolSMS / Solapi] SMS 발송 연동
 */
function sendViaCoolSMS(receiverPhone, message) {
  try {
    const payload = {
      message: {
        to: receiverPhone,
        from: SMS_CONFIG.COOLSMS.SENDER.replace(/[^0-9]/g, ''),
        text: message
      }
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'HMAC-SHA256 apiKey=' + SMS_CONFIG.COOLSMS.API_KEY
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch('https://api.coolsms.co.kr/messages/v4/send', options);
    const code = response.getResponseCode();
    if (code === 200) {
      return '발송 성공 (쿨SMS)';
    } else {
      return '발송 실패 (' + response.getContentText() + ')';
    }
  } catch (e) {
    Logger.log('CoolSMS Error: ' + e);
    return '발송 오류 (' + e.message + ')';
  }
}

/**
 * 전화번호 010-XXXX-XXXX 하이픈 서식화 유틸리티
 */
function formatPhoneNumber(num) {
  if (!num) return '';
  const clean = num.replace(/[^0-9]/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return clean;
}
