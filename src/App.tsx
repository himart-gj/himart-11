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
        // 요청: 단품/세트만 주요 옵션으로 두고 이사/입주/웨딩은 같은 선상이 아닌 추가 선택으로 분리
        mainOptions: ['단품 상담', '세트 상담'],
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

export default function App() {
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
             * 1. 최상단 매장 기본 정보 바 (기본주소, 연락처, 영업시간 10:00 - 20:00)
             * ============================================================================== */}
            <header className="clean-top-store-bar">
                <div className="clean-top-store-inner">
                    <div className="clean-store-brand">
                        <span className="brand-dot" />
                        <span className="clean-brand-name">롯데하이마트 경기광주점</span>
                    </div>
                    <div className="clean-store-meta-group">
                        <span className="clean-meta-item">
                            📍 경기도 광주시 이배재로 8 (경안동 36-9)
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
             * 2. 네이버 블로그, 인스타, 페이스북 + 카톡문의, 네이버톡문의, 전화문의 한 줄 배치
             * ============================================================================== */}
            <nav className="clean-quick-nav-bar">
                <div className="clean-quick-nav-inner">
                    {/* SNS 바로가기 그룹 */}
                    <div className="clean-nav-sns-group">
                        <a 
                            href={STORE_LINKS.naverBlog} 
                            target="_blank" 
                            rel="noreferrer"
                            className="clean-sns-btn blog"
                            title="롯데하이마트 경기광주점 공식 네이버 블로그"
                            onClick={() => trackMetaEvent('Contact', { channel: '한줄_네이버블로그' })}
                        >
                            <span className="btn-icon-dot naver-dot">N</span>
                            <span className="btn-txt">네이버 블로그</span>
                        </a>
                        <a 
                            href={STORE_LINKS.instagram} 
                            target="_blank" 
                            rel="noreferrer"
                            className="clean-sns-btn insta"
                            title="롯데하이마트 경기광주점 공식 인스타그램"
                            onClick={() => trackMetaEvent('Contact', { channel: '한줄_인스타' })}
                        >
                            <span className="btn-icon-dot insta-dot">📸</span>
                            <span className="btn-txt">인스타그램</span>
                        </a>
                        <a 
                            href={STORE_LINKS.facebook} 
                            target="_blank" 
                            rel="noreferrer"
                            className="clean-sns-btn fb"
                            title="롯데하이마트 경기광주점 공식 페이스북"
                            onClick={() => trackMetaEvent('Contact', { channel: '한줄_페이스북' })}
                        >
                            <span className="btn-icon-dot fb-dot">f</span>
                            <span className="btn-txt">페이스북</span>
                        </a>
                    </div>

                    <div className="clean-nav-v-line" />

                    {/* 실시간 톡 및 전화 문의 그룹 */}
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
             * 3. 임팩트 있는 한 줄 헤더
             * ============================================================================== */}
            <main className="clean-main-content">
                <section className="clean-hero-simple">
                    <div className="clean-hero-badge">경기권 최대 규모 매장</div>
                    <h1 className="clean-hero-title">
                        롯데하이마트 경기광주점
                    </h1>
                    <p className="clean-hero-impact-line">
                        원하시는 상담을 선택해 주세요
                    </p>
                </section>

                {/* ==============================================================================
                 * 4. 첫 화면 카드 (깔끔한 이모티콘 + 명칭만 노출)
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
                                                <div className="type-icon">🏬</div>
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
                                                    <div className="type-desc">전화 또는 카톡/메신저 유선 견적 상담</div>
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
                                    롯데하이마트 경기광주점 전문 상담 매니저가 남겨주신 연락처로 신속히 안내 전화를 드립니다.
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
                                        <span className="val">경기 광주시 이배재로 8 (031-767-1044)</span>
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
             * 7. 단정한 푸터
             * ============================================================================== */}
            <footer className="clean-footer">
                <div className="clean-footer-inner">
                    <p className="clean-footer-info">
                        <strong>롯데하이마트 경기광주점</strong> | 대표전화: <a href="tel:031-767-1044">031-767-1044</a> | 연중무휴 10:00 - 20:00<br />
                        사업장 소재지: 경기도 광주시 이배재로 8 (경안동 36-9)
                    </p>
                    <div className="clean-footer-links">
                        <button type="button" onClick={() => setIsPrivacyModalOpen(true)}>개인정보처리방침</button>
                        <span>|</span>
                        <a href={STORE_LINKS.naverBlog} target="_blank" rel="noreferrer">네이버 블로그</a>
                        <span>|</span>
                        <a href={STORE_LINKS.instagram} target="_blank" rel="noreferrer">인스타그램</a>
                        <span>|</span>
                        <a href={STORE_LINKS.facebook} target="_blank" rel="noreferrer">페이스북</a>
                        <span>|</span>
                        <a href={STORE_LINKS.kakaoChannel} target="_blank" rel="noreferrer">카카오톡 채널</a>
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
