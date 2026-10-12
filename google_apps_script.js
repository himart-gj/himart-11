/**
 * [롯데하이마트 경기광주점] 구글 스프레드시트 간편 연동 Google Apps Script (Code.gs)
 * 
 * ==============================================================================
 * [설치 및 연동 방법 - 1분 완성]
 * 1. 구글 스프레드시트 열기 -> 상단 메뉴 [확장 프로그램] -> [Apps Script] 클릭
 * 2. 기존 코드를 모두 지우고 이 코드 전체를 복사하여 붙여넣기
 * 3. 우측 상단 파란색 [배포] -> [새 배포] 클릭
 * 4. 유형(톱니바퀴): [웹 앱] 선택
 *    - 설명: "하이마트 상시 예약 접수"
 *    - 다음 사용자로 실행: "나(내 계정)"
 *    - 액세스 권한: 반드시 "모든 사용자(Anyone)" 선택!
 * 5. [배포] 버튼 클릭 후 웹 앱 URL 복사
 * ==============================================================================
 */

function doPost(e) {
  try {
    const params = e.parameter || {};
    
    // 접수 데이터 추출
    const custName = (params['이름'] || params.name || '고객').trim();
    const custPhone = (params['연락처'] || params.phone || '').trim();
    const serviceCategory = (params['상담서비스'] || params.service || '상담').trim();
    const subItems = (params['세부항목'] || params.items || '-').trim();
    const preferredDate = (params['희망일정'] || params.date || '-').trim();
    const customerNote = (params['문의사항'] || params.note || '-').trim();
    const trafficSource = (params['유입채널'] || params.source || '직접 방문').trim();
    const campaign = (params['광고캠페인'] || params.campaign || '-').trim();
    
    // 한국 표준시(KST) 타임스탬프
    const now = new Date();
    const timeFormatted = Utilities.formatDate(now, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");

    // 스프레드시트 가져오기
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('상담예약현황');
    
    if (!sheet) {
      sheet = ss.insertSheet('상담예약현황');
      // 헤더 작성
      const headers = ['접수일시', '고객명', '연락처', '상담서비스', '세부항목', '희망일정', '문의사항', '유입채널', '상담상태'];
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#da291c');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1, 160);
      sheet.setColumnWidth(2, 110);
      sheet.setColumnWidth(3, 140);
      sheet.setColumnWidth(4, 150);
      sheet.setColumnWidth(5, 240);
      sheet.setColumnWidth(6, 160);
      sheet.setColumnWidth(7, 260);
      sheet.setColumnWidth(8, 120);
      sheet.setColumnWidth(9, 100);
    }

    // 신규 행 추가
    sheet.appendRow([
      timeFormatted,
      custName,
      custPhone,
      serviceCategory,
      subItems,
      preferredDate,
      customerNote,
      trafficSource,
      '접수대기'
    ]);

    // 알림 이메일 전송 (관리자)
    try {
      const adminEmail = 'aa01051745672@gmail.com';
      if (adminEmail) {
        MailApp.sendEmail({
          to: adminEmail,
          subject: `[하이마트 경기광주점] 신규 상담 예약 접수 - ${custName} 고객님 (${serviceCategory})`,
          body: `[롯데하이마트 경기광주점] 신규 상담 예약이 접수되었습니다.\n\n` +
                `■ 접수일시: ${timeFormatted}\n` +
                `■ 고객명: ${custName}\n` +
                `■ 연락처: ${custPhone}\n` +
                `■ 상담서비스: ${serviceCategory}\n` +
                `■ 세부선택: ${subItems}\n` +
                `■ 희망일정: ${preferredDate}\n` +
                `■ 문의사항: ${customerNote}\n` +
                `■ 유입경로: ${trafficSource}\n\n` +
                `스프레드시트를 확인하여 고객님께 안내 전화를 진행해 주세요.`
        });
      }
    } catch (mailErr) {
      // 메일 발송 에러는 무시
    }

    return ContentService.createTextOutput(JSON.stringify({
      result: 'success',
      message: '예약이 정상적으로 접수되었습니다.'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("롯데하이마트 경기광주점 예약 웹앱 정상 작동 중입니다.");
}
