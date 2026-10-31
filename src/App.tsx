import React, { useState, useEffect, useRef } from 'react';

interface SubOptionGroup {
  parentKey: string;
  title: string;
  items: string[];
}

interface AdditionalOptionGroup {
  title: string;
  items: string[];
}

interface ServiceCategory {
  id: string;
  name: string;
  domainTag: string;
  shortSummary: string;
  thumbSrc: string;
  isCrimson?: boolean;
  popupHeaderLead: string;
  mainOptions: string[];
  additionalOptions?: AdditionalOptionGroup;
  subOptionGroups?: SubOptionGroup[];
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'appliance',
    name: '가전구매',
    domainTag: '다품목·구독 특가',
    shortSummary: '삼성·LG 단품/세트 · 가전구독 · 입주/웨딩/이사 특별지원',
    thumbSrc: './cat_appliance.png',
    isCrimson: true,
    popupHeaderLead: '삼성, LG 및 기타 가전 단품/세트 상담',
    mainOptions: ['단품 상담', '세트 상담', '가전 구독(케어)'],
    additionalOptions: {
      title: '추가 상황 선택 (선택 사항)',
      items: ['입주', '웨딩', '이사'],
    },
  },
  {
    id: 'smartphone',
    name: '스마트폰 · 알뜰폰',
    domainTag: 'KT망 월 4,900원~',
    shortSummary: 'SK·KT·LGU+ 3사 지원금 · 자급제 · KT망 알뜰요금제 5종',
    thumbSrc: './cat_smartphone.png',
    isCrimson: true,
    popupHeaderLead: 'SK, KT, LGU+, 자급제 및 하이마트 알뜰요금제',
    mainOptions: ['통신 3사', '자급제폰', '알뜰요금제'],
    subOptionGroups: [
      {
        parentKey: '통신 3사',
        title: '통신사 선택',
        items: ['SKT', 'KT', 'LG U+'],
      },
      {
        parentKey: '통신 3사',
        title: '가입 유형',
        items: ['기기변경', '번호이동', '신규가입'],
      },
      {
        parentKey: '알뜰요금제',
        title: 'KT망 요금제 선택',
        items: ['월 4,900원', '월 7,900원', '월 9,900원', '월 18,900원', '월 37,900원'],
      },
    ],
  },
  {
    id: 'cleaning',
    name: '각종 클리닝',
    domainTag: '완전분해 홈케어',
    shortSummary: '에어컨·세탁기·냉장고 분해 세척 · 매트리스·수도/보일러배관',
    thumbSrc: './cat_cleaning.png',
    popupHeaderLead: '에어컨, 세탁기, 냉장고, 주방후드, 비데 등 가전 및 매트리스, 수도배관, 보일러배관 클리닝',
    mainOptions: ['가전 클리닝', '매트리스/후드클리닝', '수도/보일러 배관 클리닝'],
    subOptionGroups: [
      {
        parentKey: '가전 클리닝',
        title: '클리닝 가전 선택',
        items: ['냉장고', '세탁기', '건조기', '에어컨'],
      },
      {
        parentKey: '매트리스/후드클리닝',
        title: '매트리스 / 주방후드 선택',
        items: ['매트리스 클리닝', '주방 후드 클리닝'],
      },
      {
        parentKey: '수도/보일러 배관 클리닝',
        title: '배관 클리닝 품목 선택',
        items: ['수도배관 클리닝', '보일러배관 클리닝'],
      },
    ],
  },
  {
    id: 'moving',
    name: '이사서비스',
    domainTag: '통인·한샘 공식제휴',
    shortSummary: '포장이사 무료견적 · 입주/이사청소 · 층간소음매트 · 방충망',
    thumbSrc: './cat_moving.png',
    popupHeaderLead: '통인/한샘 이사무료견적, 이사청소, 새집 증후군, 층간소음매트, 방충망교체, 집수리',
    mainOptions: ['포장이사 무료견적', '입주/이사 청소', '새집증후군', '층간소음매트', '방충망 시공'],
    subOptionGroups: [
      {
        parentKey: '포장이사 무료견적',
        title: '이사 파트너사 선택',
        items: ['통인익스프레스', '한샘이사'],
      },
      {
        parentKey: '입주/이사 청소',
        title: '청소 유형 선택',
        items: ['입주청소 (신축)', '이사청소 (구축)'],
      },
      {
        parentKey: '방충망 시공',
        title: '방충망 종류 선택',
        items: ['미세 방충망', '안전 방충망'],
      },
    ],
  },
  {
    id: 'interior',
    name: '홈인테리어 · 장리폼',
    domainTag: '무료 실측·시공',
    shortSummary: '맞춤 냉장고장 리폼 · 한샘 인테리어 · 영림중문 · KCC창호',
    thumbSrc: './cat_interior.png',
    popupHeaderLead: '한샘인테리어 무료견적(부분/전체), 영림중문, KCC창호, 냉장고/식기세척기/로봇청소기/인덕션 등 장리폼',
    mainOptions: ['가전 맞춤 장리폼', '한샘 부분/전체 인테리어', '영림중문', 'KCC 창호(샷시)'],
  },
  {
    id: 'integrated',
    name: '통합상담 (패키지)',
    domainTag: '원스톱 올인원',
    shortSummary: '가전 + 인테리어/장리폼 + 이사/클리닝 한번에 묶음 비교견적',
    thumbSrc: './cat_integrated.png',
    popupHeaderLead: '가전 + 가구/인테리어 + 이사 원스톱 통합 견적 상담',
    mainOptions: ['가전구매', '스마트폰', '각종 클리닝', '이사서비스', '홈인테리어'],
  },
];

interface MvnoPlanInfo {
  fee: string;
  subFeeNotice: string;
  contractType: '무약정' | '24개월 약정';
  badge: string;
  tagline: string;
  planName: string;
  network: '5G' | 'LTE';
  data: string;
  qos: string;
  call: string;
}

const KT_MVNO_PLANS_DATA: Record<string, MvnoPlanInfo> = {
  '월 4,900원': {
    fee: '월 4,900원',
    subFeeNotice: '[평생] 월 4,900원 (평생가 · 무약정)',
    contractType: '무약정',
    badge: '평생가 · 무약정',
    tagline: '평생 월 4,900원 고정가 · 위약금 없는 실속 5G 요금제',
    planName: '하이모바일 5G 5GB',
    network: '5G',
    data: '5GB',
    qos: '소진 시 차단 (추가 과금 방지)',
    call: '음성 100분 / 문자 100건',
  },
  '월 7,900원': {
    fee: '월 7,900원',
    subFeeNotice: '1년 보장 / 1년 후 갱신 시 25,900원 (24개월 약정)',
    contractType: '24개월 약정',
    badge: '5G 30GB+ · 24개월',
    tagline: '5G 30GB 대용량 + 소진 시 1Mbps 안심 무제한',
    planName: '하이모바일 5G 30GB+ [데이터 무제한]',
    network: '5G',
    data: '30GB',
    qos: '+ 1Mbps 무제한 (유튜브 360p)',
    call: '무제한 (영상/부가 100분)',
  },
  '월 9,900원': {
    fee: '월 9,900원',
    subFeeNotice: '[한정특가] 7개월간 월 9,900원 (이후 월 44,000원) · 무약정',
    contractType: '무약정',
    badge: '인기특가 · 무약정',
    tagline: '대용량 LTE 100GB + 소진 시 5Mbps 초고속 무제한',
    planName: '하이모바일 LTE 100GB+ [데이터 무제한]',
    network: 'LTE',
    data: '100GB',
    qos: '+ 5Mbps 무제한 (1080p FHD 시청)',
    call: '음성·문자 완전 무제한',
  },
  '월 18,900원': {
    fee: '월 18,900원',
    subFeeNotice: '1년 보장 / 1년 후 갱신 시 33,900원 (24개월 약정)',
    contractType: '24개월 약정',
    badge: '5G 50GB+ · 24개월',
    tagline: '5G 50GB 대용량 + 소진 시 1Mbps 안심 무제한',
    planName: '하이모바일 5G 50GB+ [데이터 무제한]',
    network: '5G',
    data: '50GB',
    qos: '+ 1Mbps 무제한 (유튜브 360p)',
    call: '무제한 (영상/부가 100분)',
  },
  '월 37,900원': {
    fee: '월 37,900원',
    subFeeNotice: '[평생] 월 37,900원 (평생가 · 무약정)',
    contractType: '무약정',
    badge: '5G 100GB · 평생가',
    tagline: '초고속 5G 100GB 대용량 + 음성·문자 무제한 평생 고정가',
    planName: '하이모바일 5G 100GB',
    network: '5G',
    data: '100GB',
    qos: '소진 시 차단 (추가 과금 방지)',
    call: '무제한 (영상/부가 100분)',
  },
};

interface HiFreedTier {
  id: string;
  name: string;
  accounts: string;
  supportManwon: number;
  monthlySupportWon: number;
  monthlyFeeWon: number;
  refundManwon: number;
  best?: boolean;
}

const HIFREED_TIERS: HiFreedTier[] = [
  {
    id: 'hf-75',
    name: '하이프리드 75',
    accounts: '1구좌',
    supportManwon: 75,
    monthlySupportWon: 23473,
    monthlyFeeWon: 33000,
    refundManwon: 495,
  },
  {
    id: 'hf-150',
    name: '하이프리드 150',
    accounts: '2구좌',
    supportManwon: 150,
    monthlySupportWon: 46946,
    monthlyFeeWon: 66000,
    refundManwon: 990,
  },
  {
    id: 'hf-225',
    name: '하이프리드 225',
    accounts: '3구좌',
    supportManwon: 225,
    monthlySupportWon: 70419,
    monthlyFeeWon: 99000,
    refundManwon: 1485,
  },
  {
    id: 'hf-300',
    name: '하이프리드 300',
    accounts: '4구좌',
    supportManwon: 300,
    monthlySupportWon: 93892,
    monthlyFeeWon: 132000,
    refundManwon: 1980,
    best: true,
  },
];

interface ShowroomCorner {
  id: string;
  cleanTitle: string;
  items: string[];
  description: string;
  linkedCategoryId: string;
  linkedCategoryName: string;
  imageSlot: string;
}

interface ShowroomFloor {
  floorKey: '1F' | '2F';
  floorLabel: string;
  zoneTitle: string;
  shortSummary: string;
  imageSlot: string;
  corners: ShowroomCorner[];
}

interface ShowroomBuilding {
  buildingKey: 'A' | 'B';
  buildingName: string;
  summary1F: string;
  summary2F: string;
  floors: Record<'1F' | '2F', ShowroomFloor>;
}

const SHOWROOM_BUILDINGS: Record<'A' | 'B', ShowroomBuilding> = {
  A: {
    buildingKey: 'A',
    buildingName: 'A동 (좌측관 · 빌트인/모바일관)',
    summary1F: '1F 모바일·IT·오디오',
    summary2F: '2F 냉장·세탁·주방·장리폼',
    floors: {
      '1F': {
        floorKey: '1F',
        floorLabel: '1층 (1F)',
        zoneTitle: 'A동 1층 · 스마트 모바일 & IT·오디오 존',
        shortSummary: 'Apple·Galaxy 공식 체험존, 통신 3사/자급제/알뜰폰, 노트북·데스크탑·타건존, 하이엔드 블루투스 청음 공간',
        imageSlot: './a_1f.jpg',
        corners: [
          {
            id: 'a-1f-mobile',
            cleanTitle: '모바일 전문관 (애플존·삼성존)',
            items: ['#아이폰·아이패드', '#애플워치체험존', '#갤럭시전라인업', '#SKT·KT·LGU+3사', '#자급제폰', '#하이마트알뜰요금제'],
            description: '최신 아이폰과 갤럭시 전 라인업을 직접 만져보고, 통신 3사 지원금부터 자급제·알뜰폰 요금제까지 한자리에서 투명하게 비교할 수 있는 모바일 특화 공간입니다.',
            linkedCategoryId: 'smartphone',
            linkedCategoryName: '스마트폰 · 알뜰폰',
            imageSlot: './a_1f_corner1.jpg',
          },
          {
            id: 'a-1f-it',
            cleanTitle: 'IT·컴퓨터 & 모니터·타건 존',
            items: ['#LG그램', '#삼성갤럭시북', '#데스크탑PC', '#고주사율모니터', '#기계식키보드타건', '#게이밍마우스'],
            description: '학생용·사무용 노트북부터 고성능 데스크탑과 모니터, 직접 눌러보고 고르는 키보드·마우스까지 갖춘 디지털 IT 체험관입니다.',
            linkedCategoryId: 'appliance',
            linkedCategoryName: '가전구매',
            imageSlot: './a_1f_corner2.jpg',
          },
          {
            id: 'a-1f-audio',
            cleanTitle: '블루투스 오디오 & 스마트 가전 존',
            items: ['#블루투스스피커', '#노이즈캔슬링헤드폰', '#프리미엄이어폰', '#사운드청음존', '#소형스마트가전'],
            description: '공간의 품격을 높여주는 하이엔드 블루투스 스피커와 이어폰의 생생한 사운드를 직접 청음해 보고 선택하실 수 있습니다.',
            linkedCategoryId: 'appliance',
            linkedCategoryName: '가전구매',
            imageSlot: './a_1f_corner3.jpg',
          },
        ],
      },
      '2F': {
        floorKey: '2F',
        floorLabel: '2층 (2F)',
        zoneTitle: 'A동 2층 · 대형 주방·세탁 가전 & 빌트인 리폼 관',
        shortSummary: '비스포크·오브제 냉장고/김치냉장고, 올인원 세탁건조기·워시타워, 식기세척기·인덕션, 맞춤 냉장고장 리폼 & 싱크볼·수전',
        imageSlot: './a_2f.jpg',
        corners: [
          {
            id: 'a-2f-fridge',
            cleanTitle: '냉장고 & 김치냉장고 프리미엄 존',
            items: ['#비스포크', '#오브제컬렉션', '#키친핏빌트인', '#프리스탠딩4도어', '#스탠드김치냉장고', '#뚜껑형김치냉장고'],
            description: '우리 집 주방 가구장에 딱 맞게 떨어지는 빌트인 키친핏부터 대용량 4도어 냉장고, 맞춤 숙성 김치냉장고까지 실물 컬러와 내부 수납을 한눈에 비교하실 수 있습니다.',
            linkedCategoryId: 'appliance',
            linkedCategoryName: '가전구매',
            imageSlot: './a_2f_corner1.jpg',
          },
          {
            id: 'a-2f-washer',
            cleanTitle: '세탁기·건조기 & 올인원 콤보 존',
            items: ['#워시타워', '#올인원세탁건조기', '#비스포크AI콤보', '#트롬오브제콤보', '#대용량드럼세탁기', '#통돌이·건조기'],
            description: '세탁부터 건조까지 한 번에 끝나는 최신 AI 올인원 콤보와 직렬/병렬 설치형 워시타워의 실제 높이와 도어 열림 반경을 직접 확인하실 수 있습니다.',
            linkedCategoryId: 'appliance',
            linkedCategoryName: '가전구매',
            imageSlot: './a_2f_corner2.jpg',
          },
          {
            id: 'a-2f-kitchen',
            cleanTitle: '식기세척기·인덕션 & 소형 주방가전 존',
            items: ['#빌트인식기세척기', '#고화력인덕션', '#가스레인지', '#IH압력밥솥', '#초고속블렌더', '#소형주방가전'],
            description: '살림 시간을 줄여주는 식기세척기와 인덕션부터 매일 쓰는 밥솥·믹서기까지 국내외 인기 주방가전을 총망라한 쿠킹 라이프 존입니다.',
            linkedCategoryId: 'appliance',
            linkedCategoryName: '가전구매',
            imageSlot: './a_2f_corner3.jpg',
          },
          {
            id: 'a-2f-reform',
            cleanTitle: '맞춤 냉장고장 리폼 & 싱크볼·수전 존',
            items: ['#냉장고장리폼', '#키친핏맞춤장', '#식기세척기장시공', '#프리미엄사각싱크볼', '#고급주방수전'],
            description: '가전 구매와 동시에 튀어나온 냉장고장을 깔끔하게 리폼하거나, 스크래치에 강한 고급 사각 싱크볼과 수전까지 원스톱 실측·시공 상담을 받으실 수 있습니다.',
            linkedCategoryId: 'interior',
            linkedCategoryName: '홈인테리어 · 장리폼',
            imageSlot: './a_2f_corner4.jpg',
          },
        ],
      },
    },
  },
  B: {
    buildingKey: 'B',
    buildingName: 'B동 (우측관 · 영상가전/홈인테리어관)',
    summary1F: '1F TV·에어컨·청소기·게임',
    summary2F: '2F 홈인테리어·창호·안마의자',
    floors: {
      '1F': {
        floorKey: '1F',
        floorLabel: '1층 (1F)',
        zoneTitle: 'B동 1층 · 초대형 TV·에어케어 & 로봇청소기·게임 관',
        shortSummary: '65~98인치 초대형 TV 홈시네마, 시스템·스탠드 에어컨 & 계절가전, 직배수 로봇청소기 시연존, 다이슨 뷰티·콘솔 게임기',
        imageSlot: './b_1f.jpg',
        corners: [
          {
            id: 'b-1f-tv',
            cleanTitle: '초대형 TV & 홈시네마 체험 존',
            items: ['#삼성NeoQLED', '#LG올레드OLED', '#QNED·QLED', '#65~98인치초대형TV', '#프리미엄사운드바', '#홈시네마체험'],
            description: '거실 평수별(30평~50평대 이상) 최적의 시청 거리에 맞춘 65~98인치 초대형 TV 화질과 입체 사운드를 나란히 맞비교하실 수 있습니다.',
            linkedCategoryId: 'appliance',
            linkedCategoryName: '가전구매',
            imageSlot: './b_1f_corner1.jpg',
          },
          {
            id: 'b-1f-air',
            cleanTitle: '시스템·스탠드 에어컨 & 사계절 환경가전 존',
            items: ['#시스템에어컨', '#삼성무풍에어컨', '#LG휘센에어컨', '#대형공기청정기', '#온수·카본매트', '#가습기·난방가전'],
            description: '신축 입주·이사 필수품인 천장형 시스템에어컨 설계부터 사계절 실내 공기를 책임지는 공기청정기와 계절 가전을 한자리에 모았습니다.',
            linkedCategoryId: 'appliance',
            linkedCategoryName: '가전구매',
            imageSlot: './b_1f_corner2.jpg',
          },
          {
            id: 'b-1f-robot',
            cleanTitle: '로봇청소기 & 무선청소기 비교 시연 존',
            items: ['#로보락', '#드리미', '#에코백스', '#다이슨', '#비스포크·코드제로', '#직배수로봇청소기'],
            description: '가장 인기가 높은 직배수/자동세척 로봇청소기 주요 브랜드와 초경량 무선청소기의 흡입력·그립감을 현장에서 직접 체험해 보실 수 있습니다.',
            linkedCategoryId: 'appliance',
            linkedCategoryName: '가전구매',
            imageSlot: './b_1f_corner3.jpg',
          },
          {
            id: 'b-1f-beauty',
            cleanTitle: '뷰티·퍼스널케어 & 콘솔 게임기 존',
            items: ['#다이슨에어랩·드라이어', '#프리미엄헤어기기', '#전동면도기', '#플레이스테이션', '#닌텐도스위치', '#콘솔게임시연'],
            description: '선물용으로도 인기가 높은 프리미엄 헤어·뷰티 기기와 온 가족이 즐기는 콘솔 게임기를 직접 시연해 보고 구매하실 수 있습니다.',
            linkedCategoryId: 'appliance',
            linkedCategoryName: '가전구매',
            imageSlot: './b_1f_corner4.jpg',
          },
        ],
      },
      '2F': {
        floorKey: '2F',
        floorLabel: '2층 (2F)',
        zoneTitle: 'B동 2층 · 홈인테리어 & 힐링 안마의자·스마트홈 관',
        shortSummary: 'KCC 홈CC창호·영림중문·LED 조명, 세라젬·바디프랜드 프리미엄 안마의자 체험존, 스마트 도어락·홈캠 & 가정용 태양광',
        imageSlot: './b_2f.jpg',
        corners: [
          {
            id: 'b-2f-window',
            cleanTitle: '홈CC창호(샷시)·영림중문 & 인테리어 조명 존',
            items: ['#KCC홈CC창호', '#고단열샷시', '#영림프리미엄중문', '#3연동·스윙중문', '#LED인테리어조명', '#무료실측견적'],
            description: '냉난방비를 아껴주는 고단열 홈CC창호와 현관 분위기를 바꾸는 영림중문, 감각적인 실내 조명의 실제 자재와 개폐감을 눈으로 확인하고 무료 실측 견적을 받아보실 수 있습니다.',
            linkedCategoryId: 'interior',
            linkedCategoryName: '홈인테리어 · 장리폼',
            imageSlot: './b_2f_corner1.jpg',
          },
          {
            id: 'b-2f-massage',
            cleanTitle: '프리미엄 안마의자 힐링 체험 존',
            items: ['#세라젬', '#바디프랜드', '#코지마', '#프리미엄안마의자', '#척추온열의료기기', '#소형마사지기'],
            description: '프라이빗하고 편안한 분위기에서 여러 브랜드의 안마의자와 척추 온열기기를 직접 누워보고 체형에 가장 잘 맞는 모델을 고르실 수 있습니다.',
            linkedCategoryId: 'appliance',
            linkedCategoryName: '가전구매',
            imageSlot: './b_2f_corner2.jpg',
          },
          {
            id: 'b-2f-smarthome',
            cleanTitle: '스마트 도어락·홈캠 & 가정용 태양광 존',
            items: ['#스마트도어락', '#지문·안면인식도어락', '#AI보안홈캠', '#가정용태양광설비', '#전기요금절감상담'],
            description: '우리 집 안전을 지키는 최신 스마트 도어락·홈캠 설치부터 전기요금 절감을 위한 가정용 태양광 솔루션까지 전문가와 1:1로 상담하실 수 있습니다.',
            linkedCategoryId: 'interior',
            linkedCategoryName: '홈인테리어 · 장리폼',
            imageSlot: './b_2f_corner3.jpg',
          },
        ],
      },
    },
  },
};

/* ============================================================================
   Plugin 2 (`web-motion-effects-pro`) Component: SpringNumberTicker
   ============================================================================ */
const SpringNumberTicker: React.FC<{ value: number; durationMs?: number }> = ({
  value,
  durationMs = 340,
}) => {
  const [shown, setShown] = useState<number>(value);
  const prevRef = useRef<number>(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;
    if (from === to) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setShown(to);
      return;
    }

    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 5);
      setShown(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <span className="tabular-nums">{new Intl.NumberFormat('ko-KR').format(shown)}</span>;
};

/* ============================================================================
   Plugin 2 (`web-motion-effects-pro`) Component: BentoSpotlightCard
   ============================================================================ */
const BentoSpotlightCard: React.FC<{
  cat: ServiceCategory;
  isSelected: boolean;
  checkedCount: number;
  onClick: () => void;
}> = ({ cat, isSelected, checkedCount, onClick }) => {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const [spot, setSpot] = useState<{ x: number; y: number }>({ x: 120, y: 80 });

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setSpot({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onClick}
      onMouseMove={handleMove}
      className={`bento-cat-card tactile-btn hover-elevate ${isSelected ? 'is-selected' : ''} ${
        cat.isCrimson ? 'is-crimson' : ''
      } ${cat.id === 'integrated' ? 'is-featured' : ''}`}
    >
      <span
        aria-hidden="true"
        className="bento-spotlight-layer"
        style={{
          background: `radial-gradient(280px circle at ${spot.x}px ${spot.y}px, rgba(140, 90, 50, 0.14), transparent 72%)`,
        }}
      />
      <div className="bento-card-top">
        <span className="bento-domain-tag">{cat.domainTag}</span>
        {checkedCount > 0 ? (
          <span className="bento-count-pill">✓ {checkedCount}개 담김</span>
        ) : (
          <span className="bento-chevron" aria-hidden="true">
            상세 ›
          </span>
        )}
      </div>

      <div className="bento-card-mid">
        <div className="bento-title-group">
          <h3 className="bento-cat-title">{cat.name}</h3>
          <p className="bento-cat-summary">{cat.shortSummary}</p>
        </div>
        <div className="bento-thumb-box" aria-hidden="true">
          <img src={cat.thumbSrc} alt="" className="bento-thumb-img" loading="lazy" />
        </div>
      </div>
    </button>
  );
};

export default function App() {
  // Light (Warm Ivory Flagship) <-> Dark (Titanium Dark Pro) Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = window.localStorage.getItem('himart-ggj-theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#0B0E14' : '#F4F2ED');
    }
    try {
      window.localStorage.setItem('himart-ggj-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  // Main Mode Tab: 'booking' | 'showroom'
  const [activeMainTab, setActiveMainTab] = useState<'booking' | 'showroom'>('booking');

  // Showroom Tour States
  const [selectedBuilding, setSelectedBuilding] = useState<'A' | 'B'>('A');
  const [selectedFloor, setSelectedFloor] = useState<'1F' | '2F'>('1F');
  const [selectedCornerId, setSelectedCornerId] = useState<string>('a-1f-mobile');

  // Option Sheet Modal State
  const [modalCategory, setModalCategory] = useState<ServiceCategory | null>(null);
  const [activeMvnoPlan, setActiveMvnoPlan] = useState<string>('월 9,900원');

  // HiFreed Interactive Simulator State ('One Live Thing')
  const [selectedHfId, setSelectedHfId] = useState<string>('hf-300');
  const [hfMultiplier, setHfMultiplier] = useState<number>(1);
  const [showAllHfTable, setShowAllHfTable] = useState<boolean>(false);

  // Booking States
  const [bookingSubmitted, setBookingSubmitted] = useState<boolean>(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('appliance');
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const [consultationType, setConsultationType] = useState<'매장 방문' | '비대면 상담'>('매장 방문');

  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [customerNote, setCustomerNote] = useState<string>('');
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<{ field?: 'name' | 'phone' | 'privacy'; msg: string } | null>(null);
  const [completedData, setCompletedData] = useState<{
    serviceName: string;
    checks: string[];
    consultationType: string;
    name: string;
    phone: string;
    submittedAt: string;
  } | null>(null);

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isFormInView, setIsFormInView] = useState<boolean>(false);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  // Preserved Google Apps Script Endpoint & Official Store Links
  const scriptUrl =
    'https://script.google.com/macros/s/AKfycbzBeEb2kGqYAq5RyGsakTPD7l8xNbZzNrA9tXGwyuedgHzmO6mA6L_pOvps-NYSJ_xz/exec';

  const STORE_LINKS = {
    phone: 'tel:031-767-1044',
    naverMap: 'https://naver.me/5Ifcoycf',
    kakaoChannel: 'https://pf.kakao.com/_hnxcxexl',
    kakaoChat: 'https://pf.kakao.com/_hnxcxexl/chat',
    naverBlog: 'https://m.blog.naver.com/himart411',
    naverTalk: 'https://talk.naver.com/profile/wd21jdv',
    facebook: 'https://www.facebook.com/share/1EjioPJz2r/',
    instagram: 'https://instagram.com/himart.ggukji?rpxt=MTVtMGd2cG51NzNwOQ%3D%3D',
  };

  const [trafficSource, setTrafficSource] = useState<{ source?: string; campaign?: string }>({});

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource =
        params.get('utm_source') ||
        (document.referrer.includes('instagram.com')
          ? 'Instagram'
          : document.referrer.includes('facebook.com')
          ? 'Facebook'
          : 'Direct');
      const utmCampaign = params.get('utm_campaign') || '평상시 예약';
      setTrafficSource({ source: utmSource, campaign: utmCampaign });

      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'PageView');
      }
    } catch (e) {
      console.error('Init error:', e);
    }
  }, []);

  // Lock body scroll on modal & support ESC key
  useEffect(() => {
    if (!modalCategory && !isPrivacyModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalCategory(null);
        setIsPrivacyModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [modalCategory, isPrivacyModalOpen]);

  // Smart Thumb-Zone Sticky Bar visibility observer
  useEffect(() => {
    const formEl = document.getElementById('reservationFormSection');
    if (!formEl || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        setIsFormInView(entries.some((entry) => entry.isIntersecting));
      },
      { threshold: 0.22 }
    );
    obs.observe(formEl);
    return () => obs.disconnect();
  }, [activeMainTab]);

  const trackMetaEvent = (eventName: string, params: Record<string, any> = {}) => {
    try {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', eventName, params);
      }
    } catch (e) {
      console.error('Meta Pixel error:', e);
    }
  };

  const scrollToForm = () => {
    setTimeout(() => {
      const el = document.getElementById('reservationFormSection');
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 74;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 80);
  };

  const handleCardClick = (cat: ServiceCategory) => {
    if (selectedServiceId !== cat.id) {
      setSelectedServiceId(cat.id);
      setSelectedChecks([]);
    }
    setModalCategory(cat);
    trackMetaEvent('ViewContent', { content_name: cat.name, content_category: cat.id });
  };

  const toggleCheckItem = (item: string) => {
    setSelectedChecks((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const handleMvnoPlanSelect = (planFee: string, mvnoPlanList: string[]) => {
    setActiveMvnoPlan(planFee);
    setSelectedChecks((prev) => {
      const filtered = prev.filter((i) => !mvnoPlanList.includes(i));
      if (prev.includes(planFee)) {
        return filtered;
      }
      return [...filtered, planFee];
    });
  };

  const handleProceedToBooking = () => {
    if (!modalCategory) return;
    setBookingSubmitted(false);
    const catName = modalCategory.name;
    const catId = modalCategory.id;
    setModalCategory(null);
    trackMetaEvent('InitiateCheckout', {
      content_name: catName,
      content_category: catId,
      checked_items: selectedChecks.length > 0 ? selectedChecks.join(', ') : '미선택',
    });
    scrollToForm();
  };

  const activeHfTier = HIFREED_TIERS.find((t) => t.id === selectedHfId) || HIFREED_TIERS[3];
  const simTotalSupport = activeHfTier.supportManwon * hfMultiplier;
  const simMonthlySupport = activeHfTier.monthlySupportWon * hfMultiplier;
  const simMonthlyFee = activeHfTier.monthlyFeeWon * hfMultiplier;
  const simMaturityRefund = activeHfTier.refundManwon * hfMultiplier;
  const simGaugeRatio = Math.min(1, simTotalSupport / 300);

  const handleHiFreedBooking = () => {
    const label =
      hfMultiplier > 1
        ? `하이프리드 결합 (${activeHfTier.name} ×${hfMultiplier}개 · 총 ${simTotalSupport.toLocaleString('ko-KR')}만원 지원)`
        : `하이프리드 결합 (${activeHfTier.name} · 총 ${activeHfTier.supportManwon}만원 지원)`;

    setActiveMainTab('booking');
    setSelectedServiceId('appliance');
    setSelectedChecks((prev) => {
      const cleaned = prev.filter((x) => !x.startsWith('하이프리드'));
      return [...cleaned, label];
    });
    setBookingSubmitted(false);
    setModalCategory(null);

    trackMetaEvent('InitiateCheckout', {
      content_name: '가전구매 (하이프리드 결합 혜택)',
      content_category: 'appliance',
      checked_items: label,
    });
    scrollToForm();
  };

  const handleSelectBuilding = (buildingKey: 'A' | 'B', scrollToPanel: boolean = true) => {
    setSelectedBuilding(buildingKey);
    setSelectedFloor('1F');
    const firstCorner = SHOWROOM_BUILDINGS[buildingKey].floors['1F'].corners[0];
    if (firstCorner) setSelectedCornerId(firstCorner.id);
    trackMetaEvent('ViewContent', {
      content_name: `매장투어_${buildingKey}동`,
      content_category: 'showroom_tour',
    });
    if (scrollToPanel) {
      setTimeout(() => {
        const el = document.getElementById('showroomFloorPanel');
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 80);
    }
  };

  const handleSelectFloor = (floorKey: '1F' | '2F') => {
    setSelectedFloor(floorKey);
    const firstCorner = SHOWROOM_BUILDINGS[selectedBuilding].floors[floorKey].corners[0];
    if (firstCorner) setSelectedCornerId(firstCorner.id);
    trackMetaEvent('ViewContent', {
      content_name: `매장투어_${selectedBuilding}동_${floorKey}`,
      content_category: 'showroom_tour',
    });
  };

  const handleCornerBooking = (buildingKey: 'A' | 'B', floorKey: '1F' | '2F', corner: ShowroomCorner) => {
    const floorText = floorKey === '1F' ? '1층' : '2층';
    const tourPrefill = `[매장투어 선택: ${buildingKey}동 ${floorText} - ${corner.cleanTitle}] `;

    setActiveMainTab('booking');
    setSelectedServiceId(corner.linkedCategoryId);
    setCustomerNote((prev) => {
      const stripped = prev.replace(/^\[매장투어 선택:[^\]]+\]\s*/, '');
      return `${tourPrefill}${stripped}`;
    });
    setBookingSubmitted(false);
    setModalCategory(null);

    trackMetaEvent('InitiateCheckout', {
      content_name: `${corner.cleanTitle} (${buildingKey}동 ${floorText})`,
      content_category: corner.linkedCategoryId,
      checked_items: tourPrefill.trim(),
    });
    scrollToForm();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    if (raw.length <= 3) {
      setCustPhone(raw);
    } else if (raw.length <= 7) {
      setCustPhone(`${raw.slice(0, 3)}-${raw.slice(3)}`);
    } else {
      setCustPhone(`${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`);
    }
    if (formError?.field === 'phone') setFormError(null);
  };

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!custName.trim()) {
      setFormError({ field: 'name', msg: '예약자 성함을 입력해 주세요.' });
      nameInputRef.current?.focus();
      return;
    }

    const rawPhone = custPhone.replace(/[^0-9]/g, '');
    if (rawPhone.length < 10) {
      setFormError({ field: 'phone', msg: '휴대폰 번호 10~11자리를 정확히 입력해 주세요.' });
      phoneInputRef.current?.focus();
      return;
    }

    if (!privacyAgreed) {
      setFormError({ field: 'privacy', msg: '상담 예약을 위해 개인정보 수집 및 이용에 동의해 주세요.' });
      return;
    }

    setIsSubmitting(true);
    const currentCat = SERVICE_CATEGORIES.find((c) => c.id === selectedServiceId) || SERVICE_CATEGORIES[0];
    const checksSummary = selectedChecks.length > 0 ? selectedChecks.join(', ') : '기본 상담';

    try {
      trackMetaEvent('Lead', {
        content_name: currentCat.name,
        content_category: currentCat.id,
        consultation_type: consultationType,
        value: 1,
        currency: 'KRW',
      });

      if (scriptUrl && !scriptUrl.includes('placeholder')) {
        const formData = new FormData();
        formData.append('상담종류', currentCat.name);
        formData.append('체크사항', checksSummary);
        formData.append('상담방식', consultationType);
        formData.append('고객명', custName.trim());
        formData.append('연락처', custPhone.trim());
        formData.append('문의사항', customerNote.trim() || '없음');
        formData.append('접수일시', new Date().toLocaleString('ko-KR'));
        formData.append('유입채널', trafficSource.source || '직접 방문');
        formData.append('광고캠페인', trafficSource.campaign || '-');
        formData.append('매장명', '롯데하이마트 경기광주점');
        formData.append('매장전화', '031-767-1044');

        fetch(scriptUrl, { method: 'POST', mode: 'no-cors', body: formData });
      }

      const now = new Date();
      const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      setCompletedData({
        serviceName: currentCat.name,
        checks: selectedChecks.length > 0 ? selectedChecks : ['1:1 맞춤 종합 견적 상담'],
        consultationType,
        name: custName.trim(),
        phone: custPhone.trim(),
        submittedAt: dateStr,
      });

      setBookingSubmitted(true);
      scrollToForm();
    } catch (err) {
      console.error('Submit error:', err);
      setFormError({ msg: '일시적인 통신 오류가 발생했습니다. 잠시 후 다시 시도하거나 매장 전화(031-767-1044)로 문의해 주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetBooking = () => {
    setBookingSubmitted(false);
    setCompletedData(null);
    setSelectedChecks([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentSelectedCategory =
    SERVICE_CATEGORIES.find((c) => c.id === selectedServiceId) || SERVICE_CATEGORIES[0];
  const currentBuildingData = SHOWROOM_BUILDINGS[selectedBuilding];
  const currentFloorData = currentBuildingData.floors[selectedFloor];
  const currentCornerData =
    currentFloorData.corners.find((c) => c.id === selectedCornerId) || currentFloorData.corners[0];

  const mainTabClipPath =
    activeMainTab === 'booking'
      ? 'inset(0% 50% 0% 0% round 12px)'
      : 'inset(0% 0% 0% 50% round 12px)';

  const floorTabClipPath =
    selectedFloor === '1F'
      ? 'inset(0% 50% 0% 0% round 12px)'
      : 'inset(0% 0% 0% 50% round 12px)';

  return (
    <div className="flagship-shell">
      {/* 1. Slim Floating Glass Concierge Header */}
      <header className="concierge-header">
        <div className="concierge-header-inner">
          <div className="brand-cluster">
            <span className="brand-crimson-dot" aria-hidden="true" />
            <span className="brand-title">롯데하이마트 경기광주점</span>
            <a
              href={STORE_LINKS.naverMap}
              target="_blank"
              rel="noreferrer"
              className="header-map-pill tactile-btn"
              onClick={() => trackMetaEvent('FindLocation', { location: '상단_길찾기' })}
            >
              이배재로 8 · 길찾기 ›
            </a>
            <span className="header-hours-text">연중무휴 10:00–20:00 · 전용 대형 무료주차장</span>
          </div>

          <div className="header-actions">
            <a
              href={STORE_LINKS.kakaoChat}
              target="_blank"
              rel="noreferrer"
              className="quick-pill kakao tactile-btn"
              onClick={() => trackMetaEvent('Contact', { channel: '상단_카톡문의' })}
            >
              카톡문의
            </a>
            <a
              href={STORE_LINKS.naverTalk}
              target="_blank"
              rel="noreferrer"
              className="quick-pill talk tactile-btn"
              onClick={() => trackMetaEvent('Contact', { channel: '상단_네이버톡톡' })}
            >
              네이버톡톡
            </a>
            <a
              href={STORE_LINKS.phone}
              className="quick-pill phone tactile-btn tabular-nums"
              onClick={() => trackMetaEvent('Contact', { channel: '상단_전화문의' })}
            >
              031-767-1044
            </a>
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
              className="theme-switch-btn tactile-btn"
              aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            >
              <span>{theme === 'light' ? '◐ 다크' : '☀ 라이트'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flagship-container">
        {/* 2. Editorial Photo-Stage Split Hero + Clip-Path Sliding Mode Switcher */}
        <section className="hero-section" aria-label="핵심 혜택 및 쇼룸 안내">
          <div className="hero-stage-card">
            {activeMainTab === 'booking' && (
            <div className="hero-split-grid">
              <div className="hero-copy-pane">
                <div className="hero-eyebrow-row">
                  <span className="eyebrow-badge-primary">경기권 최대 규모 A·B동 2개 관</span>
                  <span className="eyebrow-badge-sub">사전예약 전용 특별 혜택</span>
                </div>

                <div>
                  <h1 className="hero-h1">
                    가전·인테리어·모바일 비교견적,
                    <span className="hero-h1-accent">분야별 전문 마이스터와 1:1로 설계하세요</span>
                  </h1>
                  <p className="hero-subcopy" style={{ marginTop: '8px' }}>
                    입주·웨딩·이사 다품목부터 KT망 알뜰폰, 장리폼, 가전 클리닝까지 원스톱 맞춤 혜택을 안내해 드립니다.
                  </p>
                </div>

                <ul className="hero-benefit-pills" aria-label="사전예약 3대 혜택">
                  <li className="hero-benefit-item">
                    <span className="hero-benefit-check" aria-hidden="true">✓</span>
                    <span>삼성·LG 다품목 추가지원금</span>
                  </li>
                  <li className="hero-benefit-item">
                    <span className="hero-benefit-check" aria-hidden="true">✓</span>
                    <span>금액대별 캐시백 &amp; L.POINT</span>
                  </li>
                  <li className="hero-benefit-item">
                    <span className="hero-benefit-check" aria-hidden="true">✓</span>
                    <span>입주·웨딩 투명 비교견적서</span>
                  </li>
                </ul>

                <p className="hero-disclaimer">
                  ※ 안내 혜택은 당월 행사 및 제휴카드 발급·실적 조건에 따라 달라질 수 있습니다.
                </p>
              </div>

              {/* Real Store Exterior Stage */}
              <div
                className="hero-photo-frame tactile-btn"
                onClick={() => {
                  const next = activeMainTab === 'showroom' ? 'booking' : 'showroom';
                  setActiveMainTab(next);
                  if (next === 'showroom') {
                    trackMetaEvent('ViewContent', {
                      content_name: '히어로실사_쇼룸투어진입',
                      content_category: 'showroom_tour',
                    });
                  }
                }}
              >
                <img
                  src="./store_exterior.jpg"
                  alt="롯데하이마트 경기광주점 A동 빌트인가전관 및 B동 홈인테리어관 외관과 전용 주차장"
                  className="hero-photo-img"
                  loading="eager"
                />
                <div className="hero-photo-scrim" aria-hidden="true" />
                <div className="hero-photo-overlay-bar">
                  <div>
                    <span className="hero-photo-tag">A동 · B동 1·2F 14개 전문존</span>
                    <p className="hero-photo-caption">전면 지상 대형 무료주차장 완비</p>
                    <p className="hero-photo-sub">경기도 광주시 이배재로 8</p>
                  </div>
                  <span className="hero-photo-cta-chip">
                    {activeMainTab === 'showroom' ? '상담 분야 보기 ›' : '층별 실사 투어 ›'}
                  </span>
                </div>
              </div>
            </div>

            )}

            {/* Emil Kowalski Clip-Path Sliding Mode Switcher */}
            <div className="sliding-tabs-shell" role="tablist" aria-label="상담 예약 및 매장 투어 전환">
              <button
                type="button"
                role="tab"
                aria-selected={activeMainTab === 'booking'}
                onClick={() => setActiveMainTab('booking')}
                className="sliding-tab-base-btn"
              >
                <span>1:1 맞춤 상담 &amp; 혜택 선택</span>
                <span className="sliding-tab-base-sub">6대 분야 · KT망 알뜰폰 · 하이프리드</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeMainTab === 'showroom'}
                onClick={() => {
                  setActiveMainTab('showroom');
                  trackMetaEvent('ViewContent', {
                    content_name: 'A·B동 매장 쇼룸 투어 탭',
                    content_category: 'showroom_tour',
                  });
                }}
                className="sliding-tab-base-btn"
              >
                <span>A·B동 매장 쇼룸 실사 투어</span>
                <span className="sliding-tab-base-sub">1·2층 14개 코너 사진 미리보기</span>
              </button>

              <div
                aria-hidden="true"
                className="sliding-tabs-active-layer"
                style={{ clipPath: mainTabClipPath }}
              >
                <div className="sliding-tab-active-cell">
                  <span>1:1 맞춤 상담 &amp; 혜택 선택</span>
                  <span className="sliding-tab-base-sub">6대 분야 · KT망 알뜰폰 · 하이프리드</span>
                </div>
                <div className="sliding-tab-active-cell">
                  <span>A·B동 매장 쇼룸 실사 투어</span>
                  <span className="sliding-tab-base-sub">1·2층 14개 코너 사진 미리보기</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            MODE A: 1:1 BOOKING + 6 BENTO CATEGORIES + LIVE HIFREED SIMULATOR
            ==================================================================== */}
        {activeMainTab === 'booking' && (
          <>
            {/* 3. Photo-Backed 6-Category Bento Grid */}
            <section className="bento-section" aria-label="6대 핵심 상담 분야 선택">
              <div className="section-head-row">
                <h2 className="section-h2">어떤 상담이 필요하신가요?</h2>
                <span className="section-hint">카드를 터치하면 세부 혜택을 고를 수 있습니다</span>
              </div>

              <div className="bento-grid-6">
                {SERVICE_CATEGORIES.map((cat) => {
                  const isSelected = selectedServiceId === cat.id;
                  const checkedCount = isSelected ? selectedChecks.length : 0;
                  return (
                    <BentoSpotlightCard
                      key={cat.id}
                      cat={cat}
                      isSelected={isSelected}
                      checkedCount={checkedCount}
                      onClick={() => handleCardClick(cat)}
                    />
                  );
                })}
              </div>
            </section>

            {/* 4. Dark Stage 'One Live Thing': Interactive HiFreed Benefit Simulator */}
            <section className="hifreed-stage-section" aria-label="하이프리드 가전 지원금 실시간 계산기">
              <div className="hifreed-dark-stage">
                <div className="hf-top-bar">
                  <div>
                    <span className="hf-kicker">경기광주점 인기 결합 혜택 · 다구좌 최대 2,400만 원 지원</span>
                    <h2 className="hf-title">하이프리드 가전 지원금 실시간 시뮬레이터</h2>
                    <p className="hf-desc">
                      삼성·LG 등 브랜드 제한 없이 35개월간 현금 입금 지원받고, 150회 만기 완납 시(상조 미이용 조건) 납입 원금 100% 전액을 환급받으실 수 있습니다.
                    </p>
                  </div>
                </div>

                {/* 3-Step Sequential Process */}
                <div className="hf-process-strip">
                  <div className="hf-step-pill-card">
                    <span className="hf-step-num">STEP 1</span>
                    <span className="hf-step-txt">브랜드·품목 제한 없이 가전 자유 선택</span>
                  </div>
                  <div className="hf-step-pill-card">
                    <span className="hf-step-num">STEP 2</span>
                    <span className="hf-step-txt">제휴카드 결제 후 35개월간 매월 10일 현금 입금</span>
                  </div>
                  <div className="hf-step-pill-card">
                    <span className="hf-step-num">STEP 3</span>
                    <span className="hf-step-txt">150회 만기 시 원금 100% 환급 (85%+축하금 15%)</span>
                  </div>
                </div>

                {/* 4-Tier Plan Cards */}
                <div className="hf-tier-grid" role="radiogroup" aria-label="하이프리드 플랜 선택">
                  {HIFREED_TIERS.map((tier) => {
                    const active = tier.id === selectedHfId;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelectedHfId(tier.id)}
                        className={`hf-tier-card tactile-btn ${active ? 'is-active' : ''}`}
                      >
                        <div className="hf-tier-top">
                          <span>{tier.accounts}</span>
                          {tier.best && <span className="hf-best-tag">인기 BEST</span>}
                        </div>
                        <div className="hf-tier-big tabular-nums">총 {tier.supportManwon}만 원</div>
                        <div className="hf-tier-sub">{tier.name}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Multi-Unit Combination Bar (1x, 2x, 4x, Max 8x = 2,400만원) */}
                <div className="hf-multiplier-bar">
                  <span className="hf-mult-label">다구좌 자유 조합 시뮬레이션 (최대 8개 가입 가능)</span>
                  <div className="hf-mult-chips">
                    {[1, 2, 4, 8].map((mult) => (
                      <button
                        key={mult}
                        type="button"
                        onClick={() => setHfMultiplier(mult)}
                        className={`hf-mult-chip tactile-btn tabular-nums ${hfMultiplier === mult ? 'is-active' : ''}`}
                      >
                        {mult === 1 ? '기본 ×1개' : mult === 8 ? '최대 ×8개' : `×${mult}개 조합`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Animated Readout & Ratio Gauge */}
                <div className="hf-live-readout">
                  <div className="hf-readout-grid">
                    <div className="hf-hero-number-box">
                      <span className="hf-hero-lbl">
                        {activeHfTier.name} ({activeHfTier.accounts})
                        {hfMultiplier > 1 ? ` × ${hfMultiplier}개 결합 시` : ''} 총 가전 지원금
                      </span>
                      <div className="hf-hero-val">
                        총 <SpringNumberTicker value={simTotalSupport} />만 원 지원
                      </div>
                      <div className="hf-gauge-track" aria-hidden="true">
                        <div
                          className="hf-gauge-fill"
                          style={{ transform: `scaleX(${Math.max(0.25, simGaugeRatio)})` }}
                        />
                      </div>
                    </div>

                    <div className="hf-stats-3">
                      <div className="hf-stat-cell">
                        <span className="hf-stat-lbl">35개월 분할 지원금</span>
                        <span className="hf-stat-val tabular-nums">
                          월 <SpringNumberTicker value={simMonthlySupport} />원 입금
                        </span>
                      </div>
                      <div className="hf-stat-cell">
                        <span className="hf-stat-lbl">월 상조회비 (150회)</span>
                        <span className="hf-stat-val tabular-nums">
                          월 <SpringNumberTicker value={simMonthlyFee} />원
                        </span>
                      </div>
                      <div className="hf-stat-cell is-refund">
                        <span className="hf-stat-lbl">150회 만기 100% 환급</span>
                        <span className="hf-stat-val tabular-nums">
                          <SpringNumberTicker value={simMaturityRefund} />만 원 환급
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hf-action-row">
                    <button
                      type="button"
                      onClick={() => setShowAllHfTable((prev) => !prev)}
                      className="hf-mult-chip tactile-btn"
                      style={{ alignSelf: 'flex-start' }}
                    >
                      {showAllHfTable ? '전 구간 요약표 접기 ▲' : '4개 플랜 한눈에 비교표 열기 ▼'}
                    </button>

                    <button type="button" onClick={handleHiFreedBooking} className="hf-cta-btn tactile-btn">
                      선택한 총 {simTotalSupport.toLocaleString('ko-KR')}만 원 지원 포함 가전 상담 예약 ›
                    </button>
                  </div>

                  {showAllHfTable && (
                    <div
                      style={{
                        display: 'grid',
                        gap: '6px',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.78rem',
                      }}
                    >
                      {HIFREED_TIERS.map((t) => (
                        <div
                          key={t.id}
                          className="tabular-nums"
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            gap: '6px',
                            padding: '7px 10px',
                            borderRadius: '10px',
                            background: 'rgba(255,255,255,0.04)',
                          }}
                        >
                          <strong>
                            {t.name} ({t.accounts})
                          </strong>
                          <span>상조 월 {t.monthlyFeeWon.toLocaleString('ko-KR')}원</span>
                          <span style={{ color: '#38BDF8', fontWeight: 800 }}>
                            월 {t.monthlySupportWon.toLocaleString('ko-KR')}원 (총 {t.supportManwon}만 원 지원)
                          </span>
                          <span style={{ color: '#34D399', fontWeight: 800 }}>
                            만기 {t.refundManwon.toLocaleString('ko-KR')}만 원 환급
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mandatory 4-Point FTC Notice (100% Verbatim Preserved) */}
                <div className="hf-ftc-box">
                  <div className="hf-ftc-title">공정거래위원회 필수 고지 안내</div>
                  <ol className="hf-ftc-list">
                    <li>1) 본 상품은 선불식 할부거래(상조) 결합 상품이며, 은행의 예·적금 등 금융상품이 아닙니다.</li>
                    <li>
                      2) 상조 서비스를 미이용한 상태로 150회 만기 완납 시, 만기환급금 85% + 만기축하금 15%를 합산하여 납입 원금 100% 전액이 환급됩니다.
                    </li>
                    <li>
                      3) 35회차 이내 중도 해약 시 가전 지원금 지원이 중단되며, 상조 표준약관에 따라 중도해약환급금이 적용됩니다.
                    </li>
                    <li>
                      4) 가입 기간 중 상조는 물론 크루즈 여행, 웨딩 등 프리드라이프 라이프케어 서비스로 100% 전환 이용 가능합니다.
                    </li>
                  </ol>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ====================================================================
            MODE B: INTERACTIVE A/B BUILDING SHOWROOM TOUR (20 REAL PHOTOS)
            ==================================================================== */}
        {activeMainTab === 'showroom' && (
          <section className="showroom-section" aria-label="A동 B동 층별 매장 쇼룸 투어">
            <div className="showroom-card">
              <div>
                <span className="eyebrow-badge-primary">STEP 1 · 외관 동 선택</span>
                <h2 className="section-h2" style={{ marginTop: '6px' }}>
                  둘러보실 건물(A동·B동)을 선택해 주세요
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-sub)' }}>
                  좌측 <strong>A동(모바일·IT·주방·세탁·장리폼)</strong>과 우측 <strong>B동(초대형TV·에어컨·로봇청소기·홈인테리어·안마의자)</strong> 2개 관으로 운영됩니다.
                </p>
              </div>

              <div className="exterior-stage">
                <img
                  src="./store_exterior.jpg"
                  alt="롯데하이마트 경기광주점 A동과 B동 외관 전경"
                  className="exterior-stage-img"
                />
                <div className="exterior-stage-scrim" aria-hidden="true" />
                <div className="exterior-hotspot-dock">
                  <button
                    type="button"
                    onClick={() => handleSelectBuilding('A')}
                    className={`building-spot-btn tactile-btn ${selectedBuilding === 'A' ? 'is-active' : ''}`}
                  >
                    <span className="spot-head">
                      <span>A동 (좌측관 · 빌트인/모바일)</span>
                      <span>{selectedBuilding === 'A' ? '선택됨 ●' : '입장 ›'}</span>
                    </span>
                    <span className="spot-sub">1F 모바일·IT·오디오 / 2F 냉장·세탁·주방·장리폼</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectBuilding('B')}
                    className={`building-spot-btn tactile-btn ${selectedBuilding === 'B' ? 'is-active' : ''}`}
                  >
                    <span className="spot-head">
                      <span>B동 (우측관 · 영상/인테리어)</span>
                      <span>{selectedBuilding === 'B' ? '선택됨 ●' : '입장 ›'}</span>
                    </span>
                    <span className="spot-sub">1F TV·에어컨·청소기·게임 / 2F 홈인테리어·창호·안마의자</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 & 3: Floor Sliding Tabs + Real Corner Photo Showcase */}
            <div id="showroomFloorPanel" className="showroom-card">
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                  <span className="booking-kicker">STEP 2 · 층별 쇼룸 탐색 ({currentBuildingData.buildingName})</span>
                  <h3 className="section-h2">{currentFloorData.zoneTitle}</h3>
                </div>
              </div>

              {/* Clip-Path Floor Switcher */}
              <div className="sliding-tabs-shell" role="tablist" aria-label="층별 선택">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedFloor === '1F'}
                  onClick={() => handleSelectFloor('1F')}
                  className="sliding-tab-base-btn"
                >
                  <span>1층 (1F) 내부 보기</span>
                  <span className="sliding-tab-base-sub">{currentBuildingData.summary1F}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedFloor === '2F'}
                  onClick={() => handleSelectFloor('2F')}
                  className="sliding-tab-base-btn"
                >
                  <span>2층 (2F) 내부 보기</span>
                  <span className="sliding-tab-base-sub">{currentBuildingData.summary2F}</span>
                </button>
                <div
                  aria-hidden="true"
                  className="sliding-tabs-active-layer"
                  style={{ clipPath: floorTabClipPath }}
                >
                  <div className="sliding-tab-active-cell">
                    <span>1층 (1F) 내부 보기</span>
                    <span className="sliding-tab-base-sub">{currentBuildingData.summary1F}</span>
                  </div>
                  <div className="sliding-tab-active-cell">
                    <span>2층 (2F) 내부 보기</span>
                    <span className="sliding-tab-base-sub">{currentBuildingData.summary2F}</span>
                  </div>
                </div>
              </div>

              <div className="floor-photo-banner">
                <img src={currentFloorData.imageSlot} alt={currentFloorData.zoneTitle} loading="lazy" />
                <div className="floor-photo-caption">
                  <strong style={{ fontSize: '0.92rem', display: 'block' }}>{currentFloorData.zoneTitle}</strong>
                  <span style={{ fontSize: '0.77rem', opacity: 0.86 }}>{currentFloorData.shortSummary}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  세부 코너 터치 시 실제 전시 사진과 품목 안내가 표시됩니다
                </div>
                <div className="corner-pills-row">
                  {currentFloorData.corners.map((corner) => (
                    <button
                      key={corner.id}
                      type="button"
                      onClick={() => setSelectedCornerId(corner.id)}
                      className={`corner-pill-btn tactile-btn ${currentCornerData.id === corner.id ? 'is-active' : ''}`}
                    >
                      {corner.cleanTitle}
                    </button>
                  ))}
                </div>
              </div>

              {currentCornerData && (
                <div className="corner-showcase-grid">
                  <div className="corner-showcase-photo">
                    <img src={currentCornerData.imageSlot} alt={currentCornerData.cleanTitle} loading="lazy" />
                  </div>
                  <div>
                    <span className="eyebrow-badge-primary">
                      {selectedBuilding}동 {selectedFloor} · 연동 분야: {currentCornerData.linkedCategoryName}
                    </span>
                    <h4 style={{ margin: '8px 0 6px', fontSize: '1.12rem', fontWeight: 900 }}>
                      {currentCornerData.cleanTitle}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      {currentCornerData.description}
                    </p>

                    <div className="corner-tag-cloud">
                      {currentCornerData.items.map((tag) => (
                        <span key={tag} className="corner-hashtag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCornerBooking(selectedBuilding, selectedFloor, currentCornerData)}
                      className="corner-book-btn tactile-btn"
                    >
                      이 코너 전문 마이스터 1:1 상담 예약하기 ↓
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ====================================================================
            5. ALWAYS-ACCESSIBLE ZERO-FRICTION CONCIERGE RESERVATION FORM
            ==================================================================== */}
        <section className="booking-section" id="reservationFormSection" aria-label="1:1 맞춤 상담 예약 접수">
          {!bookingSubmitted ? (
            <div className="booking-card">
              <div className="booking-head">
                <div>
                  <span className="booking-kicker">1:1 전담 마이스터 예약 컨시어지</span>
                  <h2 className="booking-title">[{currentSelectedCategory.name}] 맞춤 상담 예약</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: 'var(--text-sub)' }}>
                    {currentSelectedCategory.popupHeaderLead}
                  </p>
                </div>
              </div>

              {/* Quick Category Switcher Pills */}
              <div>
                <span className="field-label">상담 분야 빠른 전환</span>
                <div className="form-cat-pills">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (selectedServiceId !== cat.id) {
                          setSelectedServiceId(cat.id);
                          setSelectedChecks([]);
                        }
                      }}
                      className={`form-cat-pill tactile-btn ${selectedServiceId === cat.id ? 'is-active' : ''}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Option Chips Summary */}
              <div className="selected-summary-box">
                <div className="selected-summary-top">
                  <strong style={{ fontSize: '0.84rem' }}>선택된 세부 혜택·항목</strong>
                  <button
                    type="button"
                    onClick={() => setModalCategory(currentSelectedCategory)}
                    className="selected-edit-btn tactile-btn"
                  >
                    세부 옵션 고르기 / 수정 ✎
                  </button>
                </div>
                <div className="selected-chips-wrap">
                  {selectedChecks.length > 0 ? (
                    selectedChecks.map((item) => {
                      const mvno = KT_MVNO_PLANS_DATA[item];
                      return (
                        <span key={item} className="selected-chip-tag">
                          ✓ {item}
                          {mvno ? ` (${mvno.contractType})` : ''}
                        </span>
                      );
                    })
                  ) : (
                    <span className="selected-empty-hint">
                      세부 항목을 고르지 않으셔도 전담 마이스터가 1:1 종합 비교견적을 안내해 드립니다.
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmitReservation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} noValidate>
                {/* 1. Consultation Mode */}
                <div>
                  <span className="field-label">1. 희망 상담 방식 선택</span>
                  <div className="mode-grid-2">
                    <button
                      type="button"
                      onClick={() => setConsultationType('매장 방문')}
                      className={`mode-choice-card tactile-btn ${consultationType === '매장 방문' ? 'is-selected' : ''}`}
                    >
                      <span className="mode-choice-head">
                        <span>매장 방문 상담</span>
                        <span>{consultationType === '매장 방문' ? '●' : '○'}</span>
                      </span>
                      <span className="mode-choice-desc">경기광주점 내방 1:1 실물 비교 (무료주차)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationType('비대면 상담')}
                      className={`mode-choice-card tactile-btn ${consultationType === '비대면 상담' ? 'is-selected' : ''}`}
                    >
                      <span className="mode-choice-head">
                        <span>비대면 견적 상담</span>
                        <span>{consultationType === '비대면 상담' ? '●' : '○'}</span>
                      </span>
                      <span className="mode-choice-desc">카톡·문자로 맞춤 견적·혜택표 우선 수령</span>
                    </button>
                  </div>
                </div>

                {/* 2. Customer Name & Phone (16px inputs) */}
                <div>
                  <span className="field-label">2. 예약자 성함 및 연락처</span>
                  <div className="inputs-grid-2">
                    <div>
                      <input
                        ref={nameInputRef}
                        type="text"
                        autoComplete="name"
                        className="concierge-input"
                        placeholder="성함 입력 (예: 홍길동)…"
                        value={custName}
                        onChange={(e) => {
                          setCustName(e.target.value);
                          if (formError?.field === 'name') setFormError(null);
                        }}
                      />
                      {formError?.field === 'name' && <p className="field-error-msg">{formError.msg}</p>}
                    </div>
                    <div>
                      <input
                        ref={phoneInputRef}
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        className="concierge-input tabular-nums"
                        placeholder="휴대폰 번호 (010-0000-0000)…"
                        value={custPhone}
                        onChange={handlePhoneChange}
                        maxLength={13}
                      />
                      {formError?.field === 'phone' && <p className="field-error-msg">{formError.msg}</p>}
                    </div>
                  </div>
                </div>

                {/* 3. Optional Note */}
                <div>
                  <label htmlFor="custNoteField" className="field-label">
                    3. 희망 모델명 · 방문 희망일시 등 요청사항 (선택)
                  </label>
                  <textarea
                    id="custNoteField"
                    className="concierge-textarea"
                    rows={2}
                    placeholder="원하시는 가전 모델명이나 방문 예정 시간대가 있으시면 편하게 적어주세요…"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                  />
                </div>

                {/* Privacy Consent */}
                <div>
                  <div className="privacy-consent-row">
                    <label className="privacy-check-label">
                      <input
                        type="checkbox"
                        checked={privacyAgreed}
                        onChange={(e) => {
                          setPrivacyAgreed(e.target.checked);
                          if (formError?.field === 'privacy') setFormError(null);
                        }}
                      />
                      <span>[필수] 개인정보 수집 및 1:1 상담 예약 이용에 동의합니다.</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsPrivacyModalOpen(true)}
                      className="privacy-link-btn tactile-btn"
                    >
                      전문보기
                    </button>
                  </div>
                  {formError && !formError.field && <p className="field-error-msg">{formError.msg}</p>}
                  {formError?.field === 'privacy' && <p className="field-error-msg">{formError.msg}</p>}
                </div>

                {/* Reassurance Shield */}
                <div className="reassurance-shield">
                  <strong>안심 예약 보장:</strong> 원치 않는 권유 전화 없이, 요청하신 맞춤 견적·혜택표부터 카카오톡이나 문자로 편하게 받아보실 수 있습니다.
                </div>

                <button type="submit" disabled={isSubmitting} className="submit-concierge-btn tactile-btn">
                  {isSubmitting ? '맞춤 상담 예약 접수 중…' : '내 맞춤 최대 혜택 상담 예약하기'}
                </button>
              </form>
            </div>
          ) : (
            /* VIP Reservation Pass Receipt */
            <div className="vip-pass-card">
              <div>
                <span
                  className="eyebrow-badge-primary"
                  style={{ background: 'var(--accent-emerald-soft)', color: 'var(--accent-emerald)' }}
                >
                  ✓ VIP 상담 예약 패스 발급 완료
                </span>
                <h2 className="booking-title" style={{ marginTop: '6px' }}>
                  {completedData?.name} 고객님, 상담 예약이 접수되었습니다!
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                  롯데하이마트 경기광주점 전담 마이스터가 요청하신 방식({completedData?.consultationType})에 맞춰 신속히 안내해 드립니다.
                </p>
              </div>

              <div className="vip-pass-grid">
                <div className="vip-pass-row">
                  <span className="vip-pass-lbl">상담 분야</span>
                  <span className="vip-pass-val">{completedData?.serviceName}</span>
                </div>
                <div className="vip-pass-row">
                  <span className="vip-pass-lbl">선택 항목</span>
                  <span className="vip-pass-val">{completedData?.checks?.join(', ')}</span>
                </div>
                <div className="vip-pass-row">
                  <span className="vip-pass-lbl">상담 방식</span>
                  <span className="vip-pass-val">{completedData?.consultationType}</span>
                </div>
                <div className="vip-pass-row">
                  <span className="vip-pass-lbl">연락처 / 접수일시</span>
                  <span className="vip-pass-val tabular-nums">
                    {completedData?.phone} ({completedData?.submittedAt})
                  </span>
                </div>
                <div className="vip-pass-row">
                  <span className="vip-pass-lbl">매장 위치</span>
                  <span className="vip-pass-val">경기도 광주시 이배재로 8 (무료주차)</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '8px' }}>
                <a
                  href={STORE_LINKS.phone}
                  className="quick-pill phone tactile-btn"
                  style={{ height: '44px' }}
                  onClick={() => trackMetaEvent('Contact', { channel: '완료_전화' })}
                >
                  매장 통화
                </a>
                <a
                  href={STORE_LINKS.kakaoChat}
                  target="_blank"
                  rel="noreferrer"
                  className="quick-pill kakao tactile-btn"
                  style={{ height: '44px' }}
                  onClick={() => trackMetaEvent('Contact', { channel: '완료_카톡' })}
                >
                  카톡 상담
                </a>
                <a
                  href={STORE_LINKS.naverTalk}
                  target="_blank"
                  rel="noreferrer"
                  className="quick-pill talk tactile-btn"
                  style={{ height: '44px' }}
                  onClick={() => trackMetaEvent('Contact', { channel: '완료_네이버톡톡' })}
                >
                  네이버톡톡 문의
                </a>
                <a
                  href={STORE_LINKS.naverMap}
                  target="_blank"
                  rel="noreferrer"
                  className="quick-pill phone tactile-btn"
                  style={{ height: '44px' }}
                  onClick={() => trackMetaEvent('FindLocation', { location: '완료_길찾기' })}
                >
                  네이버 길찾기
                </a>
              </div>

              <button
                type="button"
                onClick={handleResetBooking}
                className="selected-edit-btn tactile-btn"
                style={{ width: '100%', minHeight: '44px' }}
              >
                처음 화면으로 돌아가기
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ======================================================================
          6. VAUL-STYLE RESPONSIVE SHEET MODAL (CATEGORY SUB-OPTIONS + KT MVNO)
          ====================================================================== */}
      {modalCategory && (
        <div
          className="vaul-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`${modalCategory.name} 세부 옵션 선택`}
          onClick={() => setModalCategory(null)}
        >
          <div className="vaul-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="vaul-handle-wrap" aria-hidden="true">
              <span className="vaul-handle-bar" />
            </div>

            <div className="vaul-sheet-header">
              <div>
                <span className="booking-kicker">{modalCategory.domainTag}</span>
                <h3 style={{ margin: 0, fontSize: '1.16rem', fontWeight: 900 }}>{modalCategory.name}</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.81rem', color: 'var(--text-muted)' }}>
                  {modalCategory.popupHeaderLead}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalCategory(null)}
                aria-label="닫기"
                className="vaul-close-btn tactile-btn"
              >
                ✕
              </button>
            </div>

            <div className="vaul-sheet-body">
              {/* Primary Multi-Select Options */}
              <div>
                <span className="field-label">주요 상담 항목 선택 (중복 선택 가능)</span>
                <div className="option-chip-grid">
                  {modalCategory.mainOptions.map((item) => {
                    const checked = selectedChecks.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleCheckItem(item)}
                        className={`option-chip-btn tactile-btn ${checked ? 'is-checked' : ''}`}
                      >
                        <span>{checked ? '✓' : '+'}</span>
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Situation Options (입주 / 웨딩 / 이사) */}
              {modalCategory.additionalOptions && (
                <div>
                  <span className="field-label">{modalCategory.additionalOptions.title}</span>
                  <div className="option-chip-grid">
                    {modalCategory.additionalOptions.items.map((item) => {
                      const checked = selectedChecks.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleCheckItem(item)}
                          className={`option-chip-btn tactile-btn ${checked ? 'is-checked' : ''}`}
                        >
                          <span>{checked ? '✓' : '+'}</span>
                          <span>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conditional Sub-Option Groups */}
              {modalCategory.subOptionGroups &&
                modalCategory.subOptionGroups.map((subGroup, idx) => {
                  if (!selectedChecks.includes(subGroup.parentKey)) return null;

                  if (subGroup.parentKey === '알뜰요금제') {
                    const currentPlan =
                      KT_MVNO_PLANS_DATA[activeMvnoPlan] || KT_MVNO_PLANS_DATA['월 9,900원'];
                    return (
                      <div key={`${subGroup.parentKey}-${idx}`} className="mvno-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.88rem' }}>KT망 알뜰폰 요금제 선택 (단일 선택)</strong>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>터치 시 하단 스펙 전환</span>
                        </div>

                        <div className="mvno-plan-cards">
                          {subGroup.items.map((planKey) => {
                            const checked = selectedChecks.includes(planKey);
                            const info = KT_MVNO_PLANS_DATA[planKey];
                            return (
                              <button
                                key={planKey}
                                type="button"
                                onClick={() => handleMvnoPlanSelect(planKey, subGroup.items)}
                                className={`mvno-plan-btn tactile-btn tabular-nums ${checked ? 'is-checked' : ''}`}
                              >
                                <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>
                                  {checked ? '✓ ' : '+ '}
                                  {planKey}
                                </span>
                                {info && (
                                  <span
                                    style={{
                                      fontSize: '0.69rem',
                                      fontWeight: 700,
                                      color:
                                        planKey === '월 9,900원'
                                          ? 'var(--accent-crimson)'
                                          : info.contractType === '무약정'
                                          ? 'var(--accent-emerald)'
                                          : 'var(--text-muted)',
                                    }}
                                  >
                                    {info.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {currentPlan && (
                          <div className="mvno-spec-stage">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                              <div>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '2px 7px',
                                    borderRadius: '6px',
                                    background: '#E11D48',
                                    color: '#FFFFFF',
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    marginRight: '6px',
                                  }}
                                >
                                  KT망
                                </span>
                                <strong style={{ fontSize: '0.92rem' }}>{currentPlan.planName}</strong>
                              </div>
                              <strong className="tabular-nums" style={{ fontSize: '1.1rem', color: '#38BDF8' }}>
                                {currentPlan.fee}
                              </strong>
                            </div>

                            <div className="mvno-spec-grid">
                              <div className="mvno-spec-cell">
                                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>데이터 / 속도</div>
                                <div style={{ fontWeight: 800, marginTop: '2px' }}>
                                  {currentPlan.network} {currentPlan.data} ({currentPlan.qos})
                                </div>
                              </div>
                              <div className="mvno-spec-cell">
                                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>음성 / 약정 조건</div>
                                <div style={{ fontWeight: 800, marginTop: '2px', color: '#34D399' }}>
                                  {currentPlan.call} · {currentPlan.contractType}
                                </div>
                              </div>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#CBD5E1' }}>
                              • {currentPlan.subFeeNotice} | 유심(일반 6,600원·NFC 8,800원·eSIM 3,000원) · 테더링 기본제공
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`${subGroup.parentKey}-${idx}`}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '16px',
                        background: 'var(--bg-surface-alt)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <span className="field-label">↳ {subGroup.title}</span>
                      <div className="option-chip-grid">
                        {subGroup.items.map((subItem) => {
                          const checked = selectedChecks.includes(subItem);
                          return (
                            <button
                              key={subItem}
                              type="button"
                              onClick={() => toggleCheckItem(subItem)}
                              className={`option-chip-btn tactile-btn ${checked ? 'is-checked' : ''}`}
                            >
                              <span>{checked ? '✓' : '+'}</span>
                              <span>{subItem}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="vaul-sheet-footer">
              <button
                type="button"
                onClick={() => setModalCategory(null)}
                className="option-chip-btn tactile-btn"
                style={{ justifyContent: 'center' }}
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleProceedToBooking}
                className="submit-concierge-btn tactile-btn"
                style={{ minHeight: '46px', padding: '10px 16px', fontSize: '0.92rem' }}
              >
                {selectedChecks.length > 0
                  ? `${selectedChecks.length}개 항목 담고 예약하기 ›`
                  : '이 분야 상담 예약하기 ›'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {isPrivacyModalOpen && (
        <div
          className="vaul-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="개인정보 수집 및 이용 안내"
          onClick={() => setIsPrivacyModalOpen(false)}
        >
          <div className="vaul-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="vaul-handle-wrap" aria-hidden="true">
              <span className="vaul-handle-bar" />
            </div>
            <div className="vaul-sheet-header">
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 900 }}>개인정보 수집 및 이용 안내</h3>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                aria-label="닫기"
                className="vaul-close-btn tactile-btn"
              >
                ✕
              </button>
            </div>
            <div className="vaul-sheet-body" style={{ fontSize: '0.88rem', lineHeight: 1.65 }}>
              <p style={{ margin: 0 }}>
                <strong>1. 수집 항목:</strong> 성함, 연락처(휴대폰 번호), 상담 선택 항목, 상담 방식(매장방문/비대면), 추가 문의
              </p>
              <p style={{ margin: 0 }}>
                <strong>2. 수집 목적:</strong> 롯데하이마트 경기광주점 1:1 맞춤 상담 예약 접수 및 일정 조율 안내
              </p>
              <p style={{ margin: 0 }}>
                <strong>3. 보유 및 이용 기간:</strong> 상담 완료일로부터 6개월 보관 후 안전하게 파기
              </p>
              <p style={{ margin: 0 }}>
                <strong>4. 동의 거부 권리:</strong> 고객님은 수집 동의를 거부하실 수 있으나, 미동의 시 상담 접수가 제한됩니다.
              </p>
            </div>
            <div className="vaul-sheet-footer" style={{ gridTemplateColumns: '1fr' }}>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className="submit-concierge-btn tactile-btn"
                style={{ minHeight: '46px' }}
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Smart Thumb-Zone Sticky Conversion Bar (Auto-hides when form or modal is active) */}
      {!isFormInView && !modalCategory && !isPrivacyModalOpen && !bookingSubmitted && (
        <div className="thumb-sticky-bar" role="region" aria-label="하단 빠른 상담 예약 바">
          <div className="thumb-sticky-inner">
            <a
              href={STORE_LINKS.kakaoChat}
              target="_blank"
              rel="noreferrer"
              className="sticky-kakao-btn tactile-btn"
              onClick={() => trackMetaEvent('Contact', { channel: '하단바_카톡문의' })}
            >
              카톡 상담
            </a>
            <button type="button" onClick={scrollToForm} className="sticky-jump-btn tactile-btn">
              <span>
                [{currentSelectedCategory.name}] 맞춤 예약 바로가기
              </span>
              {selectedChecks.length > 0 && (
                <span
                  className="tabular-nums"
                  style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.22)',
                    fontSize: '0.74rem',
                  }}
                >
                  {selectedChecks.length}건 선택됨
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 8. Footer with Official Store Info & SNS Channels */}
      <footer className="flagship-footer">
        <div className="flagship-footer-inner">
          <div>
            <strong style={{ color: 'var(--text-main)' }}>롯데하이마트 경기광주점</strong> | 대표전화:{' '}
            <a href={STORE_LINKS.phone} className="tabular-nums" style={{ textDecoration: 'underline' }}>
              031-767-1044
            </a>{' '}
            | 영업시간: 10:00 - 20:00 (연중무휴)
            <br />
            주소: 경기도 광주시 이배재로 8 (전면 지상 대형 무료주차장 완비){' '}
            <a
              href={STORE_LINKS.naverMap}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--accent-bronze)', fontWeight: 800 }}
              onClick={() => trackMetaEvent('FindLocation', { location: '푸터_길찾기' })}
            >
              [네이버 지도 길찾기]
            </a>
          </div>

          <div className="sns-row">
            <a
              href={STORE_LINKS.naverBlog}
              target="_blank"
              rel="noreferrer"
              className="sns-pill-link tactile-btn"
              onClick={() => trackMetaEvent('Contact', { channel: '푸터_네이버블로그' })}
            >
              <span>네이버 공식 블로그</span>
            </a>
            <a
              href={STORE_LINKS.instagram}
              target="_blank"
              rel="noreferrer"
              className="sns-pill-link tactile-btn"
              onClick={() => trackMetaEvent('Contact', { channel: '푸터_인스타' })}
            >
              <span>인스타그램</span>
            </a>
            <a
              href={STORE_LINKS.facebook}
              target="_blank"
              rel="noreferrer"
              className="sns-pill-link tactile-btn"
              onClick={() => trackMetaEvent('Contact', { channel: '푸터_페이스북' })}
            >
              <span>페이스북</span>
            </a>
            <a
              href={STORE_LINKS.kakaoChannel}
              target="_blank"
              rel="noreferrer"
              className="sns-pill-link tactile-btn"
              onClick={() => trackMetaEvent('Contact', { channel: '푸터_카카오채널' })}
            >
              <span>카카오톡 채널</span>
            </a>
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="sns-pill-link tactile-btn"
            >
              개인정보처리방침
            </button>
          </div>

          <div style={{ fontSize: '0.73rem' }}>
            © LOTTE HIMART Gyeonggi-Gwangju Flagship Branch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
