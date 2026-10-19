import React, { useState, useEffect } from 'react';

// 상담 서브 옵션 인터페이스
interface SubOptionGroup {
    parentKey: string;      // 해당 부모 옵션이 체크되었을 때 나타남
    title: string;          // 소제목 (예: "통신사 선택", "가입 유형", "클리닝 가전 품목")
    items: string[];        // 하위 선택지
}

// 추가 선택 옵션 (단품/세트와 분리된 추가 상황 선택 등)
interface AdditionalOptionGroup {
    title: string;
    items: string[];
}

// 6가지 핵심 상담 카테고리 정의
interface ServiceCategory {
    id: string;
    name: string;
    icon: string;
    popupHeaderLead: string;       // 팝업 상단 멘트
    mainOptions: string[];         // 1차 주요 상담 체크 옵션
    additionalOptions?: AdditionalOptionGroup; // 추가 선택 (단품/세트와 같은 선상에 놓지 않고 별도 분리)
    subOptionGroups?: SubOptionGroup[]; // 하위 세부 옵션들
    badgeColor: string;
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
    {
        id: 'appliance',
        name: '가전구매',
        icon: '📺',
        popupHeaderLead: '삼성, LG 및 기타 가전 단품/세트 상담',
        // 요청: 단품/세트/가전 구독(케어) 주요 옵션으로 두고 이사/입주/웨딩은 추가 선택으로 분리
        mainOptions: ['단품 상담', '세트 상담', '가전 구독(케어)'],
        additionalOptions: {
            title: '추가 상황 선택 (선택 사항)',
            items: ['입주', '웨딩', '이사']
        },
        badgeColor: '#da291c'
    },
    {
        id: 'smartphone',
        name: '스마트폰',
        icon: '📱',
        popupHeaderLead: 'SK, KT, LGU+, 자급제 및 하이마트 알뜰요금제',
        mainOptions: ['통신 3사', '자급제폰', '알뜰요금제'],
        subOptionGroups: [
            {
                parentKey: '통신 3사',
                title: '통신사 선택',
                items: ['SKT', 'KT', 'LG U+']
            },
            {
                parentKey: '통신 3사',
                title: '가입 유형',
                items: ['기기변경', '번호이동', '신규가입']
            },
            {
                parentKey: '알뜰요금제',
                title: 'KT망 요금제 선택',
                items: [
                    '월 4,900원',
                    '월 7,900원',
                    '월 9,900원',
                    '월 18,900원',
                    '월 37,900원'
                ]
            }
        ],
        badgeColor: '#2563eb'
    },
    {
        id: 'cleaning',
        name: '각종 클리닝',
        icon: '🧼',
        popupHeaderLead: '에어컨, 세탁기, 냉장고, 주방후드, 비데 등 가전 및 매트리스, 수도배관, 보일러배관 클리닝',
        mainOptions: ['가전 클리닝', '매트리스/후드클리닝', '수도/보일러 배관 클리닝'],
        subOptionGroups: [
            {
                parentKey: '가전 클리닝',
                title: '클리닝 가전 선택',
                items: ['냉장고', '세탁기', '건조기', '에어컨']
            },
            {
                parentKey: '매트리스/후드클리닝',
                title: '매트리스 / 주방후드 선택',
                items: ['매트리스 클리닝', '주방 후드 클리닝']
            },
            {
                parentKey: '수도/보일러 배관 클리닝',
                title: '배관 클리닝 품목 선택',
                items: ['수도배관 클리닝', '보일러배관 클리닝']
            }
        ],
        badgeColor: '#059669'
    },
    {
        id: 'moving',
        name: '이사서비스',
        icon: '🚚',
        popupHeaderLead: '통인/한샘 이사무료견적, 이사청소, 새집 증후군, 층간소음매트, 방충망교체, 집수리',
        mainOptions: [
            '포장이사 무료견적',
            '입주/이사 청소',
            '새집증후군',
            '층간소음매트',
            '방충망 시공'
        ],
        subOptionGroups: [
            {
                parentKey: '포장이사 무료견적',
                title: '이사 파트너사 선택',
                items: ['통인익스프레스', '한샘이사']
            },
            {
                parentKey: '입주/이사 청소',
                title: '청소 유형 선택',
                items: ['입주청소 (신축)', '이사청소 (구축)']
            },
            {
                parentKey: '방충망 시공',
                title: '방충망 종류 선택',
                // 요청: 일반/안전미세가 아니라 미세랑 안전으로 명확히 구분
                items: ['미세 방충망', '안전 방충망']
            }
        ],
        badgeColor: '#7c3aed'
    },
    {
        id: 'interior',
        name: '홈인테리어',
        icon: '🏠',
        popupHeaderLead: '한샘인테리어 무료견적(부분/전체), 영림중문, KCC창호, 냉장고/식기세척기/로봇청소기/인덕션 등 장리폼',
        mainOptions: ['가전 맞춤 장리폼', '한샘 부분/전체 인테리어', '영림중문', 'KCC 창호(샷시)'],
        badgeColor: '#0284c7'
    },
    {
        id: 'integrated',
        name: '통합상담',
        icon: '💎',
        popupHeaderLead: '가전 + 가구/인테리어 + 이사 원스톱 통합 견적 상담',
        // 요청 사항: 첫 화면 5개 메뉴만 나오게 (가전구매, 스마트폰, 각종 클리닝, 이사서비스, 홈인테리어)
        mainOptions: ['가전구매', '스마트폰', '각종 클리닝', '이사서비스', '홈인테리어'],
        badgeColor: '#4f46e5'
    }
];

// KT망 알뜰폰 요금제 상세 혜택 데이터 (약정 유무 및 스펙표 정확 반영)
// KT망 하이마트 전용 알뜰폰 요금제 상세 스펙 데이터 (제공 이미지 스펙표 100% 일치)
interface MvnoPlanInfo {
    fee: string;
    subFeeNotice: string;
    contractType: '무약정' | '24개월 약정';
    contractBadgeClass: string;
    badge: string;
    tagline: string;
    planName: string;
    network: '5G' | 'LTE';
    data: string;
    qos: string;
    call: string;
    contractDuration: string;
    tethering: string;
    ktWifi: string;
    sharing: string;
    benefits: string[];
}

const KT_MVNO_PLANS_DATA: Record<string, MvnoPlanInfo> = {
    '월 4,900원': {
        fee: '월 4,900원',
        subFeeNotice: '[평생] 월 4,900원 (평생가 · 무약정)',
        contractType: '무약정',
        contractBadgeClass: 'no-contract',
        badge: '평생가 · 무약정',
        tagline: '평생 월 4,900원 고정가! 위약금 없는 실속 5G 요금제',
        planName: '하이모바일 5G 5GB',
        network: '5G',
        data: '5GB',
        qos: '- (소진 시 차단 / 추가 과금 방지)',
        call: '100분 / 100건',
        contractDuration: '무약정 (위약금 0원 / 평생 할인)',
        tethering: 'O (기본제공)',
        ktWifi: 'X (미제공)',
        sharing: 'X',
        benefits: [
            '요금제명: 하이모바일 5G 5GB',
            '월 요금: [평생] 월 4,900원 (평생가 고정 · 무약정)',
            '약정: 무약정 (위약금 없이 언제든 해지/이동 자유)',
            '통신 / 데이터: 5G 5GB (KT망 / 데이터 테더링 O)',
            '음성 / 문자: 음성 100분 / 문자 100건',
            'KT 공용 WiFi: 미제공 / 데이터 쉐어링: 미제공'
        ]
    },
    '월 7,900원': {
        fee: '월 7,900원',
        subFeeNotice: '1년 보장 / 1년 후 갱신 시 25,900원 (24개월 약정)',
        contractType: '24개월 약정',
        contractBadgeClass: 'has-contract',
        badge: '5G 30GB+ 무제한 · 24개월 약정',
        tagline: '5G 30GB 대용량 + 소진 시 1Mbps 안심 무제한',
        planName: '하이모바일 5G 30GB+ [데이터 무제한]',
        network: '5G',
        data: '30GB',
        qos: '+ 1Mbps 안심 무제한 (유튜브 360p 끊김없이 시청)',
        call: '무제한 (영상/부가 100분)',
        contractDuration: '24개월 약정 (1년 보장 월 7,900원 / 1년 후 갱신 시 25,900원)',
        tethering: 'O (기본제공)',
        ktWifi: 'O (무료제공)',
        sharing: 'X',
        benefits: [
            '요금제명: 하이모바일 5G 30GB+ [데이터 무제한]',
            '월 요금: 월 7,900원 (1년 보장 / 1년 후 갱신 시 25,900원)',
            '약정: 24개월 약정 할인 상품',
            '통신 / 데이터: 5G 30GB + 소진 시 1Mbps 무제한 (테더링 O)',
            '음성 / 문자: 음성·문자 무제한 (영상/부가통화 100분 제공)',
            'KT 공용 WiFi: 무료 제공'
        ]
    },
    '월 9,900원': {
        fee: '월 9,900원',
        subFeeNotice: '[10월 한정특가] 7개월간 월 9,900원 (이후 월 44,000원) · 무약정',
        contractType: '무약정',
        contractBadgeClass: 'no-contract',
        badge: '🔥 10월 한정특가 · 무약정',
        tagline: '대용량 LTE 100GB + 소진 시 5Mbps 초고속 무제한!',
        planName: '하이모바일 LTE 100GB+ [데이터 무제한]',
        network: 'LTE',
        data: '100GB',
        qos: '+ 5Mbps 초고속 무제한 (고화질 1080p FHD 영상 끊김없이 시청)',
        call: '무제한 (음성·문자 무제한)',
        contractDuration: '무약정 (7개월 특가 할인 / 약정 및 위약금 없음)',
        tethering: 'O (기본제공)',
        ktWifi: 'O (무료제공)',
        sharing: 'X',
        benefits: [
            '★ 10월 한정 특가: [7개월] 월 9,900원 (7개월 후 평생할인가 월 44,000원)',
            '약정: 무약정 (위약금 없이 언제든 해지/이동 자유)',
            '통신 / 데이터: LTE 100GB + 소진 시 5Mbps 초고속 무제한 (테더링 O)',
            '음성 / 문자: 음성 및 문자 완전 무제한',
            'KT 공용 WiFi: 무료 제공'
        ]
    },
    '월 18,900원': {
        fee: '월 18,900원',
        subFeeNotice: '1년 보장 / 1년 후 갱신 시 33,900원 (24개월 약정)',
        contractType: '24개월 약정',
        contractBadgeClass: 'has-contract',
        badge: '5G 50GB+ 무제한 · 24개월 약정',
        tagline: '5G 50GB 대용량 + 소진 시 1Mbps 안심 무제한',
        planName: '하이모바일 5G 50GB+ [데이터 무제한]',
        network: '5G',
        data: '50GB',
        qos: '+ 1Mbps 안심 무제한 (유튜브 360p 끊김없이 시청)',
        call: '무제한 (영상/부가 100분)',
        contractDuration: '24개월 약정 (1년 보장 월 18,900원 / 1년 후 갱신 시 33,900원)',
        tethering: 'O (기본제공)',
        ktWifi: 'O (무료제공)',
        sharing: 'X',
        benefits: [
            '요금제명: 하이모바일 5G 50GB+ [데이터 무제한]',
            '월 요금: 월 18,900원 (1년 보장 / 1년 후 갱신 시 33,900원)',
            '약정: 24개월 약정 할인 상품',
            '통신 / 데이터: 5G 50GB + 소진 시 1Mbps 무제한 (테더링 O)',
            '음성 / 문자: 음성·문자 무제한 (영상/부가통화 100분 제공)',
            'KT 공용 WiFi: 무료 제공'
        ]
    },
    '월 37,900원': {
        fee: '월 37,900원',
        subFeeNotice: '[평생] 월 37,900원 (평생가 · 무약정)',
        contractType: '무약정',
        contractBadgeClass: 'no-contract',
        badge: '5G 100GB · 평생가 무약정',
        tagline: '초고속 5G 100GB 대용량 + 음성·문자 무제한 평생 고정 특가',
        planName: '하이모바일 5G 100GB',
        network: '5G',
        data: '100GB',
        qos: '- (소진 시 차단 / 추가 과금 방지)',
        call: '무제한 (영상/부가 100분)',
        contractDuration: '무약정 (위약금 0원 / 평생 할인)',
        tethering: 'O (기본제공)',
        ktWifi: 'O (무료제공)',
        sharing: 'X',
        benefits: [
            '요금제명: 하이모바일 5G 100GB',
            '월 요금: [평생] 월 37,900원 (평생가 고정 · 무약정)',
            '약정: 무약정 (위약금 없이 언제든 해지/이동 자유)',
            '통신 / 데이터: 5G 100GB 대용량 (KT망 / 데이터 테더링 O)',
            '음성 / 문자: 음성·문자 무제한 (영상/부가통화 100분 제공)',
            'KT 공용 WiFi: 무료 제공'
        ]
    }
};

// ==============================================================================
// A·B동 매장 쇼룸 투어 (층별 및 세부 코너 안내) 데이터 정의
// ==============================================================================
interface ShowroomCorner {
    id: string;
    icon: string;
    title: string;           // 예: '📱 모바일 전문관 (애플존·삼성존)'
    cleanTitle: string;      // 프리필용 깔끔한 코너명 (이모지 제외)
    items: string[];         // 전시 품목 태그 배열
    description: string;     // 코너 상세 설명
    linkedCategoryId: string; // 연동 예약 카테고리 ID ('smartphone' | 'appliance' | 'interior')
    linkedCategoryName: string; // 연동 예약 카테고리명 ('스마트폰' | '가전구매' | '홈인테리어')
    imageSlot: string;       // 코너 사진 슬롯 경로
}

interface ShowroomFloor {
    floorKey: '1F' | '2F';
    floorLabel: string;      // '1층 (1F)' | '2층 (2F)'
    zoneTitle: string;       // 예: 'A동 1층 - 스마트 모바일 & IT·오디오 존'
    shortSummary: string;
    imageSlot: string;       // './a_1f.jpg' 등
    corners: ShowroomCorner[];
}

interface ShowroomBuilding {
    buildingKey: 'A' | 'B';
    buildingName: string;    // 'A동 (좌측관)' | 'B동 (우측관)'
    hotspotText: string;
    enterBtnText: string;
    summary1F: string;
    summary2F: string;
    floors: Record<'1F' | '2F', ShowroomFloor>;
}

const SHOWROOM_BUILDINGS: Record<'A' | 'B', ShowroomBuilding> = {
    A: {
        buildingKey: 'A',
        buildingName: 'A동 (좌측관)',
        hotspotText: '📍 A동 (좌측관) 클릭 | 1F 모바일·IT·오디오 / 2F 냉장·세탁·주방·장리폼',
        enterBtnText: '🏢 A동 (좌측관) 내부 들어가기',
        summary1F: '1F 모바일·IT·오디오',
        summary2F: '2F 냉장·세탁·주방·장리폼',
        floors: {
            '1F': {
                floorKey: '1F',
                floorLabel: '1층 (1F)',
                zoneTitle: 'A동 1층 - 스마트 모바일 & IT·오디오 존',
                shortSummary: 'Apple·Galaxy 공식 체험존, 통신 3사/자급제/알뜰폰, 최신 노트북·데스크탑·타건존, 하이엔드 블루투스 오디오 청음 공간',
                imageSlot: './a_1f.jpg',
                corners: [
                    {
                        id: 'a-1f-mobile',
                        icon: '📱',
                        title: '📱 모바일 전문관 (애플존·삼성존)',
                        cleanTitle: '모바일 전문관 (애플존·삼성존)',
                        items: [
                            'Apple 공식 체험존(아이폰·아이패드·애플워치)',
                            '삼성 Galaxy 체험존',
                            'SKT·KT·LGU+ 통신 3사',
                            '자급제폰',
                            '하이마트 알뜰요금제'
                        ],
                        description: '최신 아이폰과 갤럭시 전 라인업을 직접 만져보고, 통신 3사 지원금부터 자급제·알뜰폰 요금제까지 한자리에서 투명하게 비교할 수 있는 모바일 특화 공간입니다.',
                        linkedCategoryId: 'smartphone',
                        linkedCategoryName: '스마트폰',
                        imageSlot: './a_1f_corner1.jpg'
                    },
                    {
                        id: 'a-1f-it',
                        icon: '💻',
                        title: '💻 IT·컴퓨터 & 모니터·타건 존',
                        cleanTitle: 'IT·컴퓨터 & 모니터·타건 존',
                        items: [
                            '그램·갤럭시북 등 최신 노트북',
                            '데스크탑 PC',
                            '고주사율 모니터',
                            '기계식 키보드·마우스'
                        ],
                        description: '학생용·사무용 노트북부터 고성능 데스크탑과 모니터, 직접 눌러보고 고르는 키보드·마우스까지 완벽하게 갖춘 디지털 IT 체험관입니다.',
                        linkedCategoryId: 'appliance',
                        linkedCategoryName: '가전구매',
                        imageSlot: './a_1f_corner2.jpg'
                    },
                    {
                        id: 'a-1f-audio',
                        icon: '🎧',
                        title: '🎧 블루투스 오디오 & 스마트 가전 존',
                        cleanTitle: '블루투스 오디오 & 스마트 가전 존',
                        items: [
                            '프리미엄 블루투스 스피커',
                            '노이즈캔슬링 블루투스 이어폰·헤드폰',
                            '소형 스마트 가전'
                        ],
                        description: '공간의 품격을 높여주는 하이엔드 블루투스 스피커와 이어폰의 생생한 사운드를 직접 청음해 보고 선택하실 수 있습니다.',
                        linkedCategoryId: 'appliance',
                        linkedCategoryName: '가전구매',
                        imageSlot: './a_1f_corner3.jpg'
                    }
                ]
            },
            '2F': {
                floorKey: '2F',
                floorLabel: '2층 (2F)',
                zoneTitle: 'A동 2층 - 대형 주방·세탁 가전 & 빌트인 리폼 관',
                shortSummary: '비스포크·오브제 냉장고/김치냉장고, 올인원 세탁건조기·워시타워, 식기세척기·인덕션, 맞춤 냉장고장 리폼 & 싱크볼·수전',
                imageSlot: './a_2f.jpg',
                corners: [
                    {
                        id: 'a-2f-fridge',
                        icon: '🧊',
                        title: '🧊 냉장고 & 김치냉장고 프리미엄 존',
                        cleanTitle: '냉장고 & 김치냉장고 프리미엄 존',
                        items: [
                            '삼성 비스포크·LG 오브제 키친핏/프리스탠딩 냉장고',
                            '스탠드형·뚜껑형 김치냉장고'
                        ],
                        description: '우리 집 주방 가구장에 딱 맞게 떨어지는 빌트인 키친핏부터 대용량 4도어 냉장고, 맞춤 숙성 김치냉장고까지 실물 컬러와 내부 수납을 한눈에 비교하실 수 있습니다.',
                        linkedCategoryId: 'appliance',
                        linkedCategoryName: '가전구매',
                        imageSlot: './a_2f_corner1.jpg'
                    },
                    {
                        id: 'a-2f-washer',
                        icon: '🧺',
                        title: '🧺 세탁기·건조기 & 올인원 콤보 존',
                        cleanTitle: '세탁기·건조기 & 올인원 콤보 존',
                        items: [
                            '일체형 세탁건조기(콤보)',
                            '원바디 워시타워',
                            '대용량 드럼/통돌이 세탁기',
                            '건조기'
                        ],
                        description: '세탁부터 건조까지 한 번에 끝나는 최신 AI 올인원 콤보와 직렬/병렬 설치형 워시타워의 실제 높이와 도어 열림 반경을 직접 확인하실 수 있습니다.',
                        linkedCategoryId: 'appliance',
                        linkedCategoryName: '가전구매',
                        imageSlot: './a_2f_corner2.jpg'
                    },
                    {
                        id: 'a-2f-kitchen',
                        icon: '🍳',
                        title: '🍳 식기세척기·인덕션 & 소형 주방가전 존',
                        cleanTitle: '식기세척기·인덕션 & 소형 주방가전 존',
                        items: [
                            '12~14인용 빌트인 식기세척기',
                            '고화력 인덕션',
                            '가스레인지',
                            'IH 전기밥솥',
                            '초고속 믹서기·블렌더'
                        ],
                        description: '살림 시간을 줄여주는 식기세척기와 인덕션부터 매일 쓰는 밥솥·믹서기까지 국내외 인기 주방가전을 총망라한 쿠킹 라이프 존입니다.',
                        linkedCategoryId: 'appliance',
                        linkedCategoryName: '가전구매',
                        imageSlot: './a_2f_corner3.jpg'
                    },
                    {
                        id: 'a-2f-reform',
                        icon: '🛠️',
                        title: '🛠️ 맞춤 냉장고장 리폼 & 싱크볼·수전 존',
                        cleanTitle: '맞춤 냉장고장 리폼 & 싱크볼·수전 존',
                        items: [
                            '키친핏 맞춤 냉장고장·식기세척기장 리폼',
                            '프리미엄 사각 싱크볼',
                            '고급 주방 수전'
                        ],
                        description: '가전 구매와 동시에 튀어나온 냉장고장을 깔끔하게 리폼하거나, 스크래치에 강한 고급 사각 싱크볼과 수전까지 원스톱 실측·시공 상담을 받으실 수 있습니다.',
                        linkedCategoryId: 'interior',
                        linkedCategoryName: '홈인테리어',
                        imageSlot: './a_2f_corner4.jpg'
                    }
                ]
            }
        }
    },
    B: {
        buildingKey: 'B',
        buildingName: 'B동 (우측관)',
        hotspotText: '📍 B동 (우측관) 클릭 | 1F TV·에어컨·청소기·게임 / 2F 홈인테리어·창호·안마의자',
        enterBtnText: '🏢 B동 (우측관) 내부 들어가기',
        summary1F: '1F TV·에어컨·청소기·게임',
        summary2F: '2F 홈인테리어·창호·안마의자',
        floors: {
            '1F': {
                floorKey: '1F',
                floorLabel: '1층 (1F)',
                zoneTitle: 'B동 1층 - 대형 TV·에어케어 & 클린·뷰티·게임 관',
                shortSummary: '65~98인치 초대형 TV 홈시네마, 시스템·스탠드 에어컨 & 계절가전, 직배수 로봇청소기 시연존, 다이슨 뷰티·콘솔 게임기',
                imageSlot: './b_1f.jpg',
                corners: [
                    {
                        id: 'b-1f-tv',
                        icon: '📺',
                        title: '📺 초대형 TV & 홈시네마 체험 존',
                        cleanTitle: '초대형 TV & 홈시네마 체험 존',
                        items: [
                            '삼성 Neo QLED·OLED TV',
                            'LG 올레드(OLED)·QNED TV',
                            '프리미엄 사운드바'
                        ],
                        description: '거실 평수별(30평~50평대 이상) 최적의 시청 거리에 맞춘 65~98인치 초대형 TV 화질과 입체 사운드를 나란히 맞비교하실 수 있습니다.',
                        linkedCategoryId: 'appliance',
                        linkedCategoryName: '가전구매',
                        imageSlot: './b_1f_corner1.jpg'
                    },
                    {
                        id: 'b-1f-air',
                        icon: '❄️',
                        title: '❄️ 시스템·스탠드 에어컨 & 사계절 환경가전 존',
                        cleanTitle: '시스템·스탠드 에어컨 & 사계절 환경가전 존',
                        items: [
                            '가정용 시스템에어컨',
                            '무풍/휘센 스탠드·벽걸이 에어컨',
                            '대형 공기청정기',
                            '겨울 난방가전(히터·온수/카본매트·가습기)'
                        ],
                        description: '신축 입주·이사 필수품인 천장형 시스템에어컨 설계부터 사계절 실내 공기를 책임지는 공기청정기와 겨울철 난방·가습 가전을 한자리에 모았습니다.',
                        linkedCategoryId: 'appliance',
                        linkedCategoryName: '가전구매',
                        imageSlot: './b_1f_corner2.jpg'
                    },
                    {
                        id: 'b-1f-robot',
                        icon: '🤖',
                        title: '🤖 로봇청소기 & 무선청소기 비교 시연 존',
                        cleanTitle: '로봇청소기 & 무선청소기 비교 시연 존',
                        items: [
                            '로보락·드리미·에코백스·삼성·LG 올인원 로봇청소기(직배수/일반)',
                            '다이슨·삼성·LG 무선 스틱청소기'
                        ],
                        description: '가장 인기가 높은 직배수/자동세척 로봇청소기 주요 브랜드와 초경량 무선청소기의 흡입력·그립감을 현장에서 직접 체험해 보실 수 있습니다.',
                        linkedCategoryId: 'appliance',
                        linkedCategoryName: '가전구매',
                        imageSlot: './b_1f_corner3.jpg'
                    },
                    {
                        id: 'b-1f-beauty',
                        icon: '🎮',
                        title: '🎮 뷰티·퍼스널케어 & 콘솔 게임기 존',
                        cleanTitle: '뷰티·퍼스널케어 & 콘솔 게임기 존',
                        items: [
                            '다이슨 등 프리미엄 헤어드라이어·스타일러',
                            '전동면도기',
                            '플레이스테이션·닌텐도 등 인기 콘솔 게임기'
                        ],
                        description: '선물용으로도 인기가 높은 프리미엄 헤어·뷰티 기기와 온 가족이 즐기는 콘솔 게임기를 직접 시연해 보고 구매하실 수 있습니다.',
                        linkedCategoryId: 'appliance',
                        linkedCategoryName: '가전구매',
                        imageSlot: './b_1f_corner4.jpg'
                    }
                ]
            },
            '2F': {
                floorKey: '2F',
                floorLabel: '2층 (2F)',
                zoneTitle: 'B동 2층 - 홈인테리어 & 힐링 안마의자·스마트홈 관',
                shortSummary: 'KCC 홈CC창호·영림중문·LED 조명, 세라젬·바디프랜드 프리미엄 안마의자 체험존, 스마트 도어락·홈캠 & 가정용 태양광',
                imageSlot: './b_2f.jpg',
                corners: [
                    {
                        id: 'b-2f-window',
                        icon: '🚪',
                        title: '🚪 홈CC창호(샷시)·영림중문 & 인테리어 조명 존',
                        cleanTitle: '홈CC창호(샷시)·영림중문 & 인테리어 조명 존',
                        items: [
                            'KCC 글라스 홈CC창호(단열 샷시)',
                            '영림 프리미엄 중문(3연동·스윙·원슬라이딩)',
                            '거실·다이닝 LED 조명'
                        ],
                        description: '냉난방비를 아껴주는 고단열 홈CC창호와 현관 분위기를 바꾸는 영림중문, 감각적인 실내 조명의 실제 자재와 개폐감을 눈으로 확인하고 무료 실측 견적을 받아보실 수 있습니다.',
                        linkedCategoryId: 'interior',
                        linkedCategoryName: '홈인테리어',
                        imageSlot: './b_2f_corner1.jpg'
                    },
                    {
                        id: 'b-2f-massage',
                        icon: '💺',
                        title: '💺 프리미엄 안마의자 힐링 체험 존',
                        cleanTitle: '프리미엄 안마의자 힐링 체험 존',
                        items: [
                            '세라젬·바디프랜드·코지마 등 브랜드별 프리미엄 안마의자 및 소형 마사지기'
                        ],
                        description: '프라이빗하고 편안한 분위기에서 여러 브랜드의 안마의자와 척추 온열기기를 직접 누워보고 체형에 가장 잘 맞는 모델을 고르실 수 있습니다.',
                        linkedCategoryId: 'appliance',
                        linkedCategoryName: '가전구매',
                        imageSlot: './b_2f_corner2.jpg'
                    },
                    {
                        id: 'b-2f-smarthome',
                        icon: '🔒',
                        title: '🔒 스마트 도어락·홈캠 & 가정용 태양광 존',
                        cleanTitle: '스마트 도어락·홈캠 & 가정용 태양광 존',
                        items: [
                            '지문·안면인식 스마트 도어락',
                            'AI 홈캠(실내외 보안카메라)',
                            '가정용 태양광 발전 설비 상담'
                        ],
                        description: '우리 집 안전을 지키는 최신 스마트 도어락·홈캠 설치부터 전기요금 절감을 위한 가정용 태양광 솔루션까지 전문가와 1:1로 상담하실 수 있습니다.',
                        linkedCategoryId: 'interior',
                        linkedCategoryName: '홈인테리어',
                        imageSlot: './b_2f_corner3.jpg'
                    }
                ]
            }
        }
    }
};

export default function App() {
    // 상단 메인 탭 상태: 'booking' (📋 1:1 맞춤 상담 예약) | 'showroom' (🏢 A·B동 매장 쇼룸 투어)
    const [activeMainTab, setActiveMainTab] = useState<'booking' | 'showroom'>('booking');

    // 쇼룸 투어 상태: 선택된 동('A' | 'B'), 층('1F' | '2F'), 세부 코너 ID, 이미지 로드 상태
    const [selectedBuilding, setSelectedBuilding] = useState<'A' | 'B'>('A');
    const [selectedFloor, setSelectedFloor] = useState<'1F' | '2F'>('1F');
    const [selectedCornerId, setSelectedCornerId] = useState<string>('a-1f-mobile');
    const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

    // 팝업 모달 상태: 카테고리 클릭 시 심플 팝업 오픈
    const [modalCategory, setModalCategory] = useState<ServiceCategory | null>(null);

    // 알뜰요금제 상세 혜택 열람 상태 (기본 월 4,900원)
    const [activeMvnoPlan, setActiveMvnoPlan] = useState<string>('월 4,900원');

    // 예약 접수 상태
    const [isBookingActive, setIsBookingActive] = useState<boolean>(false);
    const [bookingSubmitted, setBookingSubmitted] = useState<boolean>(false);

    // 예약 입력값
    const [selectedServiceId, setSelectedServiceId] = useState<string>('appliance');
    // 사용자가 직접 체크 (기본 고정 체크 없음 - 빈 배열 시작)
    const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
    
    // 상담 방식 선택: '매장 방문' or '비대면 상담' (요청사항: 이 두가지만 나올 수 있게)
    const [consultationType, setConsultationType] = useState<'매장 방문' | '비대면 상담'>('매장 방문');

    const [custName, setCustName] = useState<string>('');
    const [custPhone, setCustPhone] = useState<string>('');
    const [customerNote, setCustomerNote] = useState<string>('');
    const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // 완료 화면 데이터
    const [completedData, setCompletedData] = useState<any>(null);

    // 개인정보 처리방침 모달
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

    // 구글 앱스 스크립트 웹앱 URL (고객 제공 최신 연동 주소)
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzBeEb2kGqYAq5RyGsakTPD7l8xNbZzNrA9tXGwyuedgHzmO6mA6L_pOvps-NYSJ_xz/exec';


    // 롯데하이마트 경기광주점 공식 검증 링크
    const STORE_LINKS = {
        phone: 'tel:031-767-1044',
        naverMap: 'https://naver.me/5Ifcoycf',
        kakaoChannel: 'https://pf.kakao.com/_hnxcxexl',
        kakaoChat: 'https://pf.kakao.com/_hnxcxexl/chat',
        naverBlog: 'https://m.blog.naver.com/himart411',
        naverTalk: 'https://talk.naver.com/profile/wd21jdv',
        facebook: 'https://www.facebook.com/share/1EjioPJz2r/',
        instagram: 'https://instagram.com/himart.ggukji?rpxt=MTVtMGd2cG51NzNwOQ%3D%3D'
    };

    // 메타 픽셀 유입 추적
    const [trafficSource, setTrafficSource] = useState<{ source?: string; campaign?: string }>({});

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const utmSource = params.get('utm_source') || (document.referrer.includes('instagram.com') ? 'Instagram' : document.referrer.includes('facebook.com') ? 'Facebook' : 'Direct');
            const utmCampaign = params.get('utm_campaign') || '평상시 예약';
            setTrafficSource({ source: utmSource, campaign: utmCampaign });

            if (typeof window !== 'undefined' && (window as any).fbq) {
                (window as any).fbq('track', 'PageView');
            }
        } catch (e) {
            console.error('Init error:', e);
        }
    }, []);

    // 메타 픽셀 이벤트 전송 헬퍼
    const trackMetaEvent = (eventName: string, params: Record<string, any> = {}) => {
        try {
            if (typeof window !== 'undefined' && (window as any).fbq) {
                (window as any).fbq('track', eventName, params);
            }
        } catch (e) {
            console.error('Meta Pixel error:', e);
        }
    };

    // 카드 클릭 -> 팝업 열기 (요청: 기본 고정 체크 없음! 고객이 직접 체크하도록 빈 배열 초기화)
    const handleCardClick = (cat: ServiceCategory) => {
        setModalCategory(cat);
        setSelectedServiceId(cat.id);
        setSelectedChecks([]); // 고정 체크 제거 -> 사용자가 직접 선택
        trackMetaEvent('ViewContent', { content_name: cat.name, content_category: cat.id });
    };

    // 팝업 닫기
    const handleCloseModal = () => {
        setModalCategory(null);
    };

    // 체크 항목 토글 (중복 선택 가능)
    const toggleCheckItem = (item: string) => {
        setSelectedChecks(prev => 
            prev.includes(item)
                ? prev.filter(i => i !== item)
                : [...prev, item]
        );
    };

    // 알뜰요금제 전용 단일 선택 핸들러 (요구사항: 알뜰요금제 부분만 요금제 중복 체크 안되게, 4900원짜리 클릭했다가 다른 거 클릭하면 그 클릭한 것으로만 넘어가게)
    const handleMvnoPlanSelect = (planFee: string, mvnoPlanList: string[]) => {
        setActiveMvnoPlan(planFee);
        setSelectedChecks(prev => {
            // 기존에 체크되어 있던 다른 알뜰요금제들을 모두 제거
            const filtered = prev.filter(i => !mvnoPlanList.includes(i));
            // 만약 현재 요금제가 이미 체크되어 있었다면 토글 해제
            if (prev.includes(planFee)) {
                return filtered;
            }
            // 아니라면 현재 클릭한 요금제만 단일 추가 (중복 없이 바로 전환)
            return [...filtered, planFee];
        });
    };

    // 팝업에서 "예약 진행" 클릭 -> 팝업 닫고 아래 예약폼 활성화 & 스크롤
    const handleProceedToBooking = () => {
        if (!modalCategory) return;
        setIsBookingActive(true);
        setBookingSubmitted(false);
        setModalCategory(null);

        trackMetaEvent('InitiateCheckout', { 
            content_name: modalCategory.name,
            content_category: modalCategory.id,
            checked_items: selectedChecks.length > 0 ? selectedChecks.join(', ') : '미선택'
        });

        setTimeout(() => {
            const el = document.getElementById('reservationFormSection');
            if (el) {
                const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 100);
    };

    // 하이프리드 가전 지원 결합 혜택 섹션 하단 바로가기 버튼 클릭 -> 가전구매 카테고리 선택 상태로 하단 예약폼 활성화 & 스크롤
    const handleHiFreedBooking = () => {
        setActiveMainTab('booking');
        setSelectedServiceId('appliance');
        setSelectedChecks(prev => prev.includes('하이프리드 가전 지원 결합 혜택') ? prev : [...prev, '하이프리드 가전 지원 결합 혜택']);
        setIsBookingActive(true);
        setBookingSubmitted(false);
        setModalCategory(null);

        trackMetaEvent('InitiateCheckout', {
            content_name: '가전구매 (하이프리드 결합 혜택)',
            content_category: 'appliance',
            checked_items: '하이프리드 가전 지원 결합 혜택'
        });

        setTimeout(() => {
            const el = document.getElementById('reservationFormSection');
            if (el) {
                const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 100);
    };

    // 쇼룸 투어: 동(A동/B동) 선택 핸들러
    const handleSelectBuilding = (buildingKey: 'A' | 'B', scrollToPanel: boolean = true) => {
        setSelectedBuilding(buildingKey);
        setSelectedFloor('1F');
        const firstCorner = SHOWROOM_BUILDINGS[buildingKey].floors['1F'].corners[0];
        if (firstCorner) {
            setSelectedCornerId(firstCorner.id);
        }
        trackMetaEvent('ViewContent', {
            content_name: `매장투어_${buildingKey}동`,
            content_category: 'showroom_tour'
        });

        if (scrollToPanel) {
            setTimeout(() => {
                const el = document.getElementById('showroomFloorPanel');
                if (el) {
                    const y = el.getBoundingClientRect().top + window.pageYOffset - 76;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 80);
        }
    };

    // 쇼룸 투어: 층(1F/2F) 선택 핸들러
    const handleSelectFloor = (floorKey: '1F' | '2F') => {
        setSelectedFloor(floorKey);
        const firstCorner = SHOWROOM_BUILDINGS[selectedBuilding].floors[floorKey].corners[0];
        if (firstCorner) {
            setSelectedCornerId(firstCorner.id);
        }
        trackMetaEvent('ViewContent', {
            content_name: `매장투어_${selectedBuilding}동_${floorKey}`,
            content_category: 'showroom_tour'
        });
    };

    // 쇼룸 투어: 코너 카드 하단 '[이 코너 전문 마이스터 상담 예약하기 ⤓]' 원클릭 예약 연동 핸들러
    const handleCornerBooking = (buildingKey: 'A' | 'B', floorKey: '1F' | '2F', corner: ShowroomCorner) => {
        const floorText = floorKey === '1F' ? '1층' : '2층';
        const tourPrefill = `[매장투어 선택: ${buildingKey}동 ${floorText} - ${corner.cleanTitle}] `;

        setActiveMainTab('booking');
        setSelectedServiceId(corner.linkedCategoryId);
        setCustomerNote(prev => {
            const stripped = prev.replace(/^\[매장투어 선택:[^\]]+\]\s*/, '');
            return `${tourPrefill}${stripped}`;
        });
        setIsBookingActive(true);
        setBookingSubmitted(false);
        setModalCategory(null);

        trackMetaEvent('InitiateCheckout', {
            content_name: `${corner.cleanTitle} (${buildingKey}동 ${floorText})`,
            content_category: corner.linkedCategoryId,
            checked_items: tourPrefill.trim()
        });

        setTimeout(() => {
            const el = document.getElementById('reservationFormSection');
            if (el) {
                const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 120);
    };

    // 이미지 정상 로드 기록 헬퍼 (깨진 이미지 아이콘 원천 차단)
    const markImageLoaded = (src: string) => {
        setLoadedImages(prev => ({ ...prev, [src]: true }));
    };

    const markImageError = (src: string) => {
        setLoadedImages(prev => ({ ...prev, [src]: false }));
    };

    // 예약 취소 / 처음으로
    const handleResetBooking = () => {
        setIsBookingActive(false);
        setBookingSubmitted(false);
        setCompletedData(null);
        setSelectedChecks([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 전화번호 포맷팅 (010-1234-5678)
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        if (raw.length <= 3) {
            setCustPhone(raw);
        } else if (raw.length <= 7) {
            setCustPhone(`${raw.slice(0, 3)}-${raw.slice(3)}`);
        } else {
            setCustPhone(`${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`);
        }
    };

    // 예약 제출
    const handleSubmitReservation = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!custName.trim()) {
            alert('고객님의 성함을 입력해 주세요.');
            return;
        }

        const rawPhone = custPhone.replace(/[^0-9]/g, '');
        if (rawPhone.length < 10) {
            alert('올바른 휴대폰 번호를 입력해 주세요.');
            return;
        }

        if (!privacyAgreed) {
            alert('개인정보 수집 및 이용에 동의해 주세요.');
            return;
        }

        setIsSubmitting(true);

        const currentCat = SERVICE_CATEGORIES.find(c => c.id === selectedServiceId) || SERVICE_CATEGORIES[0];
        const checksSummary = selectedChecks.length > 0 ? selectedChecks.join(', ') : '기본 상담';

        try {
            // 메타 픽셀 'Lead' 이벤트 전송
            trackMetaEvent('Lead', {
                content_name: currentCat.name,
                content_category: currentCat.id,
                consultation_type: consultationType,
                value: 1,
                currency: 'KRW'
            });

            // 구글 앱스 스크립트 전송
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
            const dateStr = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            setCompletedData({
                serviceName: currentCat.name,
                checks: selectedChecks.length > 0 ? selectedChecks : ['일반 상세 상담'],
                consultationType: consultationType,
                name: custName.trim(),
                phone: custPhone.trim(),
                submittedAt: dateStr
            });

            setBookingSubmitted(true);

            setTimeout(() => {
                const el = document.getElementById('reservationFormSection');
                if (el) {
                    const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 60);

        } catch (error) {
            console.error('Reservation submit error:', error);
            alert('일시적인 통신 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentSelectedCategory = SERVICE_CATEGORIES.find(c => c.id === selectedServiceId) || SERVICE_CATEGORIES[0];
    const currentBuildingData = SHOWROOM_BUILDINGS[selectedBuilding];
    const currentFloorData = currentBuildingData.floors[selectedFloor];
    const currentCornerData = currentFloorData.corners.find(c => c.id === selectedCornerId) || currentFloorData.corners[0];

    // 서브 옵션 렌더링 헬퍼 컴포넌트
    const renderOptionSelector = (category: ServiceCategory) => {
        return (
            <div className="selector-group-container">
                {/* 1차 주요 상담 체크 (복수/중복 선택 가능) */}
                <div className="clean-check-section">
                    <div className="sec-label">
                        주요 상담 체크 (중복 선택 가능)
                    </div>
                    <div className="popup-simple-chips">
                        {category.mainOptions.map(item => {
                            const checked = selectedChecks.includes(item);
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    className={`popup-simple-chip ${checked ? 'selected' : ''}`}
                                    onClick={() => toggleCheckItem(item)}
                                >
                                    <span className="chip-mark">{checked ? '✓' : '+'}</span>
                                    <span className="chip-text">{item}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 가전구매 등 추가 선택 (단품/세트와 같은 선상이 아닌 별도 추가 선택 섹션) */}
                {category.additionalOptions && (
                    <div className="clean-additional-section">
                        <div className="additional-sec-header">
                            <span className="additional-badge">추가 선택</span>
                            <span className="sec-label">{category.additionalOptions.title}</span>
                        </div>
                        <div className="popup-simple-chips">
                            {category.additionalOptions.items.map(item => {
                                const checked = selectedChecks.includes(item);
                                return (
                                    <button
                                        key={item}
                                        type="button"
                                        className={`popup-simple-chip additional ${checked ? 'selected' : ''}`}
                                        onClick={() => toggleCheckItem(item)}
                                    >
                                        <span className="chip-mark">{checked ? '✓' : '+'}</span>
                                        <span className="chip-text">{item}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 하위 세부 옵션들 (부모 옵션 선택 시 자동으로 나타남) */}
                {category.subOptionGroups && category.subOptionGroups.map((subGroup, idx) => {
                    const isParentActive = selectedChecks.includes(subGroup.parentKey);
                    if (!isParentActive) return null;

                    // 알뜰요금제의 경우: KT망 단독 표시 + 요금제는 월 얼마로만 표시 + 월요금 클릭 시 그 하단에 해당요금제 상세 혜택 표출
                    if (subGroup.parentKey === '알뜰요금제') {
                        const currentPlanInfo = KT_MVNO_PLANS_DATA[activeMvnoPlan] || KT_MVNO_PLANS_DATA['월 4,900원'];

                        return (
                            <div key={`${subGroup.parentKey}-${idx}`} className="sub-option-box mvno-custom-box">
                                <div className="mvno-top-header">
                                    <div className="mvno-title-group">
                                        <span className="sub-dot">↳</span>
                                        <span className="kt-badge-flag">KT망</span>
                                        <span className="mvno-header-title">알뜰폰 요금제</span>
                                    </div>
                                    <span className="mvno-guide-hint">월 요금 터치 시 하단 상세 혜택 안내</span>
                                </div>

                                {/* 요금제는 월 얼마로만 표시 + 약정 여부 태그 표시 */}
                                <div className="popup-simple-chips mvno-price-chips-row">
                                    {subGroup.items.map(subItem => {
                                        const checked = selectedChecks.includes(subItem);
                                        const isActive = activeMvnoPlan === subItem;
                                        const planData = KT_MVNO_PLANS_DATA[subItem];
                                        const isContract = planData?.contractType === '24개월 약정';
                                        return (
                                            <button
                                                key={subItem}
                                                type="button"
                                                className={`popup-sub-chip mvno-price-chip ${checked ? 'selected' : ''} ${isActive ? 'inspected' : ''}`}
                                                onClick={() => handleMvnoPlanSelect(subItem, subGroup.items)}
                                            >
                                                <div className="mvno-chip-inner">
                                                    <span className="chip-mark">{checked ? '✓' : '+'}</span>
                                                    <span className="chip-text font-bold">{subItem}</span>
                                                </div>
                                                {planData && (
                                                    <span className={`mvno-chip-contract-tag ${isContract ? 'contract' : subItem === '월 9,900원' ? 'special' : 'no-contract'}`}>
                                                        {subItem === '월 9,900원' ? '★ 10월특가 · 무약정' : (isContract ? '24개월 약정' : '무약정 · 평생가')}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* 해당하는 월요금 눌렀을 때 그 하단에 해당요금제 핵심 안내 (간결 & 컴팩트) */}
                                {currentPlanInfo && (
                                    <div className="mvno-compact-detail-card">
                                        <div className="mvno-compact-top">
                                            <div className="mvno-compact-badge-row">
                                                <span className="kt-mini-pill">KT망</span>
                                                <span className="mvno-compact-plan-name">{currentPlanInfo.planName}</span>
                                                <span className={`mvno-contract-badge ${currentPlanInfo.contractBadgeClass}`}>
                                                    {currentPlanInfo.contractType === '24개월 약정' ? '🔒 24개월 약정' : '✨ 무약정'}
                                                </span>
                                            </div>
                                            <span className="mvno-compact-price">{currentPlanInfo.fee}</span>
                                        </div>

                                        <div className="mvno-compact-grid">
                                            <div className="compact-grid-cell">
                                                <span className="compact-lbl">데이터 / 속도</span>
                                                <span className="compact-val">{currentPlanInfo.network} {currentPlanInfo.data} ({currentPlanInfo.qos})</span>
                                            </div>
                                            <div className="compact-grid-cell">
                                                <span className="compact-lbl">음성 / 문자</span>
                                                <span className="compact-val">{currentPlanInfo.call}</span>
                                            </div>
                                            <div className="compact-grid-cell full-width">
                                                <span className="compact-lbl">약정 & 요금 조건</span>
                                                <span className={`compact-val font-bold ${currentPlanInfo.contractType === '24개월 약정' ? 'text-red-600' : 'text-emerald-700'}`}>
                                                    {currentPlanInfo.subFeeNotice}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mvno-compact-footer-bar">
                                            <span>💳 유심: 일반 6,600원 · NFC 8,800원 · eSIM 3,000원 | 테더링 무료 지원</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <div key={`${subGroup.parentKey}-${idx}`} className="sub-option-box">
                            <div className="sub-option-title">
                                <span className="sub-dot">↳</span> {subGroup.title} ({subGroup.parentKey} 세부 선택)
                            </div>
                            <div className="popup-simple-chips">
                                {subGroup.items.map(subItem => {
                                    const checked = selectedChecks.includes(subItem);
                                    return (
                                        <button
                                            key={subItem}
                                            type="button"
                                            className={`popup-sub-chip ${checked ? 'selected' : ''}`}
                                            onClick={() => toggleCheckItem(subItem)}
                                        >
                                            <span className="chip-mark">{checked ? '✓' : '+'}</span>
                                            <span className="chip-text">{subItem}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="landing-clean-wrapper">
            {/* ==============================================================================
             * 1. 최상단 매장 기본 정보 바 (기본주소 + 길찾기, 연락처, 영업시간 10:00 - 20:00)
             * ============================================================================== */}
            <header className="clean-top-store-bar">
                <div className="clean-top-store-inner">
                    <div className="clean-store-brand">
                        <span className="brand-dot" />
                        <span className="clean-brand-name">롯데하이마트 경기광주점</span>
                    </div>
                    <div className="clean-store-meta-group">
                        <span className="clean-meta-item">
                            📍 경기도 광주시 이배재로 8{' '}
                            <a
                                href={STORE_LINKS.naverMap}
                                target="_blank"
                                rel="noreferrer"
                                className="clean-map-link-badge"
                                onClick={() => trackMetaEvent('FindLocation', { location: '상단_길찾기' })}
                            >
                                [길찾기]
                            </a>
                        </span>
                        <span className="clean-meta-divider">|</span>
                        <span className="clean-meta-item">
                            📞 <a href="tel:031-767-1044" onClick={() => trackMetaEvent('Contact', { channel: '상단전화' })}>031-767-1044</a>
                        </span>
                        <span className="clean-meta-divider">|</span>
                        <span className="clean-meta-item">
                            ⏰ 영업시간 10:00 - 20:00 (연중무휴)
                        </span>
                    </div>
                </div>
            </header>

            {/* ==============================================================================
             * 2. 상단 퀵 링크 바 (역이탈 방지 최적화: 즉시 상담 창구 3가지만 배치)
             * ============================================================================== */}
            <nav className="clean-quick-nav-bar">
                <div className="clean-quick-nav-inner">
                    <div className="clean-nav-inquiry-group">
                        <a 
                            href={STORE_LINKS.kakaoChat} 
                            target="_blank" 
                            rel="noreferrer"
                            className="clean-inquiry-btn kakao"
                            title="롯데하이마트 경기광주점 카카오톡 1:1 실시간 상담"
                            onClick={() => trackMetaEvent('Contact', { channel: '한줄_카톡문의' })}
                        >
                            <span className="btn-emoji">💬</span>
                            <span className="btn-txt">카톡문의</span>
                        </a>
                        <a 
                            href={STORE_LINKS.naverTalk} 
                            target="_blank" 
                            rel="noreferrer"
                            className="clean-inquiry-btn talk"
                            title="롯데하이마트 경기광주점 네이버 톡톡 1:1 상담"
                            onClick={() => trackMetaEvent('Contact', { channel: '한줄_네이버톡톡' })}
                        >
                            <span className="btn-emoji">🟢</span>
                            <span className="btn-txt">네이버톡톡</span>
                        </a>
                        <a 
                            href={STORE_LINKS.phone} 
                            className="clean-inquiry-btn call"
                            title="매장 전화 바로 걸기 (031-767-1044)"
                            onClick={() => trackMetaEvent('Contact', { channel: '한줄_전화문의' })}
                        >
                            <span className="btn-emoji">📞</span>
                            <span className="btn-txt">전화문의</span>
                        </a>
                    </div>
                </div>
            </nav>

            {/* ==============================================================================
             * 3. 임팩트 있는 메인 타이틀 & 사전예약 전용 3대 핵심 혜택 상시 배너
             * ============================================================================== */}
            <main className="clean-main-content">
                <section className="clean-hero-simple">
                    <div className="clean-hero-badge">경기권 최대 규모 매장</div>
                    <h1 className="clean-hero-title">
                        롯데하이마트 경기광주점
                    </h1>

                    {/* 사전예약 전용 3대 핵심 혜택 상시 배너 */}
                    <div className="prebooking-benefit-card">
                        <div className="prebooking-benefit-header">
                            <span className="prebooking-benefit-title">🎁 온라인 사전예약 고객 전용 3대 핵심 혜택</span>
                        </div>
                        <ul className="prebooking-benefit-list">
                            <li>
                                <span className="benefit-check">✔</span>
                                <span>LG·삼성 다품목 동시구매 시 브랜드 특별 추가 지원금 적용</span>
                            </li>
                            <li>
                                <span className="benefit-check">✔</span>
                                <span>결제 금액대별 제휴카드 캐시백 및 L.POINT 적립 혜택 (조건 충족 시)</span>
                            </li>
                            <li>
                                <span className="benefit-check">✔</span>
                                <span>입주·웨딩·이사 및 단품/세트 1:1 맞춤형 투명 비교견적서 우선 제공</span>
                            </li>
                        </ul>
                        <p className="prebooking-benefit-disclaimer">
                            ※ 안내 혜택은 당월 행사 및 제휴카드 발급·실적 조건에 따라 달라질 수 있습니다.
                        </p>
                    </div>

                    {/* 1. 상단 네비게이션 스위칭 탭 신설 ('상담 예약' <-> '매장 쇼룸 투어') */}
                    <div className="main-mode-switch-wrap" role="tablist" aria-label="페이지 모드 전환">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeMainTab === 'booking'}
                            className={`main-mode-tab-btn ${activeMainTab === 'booking' ? 'active' : ''}`}
                            onClick={() => setActiveMainTab('booking')}
                        >
                            📋 1:1 맞춤 상담 예약
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeMainTab === 'showroom'}
                            className={`main-mode-tab-btn ${activeMainTab === 'showroom' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveMainTab('showroom');
                                trackMetaEvent('ViewContent', { content_name: 'A·B동 매장 쇼룸 투어 탭', content_category: 'showroom_tour' });
                            }}
                        >
                            🏢 A·B동 매장 쇼룸 투어 (층별 안내)
                        </button>
                    </div>

                    {activeMainTab === 'booking' && (
                        <p className="clean-hero-impact-line">
                            원하시는 상담을 선택해 주세요
                        </p>
                    )}
                </section>

                {/* ==============================================================================
                 * [탭 2] 🏢 A·B동 매장 쇼룸 투어 (층별 안내) 화면
                 * ============================================================================== */}
                {activeMainTab === 'showroom' && (
                    <section className="showroom-tour-container">
                        {/* [STEP 1] 매장 전경 사진 & A동(왼쪽)·B동(오른쪽) 인터랙티브 클릭 핫스팟 */}
                        <div className="showroom-step1-card">
                            <div className="showroom-step-header">
                                <span className="showroom-step-pill">STEP 1 · 매장 외관 동 선택</span>
                                <h2 className="showroom-step-title">구경하실 건물(A동·B동)을 터치해 주세요</h2>
                                <p className="showroom-step-sub">
                                    롯데하이마트 경기광주점은 좌측 <strong>A동(모바일·IT·주방·세탁·장리폼)</strong>과 우측 <strong>B동(초대형TV·에어컨·로봇청소기·홈인테리어·안마의자)</strong> 2개 관으로 이루어진 경기권 최대 규모 매장입니다.
                                </p>
                            </div>

                            {/* 와이드 라운드 카드 (border-radius: 20px) + 트윈 빌딩 그래픽 fallback + 핫스팟 오버레이 */}
                            <div className="showroom-exterior-Card">
                                <img
                                    src="./store_exterior.jpg"
                                    alt="롯데하이마트 경기광주점 A동·B동 외관 전경"
                                    className={`showroom-exterior-img ${loadedImages['./store_exterior.jpg'] ? 'is-loaded' : ''}`}
                                    onLoad={() => markImageLoaded('./store_exterior.jpg')}
                                    onError={() => markImageError('./store_exterior.jpg')}
                                />

                                {/* 이미지가 아직 로드되지 않았을 때 어색하지 않게 깔리는 세련된 트윈 빌딩 그래픽 배경 */}
                                <div className="twin-building-fallback" aria-hidden={loadedImages['./store_exterior.jpg'] ? 'true' : 'false'}>
                                    <div className="sky-glow" />
                                    <div className="twin-buildings-stage">
                                        {/* 왼쪽 A동 그래픽 */}
                                        <div
                                            className={`building-graphic building-a ${selectedBuilding === 'A' ? 'selected' : ''}`}
                                            onClick={() => handleSelectBuilding('A')}
                                        >
                                            <div className="building-roof-sign">
                                                <span className="lotte-dot" /> LOTTE HIMART <strong>A동 (좌측관)</strong>
                                            </div>
                                            <div className="building-window-floor">
                                                <span className="fl-tag">2F</span>
                                                <span className="fl-txt">냉장고 · 김치냉장고 · 세탁/건조 · 주방 · 장리폼</span>
                                            </div>
                                            <div className="building-window-floor">
                                                <span className="fl-tag">1F</span>
                                                <span className="fl-txt">모바일(애플·삼성) · IT/노트북 · 블루투스 오디오</span>
                                            </div>
                                            <div className="building-entrance">A동 정문 입구</div>
                                        </div>

                                        {/* 중앙 연결 브릿지 */}
                                        <div className="building-bridge">
                                            <span>연결통로</span>
                                        </div>

                                        {/* 오른쪽 B동 그래픽 */}
                                        <div
                                            className={`building-graphic building-b ${selectedBuilding === 'B' ? 'selected' : ''}`}
                                            onClick={() => handleSelectBuilding('B')}
                                        >
                                            <div className="building-roof-sign">
                                                <span className="lotte-dot" /> LOTTE HIMART <strong>B동 (우측관)</strong>
                                            </div>
                                            <div className="building-window-floor">
                                                <span className="fl-tag">2F</span>
                                                <span className="fl-txt">홈CC창호 · 영림중문 · 안마의자 · 도어락/태양광</span>
                                            </div>
                                            <div className="building-window-floor">
                                                <span className="fl-tag">1F</span>
                                                <span className="fl-txt">초대형 TV · 에어컨 · 로봇청소기 · 뷰티/콘솔게임</span>
                                            </div>
                                            <div className="building-entrance">B동 정문 입구</div>
                                        </div>
                                    </div>
                                    <div className="parking-lot-strip">
                                        🚗 매장 전면 전용 지상 대형 무료 주차장 완비 (경기도 광주시 이배재로 8)
                                    </div>
                                </div>

                                {/* 사진 위 왼쪽(가로 25% 지점) & 오른쪽(가로 75% 지점) 반짝이는 펄스 글래스모피즘 터치 핀 오버레이 */}
                                <div className="exterior-hotspots-layer">
                                    <button
                                        type="button"
                                        className={`exterior-hotspot-pin pin-left ${selectedBuilding === 'A' ? 'active' : ''}`}
                                        onClick={() => handleSelectBuilding('A')}
                                    >
                                        <span className="hotspot-pulse-dot" />
                                        <span className="hotspot-pin-text">
                                            📍 A동 (좌측관) 클릭 | 1F 모바일·IT·오디오 / 2F 냉장·세탁·주방·장리폼
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        className={`exterior-hotspot-pin pin-right ${selectedBuilding === 'B' ? 'active' : ''}`}
                                        onClick={() => handleSelectBuilding('B')}
                                    >
                                        <span className="hotspot-pulse-dot" />
                                        <span className="hotspot-pin-text">
                                            📍 B동 (우측관) 클릭 | 1F TV·에어컨·청소기·게임 / 2F 홈인테리어·창호·안마의자
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* 사진 바로 아래 모바일 터치 친화적 대형 탭 버튼 2개 */}
                            <div className="building-big-tabs-grid">
                                <button
                                    type="button"
                                    className={`building-big-tab ${selectedBuilding === 'A' ? 'active' : ''}`}
                                    onClick={() => handleSelectBuilding('A')}
                                >
                                    <span className="big-tab-title">🏢 A동 (좌측관) 내부 들어가기</span>
                                    <span className="big-tab-sub">1F 모바일·IT·오디오 / 2F 냉장·세탁·주방·장리폼</span>
                                </button>
                                <button
                                    type="button"
                                    className={`building-big-tab ${selectedBuilding === 'B' ? 'active' : ''}`}
                                    onClick={() => handleSelectBuilding('B')}
                                >
                                    <span className="big-tab-title">🏢 B동 (우측관) 내부 들어가기</span>
                                    <span className="big-tab-sub">1F TV·에어컨·청소기·게임 / 2F 홈인테리어·창호·안마의자</span>
                                </button>
                            </div>
                        </div>

                        {/* [STEP 2] 동 선택 시 '1층(1F) / 2층(2F)' 층별 스위칭 및 내부 사진 뷰어 */}
                        <div
                            id="showroomFloorPanel"
                            key={`${selectedBuilding}-${selectedFloor}`}
                            className="showroom-step2-panel"
                        >
                            <div className="showroom-panel-top-bar">
                                <div className="panel-building-badge-row">
                                    <span className="panel-step-pill">STEP 2 · 층별 쇼룸 탐색</span>
                                    <span className="panel-active-building-badge">
                                        현재 선택: 🏢 {currentBuildingData.buildingName}
                                    </span>
                                </div>
                                <h3 className="panel-zone-headline">{currentFloorData.zoneTitle}</h3>
                            </div>

                            {/* 1층(1F) / 2층(2F) 대형 층별 전환 탭 */}
                            <div className="floor-switch-tabs">
                                <button
                                    type="button"
                                    className={`floor-switch-btn ${selectedFloor === '1F' ? 'active' : ''}`}
                                    onClick={() => handleSelectFloor('1F')}
                                >
                                    <span className="fl-btn-main">1층 (1F) 내부 보기</span>
                                    <span className="fl-btn-sub">{currentBuildingData.summary1F}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`floor-switch-btn ${selectedFloor === '2F' ? 'active' : ''}`}
                                    onClick={() => handleSelectFloor('2F')}
                                >
                                    <span className="fl-btn-main">2층 (2F) 내부 보기</span>
                                    <span className="fl-btn-sub">{currentBuildingData.summary2F}</span>
                                </button>
                            </div>

                            {/* 층 전체 내부 전경 사진 슬롯 (./a_1f.jpg, ./a_2f.jpg, ./b_1f.jpg, ./b_2f.jpg + 깨진 아이콘 없는 프리미엄 쇼룸 일러스트 배너) */}
                            <div className="floor-overview-photo-slot">
                                <img
                                    src={currentFloorData.imageSlot}
                                    alt={currentFloorData.zoneTitle}
                                    className={`floor-overview-img ${loadedImages[currentFloorData.imageSlot] ? 'is-loaded' : ''}`}
                                    onLoad={() => markImageLoaded(currentFloorData.imageSlot)}
                                    onError={() => markImageError(currentFloorData.imageSlot)}
                                />
                                <div className="floor-overview-fallback" aria-hidden={loadedImages[currentFloorData.imageSlot] ? 'true' : 'false'}>
                                    <div className="floor-fallback-icons">
                                        {currentFloorData.corners.map(c => (
                                            <span key={c.id} className="floor-fallback-emoji">{c.icon}</span>
                                        ))}
                                    </div>
                                    <div className="floor-fallback-badge">
                                        {selectedBuilding}동 {selectedFloor} PREMIUM SHOWROOM
                                    </div>
                                    <div className="floor-fallback-title">{currentFloorData.zoneTitle}</div>
                                    <p className="floor-fallback-desc">{currentFloorData.shortSummary}</p>
                                </div>
                            </div>

                            {/* [STEP 3] 층별 세부 코너 칩 선택 & 코너 상세 설명 카드 */}
                            <div className="showroom-step3-section">
                                <div className="step3-label-row">
                                    <span className="panel-step-pill">STEP 3 · 세부 코너 선택</span>
                                    <span className="step3-guide-txt">원하시는 코너를 터치하면 전시 품목과 상세 안내가 표시됩니다</span>
                                </div>

                                {/* 세부 코너 선택 칩(Chip) 목록 */}
                                <div className="corner-chips-list">
                                    {currentFloorData.corners.map((corner, index) => {
                                        const isSelected = currentCornerData.id === corner.id;
                                        return (
                                            <button
                                                key={corner.id}
                                                type="button"
                                                className={`corner-select-chip ${isSelected ? 'active' : ''}`}
                                                onClick={() => setSelectedCornerId(corner.id)}
                                            >
                                                <span className="corner-chip-num">코너 {index + 1}</span>
                                                <span className="corner-chip-title">{corner.title}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* 선택된 코너 상세 설명 카드 */}
                                {currentCornerData && (
                                    <div key={currentCornerData.id} className="corner-detail-card">
                                        {/* 코너 사진 슬롯 (파일 없을 시 깔끔한 아이콘 그래픽 배너 표시) */}
                                        <div className="corner-photo-slot">
                                            <img
                                                src={currentCornerData.imageSlot}
                                                alt={currentCornerData.cleanTitle}
                                                className={`corner-slot-img ${loadedImages[currentCornerData.imageSlot] ? 'is-loaded' : ''}`}
                                                onLoad={() => markImageLoaded(currentCornerData.imageSlot)}
                                                onError={() => markImageError(currentCornerData.imageSlot)}
                                            />
                                            <div className="corner-slot-fallback" aria-hidden={loadedImages[currentCornerData.imageSlot] ? 'true' : 'false'}>
                                                <div className="corner-fallback-icon-badge">{currentCornerData.icon}</div>
                                                <div className="corner-fallback-meta">
                                                    <span className="corner-fallback-zone">
                                                        롯데하이마트 경기광주점 · {selectedBuilding}동 {selectedFloor === '1F' ? '1층' : '2층'} 핵심 코너
                                                    </span>
                                                    <h4 className="corner-fallback-name">{currentCornerData.title}</h4>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="corner-detail-body">
                                            <div className="corner-header-meta">
                                                <span className="corner-location-tag">
                                                    📍 {selectedBuilding}동 {selectedFloor === '1F' ? '1층' : '2층'}
                                                </span>
                                                <span className="corner-linked-cat-tag">
                                                    연동 상담: {currentCornerData.linkedCategoryName}
                                                </span>
                                            </div>

                                            <h4 className="corner-detail-title">{currentCornerData.title}</h4>
                                            <p className="corner-detail-desc">{currentCornerData.description}</p>

                                            {/* 전시 품목 태그 */}
                                            <div className="corner-items-box">
                                                <div className="corner-items-label">✨ 주요 전시 및 상담 품목</div>
                                                <div className="corner-items-tags">
                                                    {currentCornerData.items.map(item => (
                                                        <span key={item} className="corner-item-tag">
                                                            ✓ {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 하단 원클릭 예약 연동 버튼 */}
                                            <button
                                                type="button"
                                                className="corner-book-cta-btn"
                                                onClick={() => handleCornerBooking(selectedBuilding, selectedFloor, currentCornerData)}
                                            >
                                                이 코너 전문 마이스터 상담 예약하기 ⤓
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* ==============================================================================
                 * [탭 1] 📋 1:1 맞춤 상담 예약 화면 (기존 6대 카테고리 + 하이프리드 + 예약 폼 100% 보존)
                 * ============================================================================== */}
                {activeMainTab === 'booking' && (
                    <>
                        {/* 6대 카테고리 바로 위 쇼룸 투어 원클릭 이동 배너 버튼 */}
                        <div className="showroom-preview-banner-wrap">
                            <button
                                type="button"
                                className="showroom-preview-banner-btn"
                                onClick={() => {
                                    setActiveMainTab('showroom');
                                    trackMetaEvent('ViewContent', { content_name: '카테고리상단_매장미리보기배너', content_category: 'showroom_tour' });
                                    window.scrollTo({ top: 180, behavior: 'smooth' });
                                }}
                            >
                                🏢 경기권 최대 규모! A동·B동 층별 매장 내부 미리보기 ›
                            </button>
                        </div>

                        {/* ==============================================================================
                         * 4. 첫 화면 6대 카테고리 카드 (깔끔한 이모티콘 + 명칭만 노출)
                         * ============================================================================== */}
                        <section className="clean-categories-section">
                            <div className="clean-grid-6">
                                {SERVICE_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        className={`clean-cat-card ${selectedServiceId === cat.id ? 'active' : ''}`}
                                        onClick={() => handleCardClick(cat)}
                                    >
                                        <div className="clean-card-icon">{cat.icon}</div>
                                        <div className="clean-card-name">{cat.name}</div>
                                    </button>
                                ))}
                            </div>
                        </section>


                {/* ==============================================================================
                 * 4-2. 첫 화면 '하이프리드 가전 지원 결합 혜택' 핵심 안내 섹션 전면 배치
                 * ============================================================================== */}
                <section className="hifreed-highlight-section">
                    <div className="hifreed-card">
                        <div className="hifreed-header">
                            <span className="hifreed-hot-badge">🔥 경기광주점 인기 혜택</span>
                            <h2 className="hifreed-headline">하이프리드 가전 지원 결합 혜택 안내</h2>
                            <p className="hifreed-subcopy">
                                삼성·LG 등 브랜드 제한 없이 가전 지원금 35개월 분할 입금 지원 + 150회 만기 시 납입 원금 100% 전액 환급 (만기 85% + 축하금 15%)
                            </p>
                        </div>

                        {/* 3단계 핵심 절차 요약 (가로 3단 카드) */}
                        <div className="hifreed-steps-grid">
                            <div className="hifreed-step-box">
                                <span className="step-badge">STEP 1. 가전 자유 선택</span>
                                <p className="step-desc">브랜드·품목 제한 없이 필요한 가전제품 선택</p>
                            </div>
                            <div className="hifreed-step-box">
                                <span className="step-badge">STEP 2. 35개월 분할 지원</span>
                                <p className="step-desc">제휴카드 결제 후 35개월간 매월 10일 현금 입금 지원</p>
                            </div>
                            <div className="hifreed-step-box">
                                <span className="step-badge">STEP 3. 만기 100% 환급</span>
                                <p className="step-desc">150회 만기 완납 시 만기 85% + 축하금 15% 합산 100% 전액 환급</p>
                            </div>
                        </div>

                        {/* 플랜별 지원금 및 만기 환급금 한눈에 보기 (모바일 가독성 좋은 깔끔한 표) */}
                        <div className="hifreed-table-wrapper">
                            <div className="hifreed-table-title">플랜별 지원금 및 만기 환급금 한눈에 보기</div>
                            <div className="hifreed-table-scroll">
                                <table className="hifreed-plan-table">
                                    <thead>
                                        <tr>
                                            <th>플랜 구분</th>
                                            <th>월 상조회비 (150회)</th>
                                            <th>35개월 가전 지원금</th>
                                            <th>150회 만기 환급</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="plan-name-cell">하이프리드 75 (1구좌)</td>
                                            <td>월 상조회비 33,000원(150회)</td>
                                            <td className="plan-support-cell">월 23,473원 입금 <span>(총 75만 원 지원)</span></td>
                                            <td className="plan-refund-cell">만기 환급 495만 원</td>
                                        </tr>
                                        <tr>
                                            <td className="plan-name-cell">하이프리드 150 (2구좌)</td>
                                            <td>월 상조회비 66,000원(150회)</td>
                                            <td className="plan-support-cell">월 46,946원 입금 <span>(총 150만 원 지원)</span></td>
                                            <td className="plan-refund-cell">만기 환급 990만 원</td>
                                        </tr>
                                        <tr>
                                            <td className="plan-name-cell">하이프리드 225 (3구좌)</td>
                                            <td>월 상조회비 99,000원(150회)</td>
                                            <td className="plan-support-cell">월 70,419원 입금 <span>(총 225만 원 지원)</span></td>
                                            <td className="plan-refund-cell">만기 환급 1,485만 원</td>
                                        </tr>
                                        <tr className="popular-row">
                                            <td className="plan-name-cell">
                                                <span className="popular-pill">인기</span> 하이프리드 300 (4구좌·인기)
                                            </td>
                                            <td>월 상조회비 132,000원(150회)</td>
                                            <td className="plan-support-cell">월 93,892원 입금 <span>(총 300만 원 지원)</span></td>
                                            <td className="plan-refund-cell">만기 환급 1,980만 원</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 다구좌 결합 안내 */}
                        <div className="hifreed-multi-guide">
                            💡 플랜별 중복·자유 조합 가능 (최대 8개까지 가입 가능 — 300 플랜×2개 시 총 600만 원 지원 / ×4개 시 총 1,200만 원 지원 / ×8개 시 총 2,400만 원 분할 지원)
                        </div>

                        {/* 섹션 하단 바로가기 버튼 */}
                        <div className="hifreed-cta-wrap">
                            <button
                                type="button"
                                className="hifreed-cta-btn"
                                onClick={handleHiFreedBooking}
                            >
                                이 혜택 포함하여 가전 상담 예약하기 🡵
                            </button>
                        </div>

                        {/* 공정거래위원회 필수 고지 4대 문구 (하단 회색 안심 안내 박스) */}
                        <div className="hifreed-ftc-notice-box">
                            <div className="ftc-notice-title">공정거래위원회 필수 고지 안내</div>
                            <ol className="ftc-notice-list">
                                <li>1) 본 상품은 선불식 할부거래(상조) 결합 상품이며, 은행의 예·적금 등 금융상품이 아닙니다.</li>
                                <li>2) 상조 서비스를 미이용한 상태로 150회 만기 완납 시, 만기환급금 85% + 만기축하금 15%를 합산하여 납입 원금 100% 전액이 환급됩니다.</li>
                                <li>3) 35회차 이내 중도 해약 시 가전 지원금 지원이 중단되며, 상조 표준약관에 따라 중도해약환급금이 적용됩니다.</li>
                                <li>4) 가입 기간 중 상조는 물론 크루즈 여행, 웨딩 등 프리드라이프 라이프케어 서비스로 100% 전환 이용 가능합니다.</li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* ==============================================================================
                 * 5. 예약 폼 영역 (팝업에서 예약 진행 시 표출)
                 * ============================================================================== */}
                {isBookingActive && (
                    <section className="clean-booking-section" id="reservationFormSection">
                        {!bookingSubmitted ? (
                            <div className="clean-booking-box">
                                <div className="clean-booking-header">
                                    <div className="clean-booking-tag">1:1 맞춤 예약 접수</div>
                                    <h2 className="clean-booking-title">
                                        <span className="mr-2">{currentSelectedCategory.icon}</span>
                                        [{currentSelectedCategory.name}] 맞춤 상담 예약
                                    </h2>
                                    <p className="clean-booking-lead">
                                        {currentSelectedCategory.popupHeaderLead}
                                    </p>
                                    <button 
                                        type="button" 
                                        className="clean-change-cat-btn"
                                        onClick={handleResetBooking}
                                    >
                                        ✕ 다른 상담 선택하기 (첫 화면으로)
                                    </button>
                                </div>

                                {/* 6. 예약 폼 상단 '전문 마이스터 신뢰 배지' 추가 */}
                                <div className="meister-trust-badge-box">
                                    <div className="meister-trust-item">
                                        <span className="trust-icon">🛡️</span>
                                        <span>롯데하이마트 경기광주점 분야별 전문 마이스터가 과장 없이 정직한 1:1 맞춤 견적을 직접 설계해 드립니다.</span>
                                    </div>
                                    <div className="meister-trust-item">
                                        <span className="trust-icon">🚗</span>
                                        <span>매장 방문 시 전용 지상 대형 무료 주차장(경기도 광주시 이배재로 8)을 편리하게 이용하실 수 있습니다.</span>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmitReservation} className="clean-form">
                                    {/* 선택된 상담 요약 안내 (예약 화면에서 복잡한 체크박스 재출력 제거) */}
                                    <div className="clean-selected-summary-card">
                                        <div className="summary-card-header">
                                            <div className="summary-badge-group">
                                                <span className="summary-badge">선택된 상담</span>
                                                <span className="summary-cat-pill">{currentSelectedCategory.icon} {currentSelectedCategory.name}</span>
                                            </div>
                                            <button 
                                                type="button" 
                                                className="summary-edit-btn"
                                                onClick={() => setModalCategory(currentSelectedCategory)}
                                            >
                                                항목 수정 ✎
                                            </button>
                                        </div>
                                        <div className="summary-card-body">
                                            <div className="summary-tags-container">
                                                {selectedChecks.length > 0 ? (
                                                    selectedChecks.map(item => {
                                                        const mvnoInfo = KT_MVNO_PLANS_DATA[item];
                                                        return (
                                                            <span key={item} className="summary-tag-chip">
                                                                ✓ {item}{mvnoInfo ? ` (${mvnoInfo.contractType})` : ''}
                                                            </span>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="summary-tag-default">
                                                        선택 세부항목 없음 (매장 전문 상담사가 1:1 맞춤 견적 및 종합 상담을 진행해 드립니다)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 1. 상담 방식 선택: 매장 방문 / 비대면 상담 (단 2가지 선택지만 제공) */}
                                    <div className="form-group-block">
                                        <label className="form-group-title">
                                            1. 상담 방식 선택
                                        </label>
                                        <div className="consultation-type-grid">
                                            <button
                                                type="button"
                                                className={`consultation-type-card ${consultationType === '매장 방문' ? 'selected' : ''}`}
                                                onClick={() => setConsultationType('매장 방문')}
                                            >
                                                <div className="type-icon">🏢</div>
                                                <div className="type-info">
                                                    <div className="type-title">매장 방문</div>
                                                    <div className="type-desc">경기광주점 직접 내방 1:1 상담 (10:00 - 20:00)</div>
                                                </div>
                                                <div className="type-check">{consultationType === '매장 방문' ? '●' : '○'}</div>
                                            </button>

                                            <button
                                                type="button"
                                                className={`consultation-type-card ${consultationType === '비대면 상담' ? 'selected' : ''}`}
                                                onClick={() => setConsultationType('비대면 상담')}
                                            >
                                                <div className="type-icon">📞</div>
                                                <div className="type-info">
                                                    <div className="type-title">비대면 상담</div>
                                                    <div className="type-desc">카톡·문자 비대면 견적표 우선 수령 또는 유선 상담</div>
                                                </div>
                                                <div className="type-check">{consultationType === '비대면 상담' ? '●' : '○'}</div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. 예약자 정보 */}
                                    <div className="form-group-block">
                                        <label className="form-group-title">
                                            2. 예약자 정보
                                        </label>
                                        <div className="name-phone-flex">
                                            <div style={{ flex: 1 }}>
                                                <input 
                                                    type="text"
                                                    className="clean-input"
                                                    placeholder="성함 입력"
                                                    value={custName}
                                                    onChange={(e) => setCustName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <input 
                                                    type="tel"
                                                    className="clean-input"
                                                    placeholder="휴대폰 번호 (010-0000-0000)"
                                                    value={custPhone}
                                                    onChange={handlePhoneChange}
                                                    maxLength={13}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. 추가 문의사항 */}
                                    <div className="form-group-block">
                                        <label className="form-group-title">
                                            3. 추가 문의사항 (선택)
                                        </label>
                                        <textarea 
                                            className="clean-textarea"
                                            rows={2}
                                            placeholder="원하시는 제품 모델명이나 희망 시간 등 요청사항이 있으시면 적어주세요."
                                            value={customerNote}
                                            onChange={(e) => setCustomerNote(e.target.value)}
                                        />
                                    </div>

                                    {/* 개인정보 동의 */}
                                    <div className="privacy-check-row">
                                        <label className="privacy-label">
                                            <input 
                                                type="checkbox"
                                                checked={privacyAgreed}
                                                onChange={(e) => setPrivacyAgreed(e.target.checked)}
                                            />
                                            <span>[필수] 개인정보 수집 및 상담 예약 이용에 동의합니다.</span>
                                        </label>
                                        <button 
                                            type="button" 
                                            className="privacy-view-btn"
                                            onClick={() => setIsPrivacyModalOpen(true)}
                                        >
                                            전문보기
                                        </button>
                                    </div>

                                    {/* 7. 제출 버튼 상단 '영업 전화 안심 문구' 추가 */}
                                    <div className="safe-booking-guarantee-box">
                                        🔒 <strong>안심 예약 보장:</strong> 원치 않는 권유 전화 없이, 요청하신 맞춤 견적·혜택표부터 카카오톡이나 문자로 편하게 받아보실 수 있습니다.
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="clean-submit-btn"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? '예약 접수 중...' : '상담 예약 완료하기'}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            /* 예약 접수 완료 안내 */
                            <div className="clean-receipt-box">
                                <div className="receipt-success-badge">🎉 예약 접수 완료</div>
                                <h2 className="receipt-title">상담 예약이 정상적으로 접수되었습니다!</h2>
                                <p className="receipt-desc">
                                    롯데하이마트 경기광주점 전문 상담 매니저가 남겨주신 연락처로 신속히 안내를 도와드립니다.
                                </p>

                                <div className="receipt-ticket">
                                    <div className="ticket-row">
                                        <span className="lbl">상담 분야</span>
                                        <span className="val highlight">{completedData?.serviceName}</span>
                                    </div>
                                    <div className="ticket-row">
                                        <span className="lbl">선택 항목</span>
                                        <span className="val">{completedData?.checks?.join(', ')}</span>
                                    </div>
                                    <div className="ticket-row">
                                        <span className="lbl">상담 방식</span>
                                        <span className="val highlight">{completedData?.consultationType}</span>
                                    </div>
                                    <div className="ticket-row">
                                        <span className="lbl">예약자명</span>
                                        <span className="val">{completedData?.name} 고객님</span>
                                    </div>
                                    <div className="ticket-row">
                                        <span className="lbl">연락처</span>
                                        <span className="val">{completedData?.phone}</span>
                                    </div>
                                    <div className="ticket-row">
                                        <span className="lbl">매장 위치</span>
                                        <span className="val">경기도 광주시 이배재로 8 (031-767-1044)</span>
                                    </div>
                                </div>

                                <div className="receipt-actions">
                                    <a href={STORE_LINKS.phone} className="action-btn call" onClick={() => trackMetaEvent('Contact', { channel: '완료_전화' })}>
                                        📞 매장 바로 통화
                                    </a>
                                    <a href={STORE_LINKS.kakaoChat} target="_blank" rel="noreferrer" className="action-btn kakao" onClick={() => trackMetaEvent('Contact', { channel: '완료_카톡' })}>
                                        💬 카톡 1:1 상담
                                    </a>
                                    <a href={STORE_LINKS.naverTalk} target="_blank" rel="noreferrer" className="action-btn talk" onClick={() => trackMetaEvent('Contact', { channel: '완료_네이버톡톡' })}>
                                        🟢 네이버톡톡 문의
                                    </a>
                                </div>

                                <button type="button" className="clean-back-home-btn" onClick={handleResetBooking}>
                                    첫 화면으로 돌아가기
                                </button>
                            </div>
                        )}
                    </section>
                )}
                    </>
                )}
            </main>

            {/* ==============================================================================
             * 6. 카테고리 클릭 시 뜨는 설명 팝업 모달
             *    - 팝업 상단 멘트
             *    - 선택지들은 중복 선택 가능
             *    - 하위 선택지 연동
             * ============================================================================== */}
            {modalCategory && (
                <div className="clean-popup-overlay" onClick={handleCloseModal}>
                    <div className="clean-popup-card" onClick={(e) => e.stopPropagation()}>
                        {/* 팝업 헤더 */}
                        <div className="clean-popup-header">
                            <div className="clean-popup-title-row">
                                <h3 className="clean-popup-title">
                                    <span className="mr-2">{modalCategory.icon}</span>
                                    {modalCategory.name}
                                </h3>
                                <button 
                                    type="button" 
                                    className="clean-popup-close-x"
                                    onClick={handleCloseModal}
                                    aria-label="닫기"
                                >
                                    ✕
                                </button>
                            </div>
                            {/* 상단 멘트 */}
                            <div className="clean-popup-top-banner">
                                {modalCategory.popupHeaderLead}
                            </div>
                        </div>

                        {/* 팝업 바디: 복수 선택 가능한 선택지 및 세부 항목 */}
                        <div className="clean-popup-body">
                            {renderOptionSelector(modalCategory)}
                        </div>

                        {/* 팝업 하단 버튼 */}
                        <div className="clean-popup-footer">
                            <button 
                                type="button" 
                                className="popup-btn-cancel"
                                onClick={handleCloseModal}
                            >
                                닫기
                            </button>
                            <button 
                                type="button" 
                                className="popup-btn-confirm"
                                onClick={handleProceedToBooking}
                            >
                                이 상담으로 예약하기 ➔
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==============================================================================
             * 7. 단정한 푸터 (주소 통일 + 길찾기 연결 + 공식 SNS 홍보 채널 하단 배치)
             * ============================================================================== */}
            <footer className="clean-footer">
                <div className="clean-footer-inner">
                    <p className="clean-footer-info">
                        <strong>롯데하이마트 경기광주점</strong> | 대표전화: <a href="tel:031-767-1044">031-767-1044</a> | 영업시간: 10:00 - 20:00 (연중무휴)<br />
                        주소: 경기도 광주시 이배재로 8{' '}
                        <a
                            href={STORE_LINKS.naverMap}
                            target="_blank"
                            rel="noreferrer"
                            className="footer-map-link"
                            onClick={() => trackMetaEvent('FindLocation', { location: '푸터_길찾기' })}
                        >
                            [길찾기]
                        </a>
                    </p>

                    {/* 하단 푸터 SNS 홍보 채널 버튼 영역 */}
                    <div className="clean-footer-sns-group">
                        <a 
                            href={STORE_LINKS.naverBlog} 
                            target="_blank" 
                            rel="noreferrer"
                            className="footer-sns-btn"
                            onClick={() => trackMetaEvent('Contact', { channel: '푸터_네이버블로그' })}
                        >
                            <span className="btn-icon-dot naver-dot">N</span>
                            <span>네이버 블로그</span>
                        </a>
                        <a 
                            href={STORE_LINKS.instagram} 
                            target="_blank" 
                            rel="noreferrer"
                            className="footer-sns-btn"
                            onClick={() => trackMetaEvent('Contact', { channel: '푸터_인스타' })}
                        >
                            <span className="btn-icon-dot insta-dot">📸</span>
                            <span>인스타그램</span>
                        </a>
                        <a 
                            href={STORE_LINKS.facebook} 
                            target="_blank" 
                            rel="noreferrer"
                            className="footer-sns-btn"
                            onClick={() => trackMetaEvent('Contact', { channel: '푸터_페이스북' })}
                        >
                            <span className="btn-icon-dot fb-dot">f</span>
                            <span>페이스북</span>
                        </a>
                        <a 
                            href={STORE_LINKS.kakaoChannel} 
                            target="_blank" 
                            rel="noreferrer"
                            className="footer-sns-btn"
                            onClick={() => trackMetaEvent('Contact', { channel: '푸터_카카오채널' })}
                        >
                            <span>💬</span>
                            <span>카카오톡 채널</span>
                        </a>
                    </div>

                    <div className="clean-footer-links">
                        <button type="button" onClick={() => setIsPrivacyModalOpen(true)}>개인정보처리방침</button>
                    </div>
                    <p className="clean-footer-copy">© LOTTE HIMART Gyeonggi-Gwangju Branch. All rights reserved.</p>
                </div>
            </footer>

            {/* 개인정보 처리방침 모달 */}
            {isPrivacyModalOpen && (
                <div className="clean-popup-overlay" onClick={() => setIsPrivacyModalOpen(false)}>
                    <div className="clean-popup-card privacy-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="clean-popup-header">
                            <div className="clean-popup-title-row">
                                <h3 className="clean-popup-title" style={{ fontSize: '1.15rem' }}>개인정보 수집 및 이용 안내</h3>
                                <button type="button" className="clean-popup-close-x" onClick={() => setIsPrivacyModalOpen(false)}>✕</button>
                            </div>
                        </div>
                        <div className="clean-popup-body" style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#444' }}>
                            <p><strong>1. 수집 항목:</strong> 성함, 연락처(휴대폰 번호), 상담 선택 항목, 상담 방식(매장방문/비대면), 추가 문의</p>
                            <p><strong>2. 수집 목적:</strong> 롯데하이마트 경기광주점 1:1 맞춤 상담 예약 접수 및 일정 조율 안내</p>
                            <p><strong>3. 보유 및 이용 기간:</strong> 상담 완료일로부터 6개월 보관 후 안전하게 파기</p>
                            <p><strong>4. 동의 거부 권리:</strong> 고객님은 수집 동의를 거부하실 수 있으나, 미동의 시 상담 접수가 제한됩니다.</p>
                        </div>
                        <div className="clean-popup-footer">
                            <button type="button" className="popup-btn-confirm" onClick={() => setIsPrivacyModalOpen(false)}>
                                확인 완료
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
