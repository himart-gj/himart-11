import React, { useState, useEffect, useRef } from 'react';

const Editable = ({ as: Tag = 'div', id, defaultHtml, isAdmin, className = "", style = {} }: any) => {
    const [html, setHtml] = useState(defaultHtml);
    
    useEffect(() => {
        const savedText = localStorage.getItem(`EDITABLE_${id}`);
        if (savedText) {
            setHtml(savedText);
        }
    }, [id]);

    return (
        <Tag 
            id={id}
            className={`${className} ${isAdmin ? 'editable' : ''}`}
            style={style}
            contentEditable={isAdmin}
            suppressContentEditableWarning={true}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

export default function App() {
    const [activeTab, setActiveTab] = useState('tab-home');
    const [isAdmin, setIsAdmin] = useState(false);
    const [scriptUrl, setScriptUrl] = useState('');
    const [showVideo, setShowVideo] = useState(true);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [imageModalSrc, setImageModalSrc] = useState<string | null>(null);
    const [isAffiliateOpen, setIsAffiliateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [dDayText, setDDayText] = useState('');
    const [countdownText, setCountdownText] = useState('');
    
    let tapCount = useRef(0);
    let tapTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const savedUrl = localStorage.getItem('G_SCRIPT_URL');
        if (savedUrl) setScriptUrl(savedUrl);
        else setScriptUrl("https://script.google.com/macros/s/AKfycbxuyJQum74ADQoA2uDRhki94HX8nXjtdIH4_OqMAjowrT5_WsK7O5AJGHSu6DIADy81/exec");

        const savedVideoToggle = localStorage.getItem('SHOW_VIDEO');
        if (savedVideoToggle !== null) setShowVideo(savedVideoToggle === 'true');

        const savedBg = localStorage.getItem('BG_IMAGE');
        if (savedBg) {
            document.documentElement.style.setProperty('--main-bg-img', `url('${savedBg}')`);
        }

        const checkImages = async () => {
            // 이미지 존재 여부를 확인하기 위해 1번부터 10번까지의 경로를 설정합니다.
            // onLoad와 onError 이벤트를 통해 존재하는 이미지만 렌더링하도록 최적화했습니다.
            const potentialImages = Array.from({ length: 10 }, (_, i) => `./promo_img_${i + 1}.jpg`);
            setImages(potentialImages);
        };
        checkImages();
    }, []);

    useEffect(() => {
        const updateDDay = () => {
            const now = new Date();
            const year = now.getFullYear();
            const startDate = new Date(year, 9, 2); // Oct 2 (Month is 0-indexed)
            const endDate = new Date(year, 9, 6, 23, 59, 59); // Oct 6

            if (now > endDate) {
                setDDayText('행사 마감');
                setCountdownText('');
            } else if (now >= startDate && now <= endDate) {
                setDDayText('D-DAY 행사진행중!');
                const diffTime = endDate.getTime() - now.getTime();
                const d = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const h = Math.floor((diffTime / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
                const m = Math.floor((diffTime / 1000 / 60) % 60).toString().padStart(2, '0');
                const s = Math.floor((diffTime / 1000) % 60).toString().padStart(2, '0');
                setCountdownText(`남은시간 ${d}일 ${h}:${m}:${s}`);
            } else {
                const diffTime = startDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setDDayText(`오픈까지 D-${diffDays}`);
                const h = Math.floor((diffTime / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
                const m = Math.floor((diffTime / 1000 / 60) % 60).toString().padStart(2, '0');
                const s = Math.floor((diffTime / 1000) % 60).toString().padStart(2, '0');
                setCountdownText(`${h}:${m}:${s}`);
            }
        };
        updateDDay();
        const interval = setInterval(updateDDay, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isAdmin) document.body.classList.add('admin-active');
        else document.body.classList.remove('admin-active');
    }, [isAdmin]);

    const handleSecretClick = () => {
        tapCount.current += 1;
        if (tapTimeout.current) clearTimeout(tapTimeout.current);
        
        if (tapCount.current >= 5) {
            tapCount.current = 0;
            const pwd = prompt("비밀번호를 입력하세요.");
            if (pwd && btoa(pwd) === "NTE3NDU2NzI=") {
                setIsAdmin(true);
            } else if (pwd) {
                alert("접근이 거부되었습니다.");
            }
        } else {
            tapTimeout.current = setTimeout(() => { tapCount.current = 0; }, 1500);
        }
    };

    const saveSettings = () => {
        setIsAdmin(false);
        localStorage.setItem('G_SCRIPT_URL', scriptUrl);
        localStorage.setItem('SHOW_VIDEO', showVideo.toString());
        
        document.querySelectorAll('.editable').forEach((el) => {
            if (el.id) localStorage.setItem(`EDITABLE_${el.id}`, el.innerHTML);
        });
        alert("설정이 임시 저장되었습니다.\n(GitHub 연동 시 소스 코드를 직접 수정해야 영구 반영됩니다.)");
    };

    const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                document.documentElement.style.setProperty('--main-bg-img', `url('${result}')`);
                try {
                    localStorage.setItem('BG_IMAGE', result);
                } catch (err) {
                    console.warn("Image too large for localStorage");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const goToReservation = () => {
        setActiveTab('tab-home');
        setTimeout(() => {
            const formElement = document.getElementById('reservationFormSection');
            if (formElement) {
                const yOffset = -80; 
                const y = formElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
            }
        }, 50);
    };

    const submitToGoogleSheet = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const name = (document.getElementById('custName') as HTMLInputElement).value;
        const phone = (document.getElementById('custPhone') as HTMLInputElement).value;
        const type = (document.getElementById('custType') as HTMLSelectElement).value;

        const checkboxes = document.querySelectorAll('input[name="homeService"]:checked');
        const selectedServices = Array.from(checkboxes).map(cb => (cb as HTMLInputElement).value).join(', ');

        if (!scriptUrl || scriptUrl.trim() === "") {
            alert(`${name} 고객님! 맞춤 상담 예약이 정상 접수되었습니다.\n(현재 구글 시트 URL이 연동되지 않아 테스트로 작동합니다.)\n선택된 추가 서비스: ${selectedServices || "없음"}`);
            form.reset();
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('이름', name);
            formData.append('연락처', phone);
            formData.append('관심품목', type);
            formData.append('추가서비스', selectedServices);

            // fire and forget pattern for faster UX
            fetch(scriptUrl, { method: 'POST', mode: 'no-cors', body: formData });
            alert(`${name} 고객님! 1:1 맞춤 상담 예약이 성공적으로 접수되었습니다.`);
            form.reset();
        } catch (error) {
            alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <header>
                <div className="logo">
                    <span className="logo-lotte">LOTTE</span>
                    <span className="logo-himart">HIMART</span>
                </div>
                <nav className="top-nav">
                    <button className={`nav-btn ${activeTab === 'tab-home' ? 'active' : ''}`} onClick={() => { setActiveTab('tab-home'); window.scrollTo(0,0); }}>홈</button>
                    <button className={`nav-btn ${activeTab === 'tab-details' ? 'active' : ''}`} onClick={() => { setActiveTab('tab-details'); window.scrollTo(0,0); }}>상세 혜택</button>
                </nav>
            </header>

            <div id="tab-home" className={`page-tab ${activeTab === 'tab-home' ? 'active' : ''}`}>
                <section className="hero-section">
                    <div className="hero-content">
                        {dDayText && (
                            <div className="dday-badge">
                                {dDayText}
                                {countdownText && <span className="countdown-text">{countdownText}</span>}
                            </div>
                        )}
                        <Editable id="edit-store-name" className="store-name" defaultHtml="롯데하이마트 경기광주점" isAdmin={isAdmin} />
                        <Editable as="h1" id="edit-hero-title" className="hero-title" defaultHtml={`1년 중 단 한 번, 압도적 혜택<br><span class="highlight">리뉴얼 1주년 그랜드 오픈</span>`} isAdmin={isAdmin} />
                        <Editable as="p" id="edit-hero-desc" className="hero-desc" defaultHtml={`가전은 '오픈점' 혜택이 가장 크다는 사실, 알고 계시죠?<br>어디와 비교해도 자신 있는 올해 최고의 조건.<br>지금 사전예약하시고 선착순 고객 혜택을 선점하세요.<br><div>행사기간 : 10월 2일(금) - 6일(화) , 단 5일간!</div>`} isAdmin={isAdmin} />
                        
                        <div className="hero-actions-container">
                            <button type="button" onClick={goToReservation} className="btn-primary">
                                <Editable as="span" id="edit-btn-reserve" defaultHtml="맞춤 상담 예약하기" isAdmin={isAdmin} />
                            </button>
                            <div className="hero-sns-group">
                                <a href="https://m.blog.naver.com/himart411" target="_blank" rel="noreferrer" className="btn-icon" title="네이버 블로그">
                                    <svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.222 17.514L10.378 11.23V16.8H8V7h2.155l5.467 5.85V7H18v10.514h-1.778z"></path></svg>
                                </a>
                                <a href="https://www.instagram.com/himart.ggukji?stkn=MTVtMGd2cG51NzNwOQ==" target="_blank" rel="noreferrer" className="btn-icon" title="인스타그램">
                                    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path></svg>
                                </a>
                                <a href="https://www.facebook.com/share/1LNxcC3GL5/" target="_blank" rel="noreferrer" className="btn-icon" title="페이스북">
                                    <svg viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path></svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="media-area">
                        {showVideo && (
                            <div id="videoWrapper">
                                {/* 소리가 나오도록 muted와 autoPlay를 제거했습니다. (브라우저 정책상 소리 있는 자동재생은 차단됨) */}
                                <video id="promoVideo" loop playsInline controls controlsList="nodownload">
                                    {/* 깃허브 페이지 하위 경로 호환을 위해 절대경로가 아닌 상대경로 유지 */}
                                    <source src="promo_video.mp4" type="video/mp4" />
                                    <source src="./promo9.mp4" type="video/mp4" />
                                    <source src="https://assets.mixkit.co/videos/preview/mixkit-vertical-shot-of-a-woman-using-a-smartphone-41484-large.mp4" type="video/mp4" />
                                </video>
                            </div>
                        )}
                        
                        <div className="gallery-wrapper" style={{ display: images.length > 0 ? 'block' : 'none' }}>
                            <div id="promoImageStack">
                                {images.map((src, i) => (
                                    <div key={i} className="promo-img-item" onClick={() => setImageModalSrc(src)} style={{ display: 'none' }}>
                                        <img 
                                            src={src} 
                                            alt={`Promo ${i + 1}`} 
                                            onLoad={(e) => (e.target as HTMLImageElement).parentElement!.style.display = 'block'} 
                                            onError={(e) => (e.target as HTMLImageElement).parentElement!.style.display = 'none'} 
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="teaser-section">
                    <Editable id="edit-teaser-title" className="teaser-title" defaultHtml="리뉴얼 1주년 핵심 혜택 요약" isAdmin={isAdmin} />
                    <div className="teaser-list">
                        <Editable id="edit-teaser-1" className="teaser-item" defaultHtml="LG·삼성 다품목 구매 시 브랜드 본사 추가 지원금 적용" isAdmin={isAdmin} />
                        <Editable id="edit-teaser-2" className="teaser-item" defaultHtml="결제 금액대별 제휴카드 최대 캐시백 혜택" isAdmin={isAdmin} />
                        <Editable id="edit-teaser-3" className="teaser-item" defaultHtml="신축 입주 및 웨딩 고객 대상 단독 특별 추가 할인" isAdmin={isAdmin} />
                        <Editable id="edit-teaser-4" className="teaser-item" defaultHtml="오직 경기광주점만의 단독 리뉴얼 혜택 적용" isAdmin={isAdmin} />
                    </div>
                    <button type="button" onClick={() => { setActiveTab('tab-details'); window.scrollTo(0,0); }} className="btn-outline">
                        <Editable as="span" id="edit-teaser-btn" defaultHtml="자세한 혜택 전체보기 →" isAdmin={isAdmin} />
                    </button>
                </div>

                <section className="section-container" id="reservationFormSection" style={{ paddingTop: '20px' }}>
                    <div className="reservation-wrapper">
                        <div className="section-header" style={{ marginBottom: '40px', textAlign: 'left' }}>
                            <Editable as="h2" id="edit-form-h2" style={{ fontSize: '2.3rem', marginBottom: '12px', color: 'var(--text-title)', fontWeight: 800 }} defaultHtml="1:1 맞춤 상담 예약" isAdmin={isAdmin} />
                            <Editable as="p" id="edit-form-p" style={{ color: 'var(--primary-red)', fontSize: '1.1rem', fontWeight: 800 }} defaultHtml="가장 합리적인 견적을 위해 사전 예약을 남겨주세요." isAdmin={isAdmin} />
                        </div>

                        <form id="gSheetForm" onSubmit={submitToGoogleSheet}>
                            <div className="form-row">
                                <Editable as="label" id="edit-label-1" defaultHtml="고객 성함 (필수)" isAdmin={isAdmin} />
                                <input type="text" id="custName" className="lux-input" placeholder="성함을 입력해주세요" required />
                            </div>
                            <div className="form-row">
                                <Editable as="label" id="edit-label-2" defaultHtml="연락처 (필수)" isAdmin={isAdmin} />
                                <input type="tel" id="custPhone" className="lux-input" placeholder="010-0000-0000" required />
                            </div>
                            <div className="form-row">
                                <Editable as="label" id="edit-label-3" defaultHtml="구매 유형 (필수)" isAdmin={isAdmin} />
                                <select id="custType" className="lux-input" required defaultValue="">
                                    <option value="" disabled>구매 유형을 반드시 선택해주세요</option>
                                    <option value="신축 입주 고객">신축 입주 고객</option>
                                    <option value="이사 고객">이사 고객</option>
                                    <option value="웨딩 혼수 고객">웨딩 혼수 고객</option>
                                    <option value="일반 세트 가전 구매 고객 (2품목 이상)">일반 세트 가전 구매 고객 (2품목 이상)</option>
                                    <option value="일반 단품 구매 고객">일반 단품 구매 고객</option>
                                </select>
                            </div>

                            <div className={`affiliate-toggle ${isAffiliateOpen ? 'open' : ''}`} onClick={() => setIsAffiliateOpen(!isAffiliateOpen)}>
                                <Editable as="span" id="edit-affiliate-title" defaultHtml="🎁 제휴 서비스 견적 추가 (선택사항)" isAdmin={isAdmin} />
                                <span className="chevron">▼</span>
                            </div>
                            <div className={`checkbox-wrapper ${isAffiliateOpen ? 'open' : ''}`} id="affiliateWrapper">
                                <div className="checkbox-grid">
                                    <label className="checkbox-item"><input type="checkbox" name="homeService" value="중문 창호 무료 견적" /> <Editable as="span" id="edit-aff-1" defaultHtml="중문 창호 무료 견적" isAdmin={isAdmin} /></label>
                                    <label className="checkbox-item"><input type="checkbox" name="homeService" value="홈 부분/전체 인테리어" /> <Editable as="span" id="edit-aff-2" defaultHtml="홈 부분/전체 인테리어" isAdmin={isAdmin} /></label>
                                    <label className="checkbox-item"><input type="checkbox" name="homeService" value="가전 장 공사" /> <Editable as="span" id="edit-aff-3" defaultHtml="가전 장 공사" isAdmin={isAdmin} /></label>
                                    <label className="checkbox-item"><input type="checkbox" name="homeService" value="포장 이사 견적" /> <Editable as="span" id="edit-aff-4" defaultHtml="포장 이사 견적" isAdmin={isAdmin} /></label>
                                    <label className="checkbox-item"><input type="checkbox" name="homeService" value="입주/이사 청소" /> <Editable as="span" id="edit-aff-5" defaultHtml="입주/이사 청소" isAdmin={isAdmin} /></label>
                                    <label className="checkbox-item"><input type="checkbox" name="homeService" value="새집 증후군 시공" /> <Editable as="span" id="edit-aff-6" defaultHtml="새집 증후군 시공" isAdmin={isAdmin} /></label>
                                    <label className="checkbox-item"><input type="checkbox" name="homeService" value="가전 이전 설치" /> <Editable as="span" id="edit-aff-7" defaultHtml="가전 이전 설치" isAdmin={isAdmin} /></label>
                                    <label className="checkbox-item"><input type="checkbox" name="homeService" value="가전 클리닝" /> <Editable as="span" id="edit-aff-8" defaultHtml="가전 클리닝" isAdmin={isAdmin} /></label>
                                </div>
                            </div>

                            <div className="privacy-row">
                                <input type="checkbox" id="privacyCheck" required />
                                <label htmlFor="privacyCheck" style={{ margin: 0, color: '#555', cursor: 'pointer', userSelect: 'none' }}>개인정보 수집 및 이벤트 알림 수신 동의 (필수)</label>
                                <button type="button" className="info-btn" onClick={() => setIsPrivacyModalOpen(true)}>?</button>
                            </div>

                            <button type="submit" id="submitBtnText" className="btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                                <Editable as="span" id="edit-form-submit" defaultHtml={isSubmitting ? "예약 전송 중..." : "예약 신청 및 단독 혜택 받기"} isAdmin={isAdmin} />
                            </button>
                        </form>
                    </div>
                </section>
            </div>

            <div id="tab-details" className={`page-tab ${activeTab === 'tab-details' ? 'active' : ''}`}>
                <section className="section-container" style={{ paddingTop: '120px' }}>
                    <div className="section-header">
                        <Editable as="h2" id="edit-detail-h2" defaultHtml="1주년 특별 단독 혜택" isAdmin={isAdmin} />
                        <Editable as="p" id="edit-detail-p" style={{ color: 'var(--primary-red)', marginTop: '10px' }} defaultHtml="이번이 아니면 만날 수 없는 절대 놓치면 안 될 기회!" isAdmin={isAdmin} />
                        <Editable id="edit-detail-badge" className="badge-multi" defaultHtml="🔥 아래 혜택 모두 중복 적용 가능" isAdmin={isAdmin} />
                    </div>

                    <div className="luxury-list">
                        <div className="luxury-item">
                            <div className="item-number">01</div>
                            <div className="item-content">
                                <Editable as="h3" id="edit-item-1-h" defaultHtml="LG·삼성 프리미엄관 & 브랜드 추가 지원" isAdmin={isAdmin} />
                                <Editable as="p" id="edit-item-1-p" defaultHtml="LG전자와 삼성전자의 최상위 라인업을 다품목 혜택으로 묶고, 각 브랜드 본사에서 직접 지원하는 시크릿 혜택을 추가로 적용해 드립니다." isAdmin={isAdmin} />
                            </div>
                        </div>
                        <div className="luxury-item">
                            <div className="item-number">02</div>
                            <div className="item-content">
                                <Editable as="h3" id="edit-item-2-h" defaultHtml="결제 금액대별 제휴카드 최대 캐시백" isAdmin={isAdmin} />
                                <Editable as="p" id="edit-item-2-p" defaultHtml="가전 구매 시 가장 큰 고민인 결제 부담. 하이마트 전용 제휴 카드를 통해 구간별 최고 한도의 캐시백을 현금처럼 즉시 돌려드립니다." isAdmin={isAdmin} />
                            </div>
                        </div>
                        <div className="luxury-item">
                            <div className="item-number">03</div>
                            <div className="item-content">
                                <Editable as="h3" id="edit-item-3-h" defaultHtml="신축 입주·웨딩 고객 단독 특별 할인" isAdmin={isAdmin} />
                                <Editable as="p" id="edit-item-3-p" defaultHtml="새로운 시작을 준비하시는 이사, 입주, 혼수 고객님을 위해 증빙 서류 지참 시 기본 할인을 뛰어넘는 1주년 특별 추가 할인율을 보장합니다." isAdmin={isAdmin} />
                            </div>
                        </div>
                        <div className="luxury-item">
                            <div className="item-number">04</div>
                            <div className="item-content">
                                <Editable as="h3" id="edit-item-4-h" defaultHtml="경기광주점 리뉴얼 한정 특가 & 세트 혜택" isAdmin={isAdmin} />
                                <Editable as="p" id="edit-item-4-p" defaultHtml="오직 이번 경기광주점 리뉴얼 오픈 행사 기간에만 오픈되는 개별 품목 파격가. 그리고 2품목 이상 세트 구성 시 숨겨진 추가 지원금이 지급됩니다." isAdmin={isAdmin} />
                            </div>
                        </div>
                        <div className="luxury-item">
                            <div className="item-number">05</div>
                            <div className="item-content">
                                <Editable as="h3" id="edit-item-5-h" defaultHtml="구매 금액대별 프리미엄 사은품 증정" isAdmin={isAdmin} />
                                <Editable as="p" id="edit-item-5-p" defaultHtml="구매하신 제품 금액에 따라 최적의 사은품을 준비했습니다." isAdmin={isAdmin} />
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ textAlign: 'center', marginTop: '60px' }}>
                        <button type="button" onClick={goToReservation} className="btn-primary" style={{ padding: '18px 40px', fontSize: '1.15rem' }}>맞춤 상담 예약하러 가기</button>
                    </div>
                </section>
            </div>

            <footer>
                <Editable id="edit-footer-logo" className="footer-logo" defaultHtml="롯데하이마트 경기광주점" isAdmin={isAdmin} />
                <div className="footer-info">
                    <Editable as="p" id="edit-footer-p1" defaultHtml="주소 : 경기도 광주시 이배재로 8 (경안동)" isAdmin={isAdmin} />
                    <Editable as="p" id="edit-footer-p2" defaultHtml={`전화 : <a href="tel:031-767-1044">031-767-1044</a>`} isAdmin={isAdmin} />
                </div>
                <Editable as="p" id="edit-footer-notice" className="footer-notice" defaultHtml="본 프로모션은 매장 상황에 따라 예고 없이 변동 및 조기 종료될 수 있습니다." isAdmin={isAdmin} />
            </footer>

            <div className={`modal-overlay ${imageModalSrc ? 'open' : ''}`} onClick={() => setImageModalSrc(null)}>
                <div id="imageModal" className={imageModalSrc ? 'open' : ''} onClick={(e) => e.stopPropagation()}>
                    <span className="close-img-modal" onClick={() => setImageModalSrc(null)}>×</span>
                    {imageModalSrc && <img src={imageModalSrc} alt="확대 이미지" />}
                </div>
            </div>

            <div className="floating-bar">
                <div className="floating-icons-wrapper">
                    <a href="http://pf.kakao.com/_hnxcxexl/chat" target="_blank" rel="noreferrer" className="floating-icon">
                        <svg viewBox="0 0 24 24"><path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.2 4.5 6.6l-1 3.4c-.1.3.2.6.5.4l4-2.7c.6.1 1.3.2 2 .2 5.5 0 10-3.5 10-7.8S17.5 3 12 3z"></path></svg>
                        <Editable as="span" id="edit-float-1" defaultHtml="카톡" isAdmin={isAdmin} />
                    </a>
                    <a href="https://talk.naver.com/ct/wd21jdv" target="_blank" rel="noreferrer" className="floating-icon">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"></path></svg>
                        <Editable as="span" id="edit-float-2" defaultHtml="톡톡" isAdmin={isAdmin} />
                    </a>
                    <a href="tel:031-767-1044" className="floating-icon">
                        <svg viewBox="0 0 24 24"><path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.4-1.2-.6-2.4-.6-3.6 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1zM19 12h2c0-4.8-3.9-8.7-8.7-8.7v2c3.7 0 6.7 3 6.7 6.7z"></path></svg>
                        <Editable as="span" id="edit-float-3" defaultHtml="전화" isAdmin={isAdmin} />
                    </a>
                </div>
                <button type="button" onClick={goToReservation} className="floating-reserve-btn">
                    <Editable as="span" id="edit-float-btn" defaultHtml="1:1 상담 예약하기" isAdmin={isAdmin} />
                </button>
            </div>

            <div className={`modal-overlay ${isPrivacyModalOpen ? 'open' : ''}`}>
                <div className="modal-content">
                    <h4>개인정보 수집 및 이용 동의 안내</h4>
                    <p>고객님의 소중한 개인정보는 아래의 목적으로만 안전하게 사용됩니다.</p>
                    <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '15px 0' }} />
                    <p><strong>■ 수집 목적:</strong> 리뉴얼 1주년 행사 안내, 사전예약 상담 및 쿠폰 발송</p>
                    <p><strong>■ 수집 항목:</strong> 성명, 휴대폰 번호, 구매 유형, 추가 시공 여부</p>
                    <p><strong>■ 보유 기간:</strong> 행사 종료 및 상담 완료 후 3개월 내 즉시 파기</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '20px', color: '#888', lineHeight: 1.5 }}>* 본 동의를 거부하실 권리가 있으나, 거부 시 특별 혜택 안내 및 원활한 상담 예약이 제한될 수 있습니다.</p>
                    <button type="button" className="close-modal" onClick={() => setIsPrivacyModalOpen(false)}>내용을 확인했습니다</button>
                </div>
            </div>

            <button id="secretBtn" title="관리자" onClick={handleSecretClick}></button>

            <div id="admin-panel" className={isAdmin ? 'open' : ''}>
                <h4>
                    <span>🛠 매니저 컨트롤 패널</span>
                </h4>
                <div className="admin-box">
                    <label>1. 구글 시트 연동 (Apps Script URL)</label>
                    <input type="text" value={scriptUrl} onChange={(e) => setScriptUrl(e.target.value)} className="admin-input" placeholder="https://script.google.com/macros/s/..." title="구글 시트 연동용 URL을 넣으세요." />
                </div>
                <div className="admin-box">
                    <label>2. 메인 9:16 동영상 표시/숨기기</label>
                    <label className="toggle-label">
                        <span>동영상 켜기</span>
                        <input type="checkbox" checked={showVideo} onChange={(e) => setShowVideo(e.target.checked)} />
                        <div className="slider"></div>
                    </label>
                </div>
                <div className="admin-box">
                    <label>3. 메인 전체 배경 사진 업로드</label>
                    <input type="file" onChange={handleBgUpload} className="admin-input" accept="image/*" />
                </div>
                <div className="admin-box" style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                    <label style={{ color: 'var(--primary-red)' }}>📁 파일 기반 동영상/사진 업로드 방법</label>
                    <p style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.5, marginTop: '5px' }}>
                        - 동영상: public 폴더에 <strong>promo_video.mp4</strong> 이름으로 덮어씌우세요.<br />
                        - 사진(최대 10장): public 폴더에 <strong>promo_img_1.jpg</strong> 로 덮어씌우면 자동으로 나타납니다.
                    </p>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '15px' }}>* 화면 텍스트를 클릭하면 글씨 수정이 가능합니다.</p>
                <button type="button" className="admin-btn save" onClick={saveSettings}>설정 임시 저장</button>
                <button type="button" className="admin-btn close" onClick={() => setIsAdmin(false)}>저장하지 않고 창 닫기</button>
            </div>
        </>
    );
}
