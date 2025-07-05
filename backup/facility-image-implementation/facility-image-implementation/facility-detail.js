/**
 * 시설 상세보기 페이지 전용 JavaScript
 * - 이미지 확대 모달 기능
 * - 5초 자동 슬라이드
 * - 화살표 네비게이션
 * - 키보드 단축키
 */

// 전역 변수
let facilityData = {};
let facilityImages = [];
let currentModalIndex = 0;
let modalCarousel;
let autoSlideInterval;
let isAutoSliding = false;

/**
 * 시설 데이터 초기화
 * @param {Object} data - Thymeleaf에서 전달받은 시설 데이터
 */
function initializeFacilityData(data) {
    facilityData = data;
    console.log('🏢 시설 데이터 초기화:', facilityData);
}

/**
 * 시설 이미지 데이터 초기화
 * @param {Array} images - Thymeleaf에서 전달받은 이미지 데이터
 */
function initializeFacilityImages(images) {
    facilityImages = images || [];
    console.log('📸 시설 이미지 데이터 초기화 - 이미지 수:', facilityImages.length);
    console.log('📸 이미지 목록:', facilityImages);
}

/**
 * DOM 로드 완료 후 초기화
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🖼️ 시설 상세보기 DOM 로드 완료');
    
    // 시설 등급 색상 적용
    applyGradeColors();
    
    // 모달 요소 확인
    const modal = document.getElementById('imageModal');
    if (!modal) {
        console.error('❌ 이미지 모달 요소를 찾을 수 없습니다');
    } else {
        console.log('✅ 이미지 모달 요소 확인됨');
    }
});

/**
 * 시설 등급 색상 적용
 */
function applyGradeColors() {
    $('.grade-badge').each(function() {
        const grade = parseInt($(this).data('grade'));
        switch(grade) {
            case 1: $(this).addClass('bg-success'); break;
            case 2: $(this).addClass('bg-info'); break;
            case 3: $(this).addClass('bg-warning'); break;
            case 4: $(this).addClass('bg-secondary'); break;
            case 5: $(this).addClass('bg-danger'); break;
            default: $(this).addClass('bg-secondary');
        }
    });
    
    $('.grade-rating').each(function() {
        const grade = parseInt($(this).data('grade'));
        switch(grade) {
            case 1: $(this).addClass('text-success'); break;
            case 2: $(this).addClass('text-info'); break;
            case 3: $(this).addClass('text-warning'); break;
            case 4: $(this).addClass('text-secondary'); break;
            case 5: $(this).addClass('text-danger'); break;
            default: $(this).addClass('text-muted');
        }
    });
}

/**
 * 이미지 모달 열기
 * @param {number} imageIndex - 표시할 이미지 인덱스
 */
function openImageModal(imageIndex = 0) {
    console.log('🖼️ 이미지 모달 열기 시도 - imageIndex:', imageIndex);
    console.log('📸 사용 가능한 이미지 수:', facilityImages.length);
    
    if (facilityImages.length === 0) {
        console.warn('⚠️ 표시할 이미지가 없습니다');
        alert('표시할 이미지가 없습니다.');
        return;
    }
    
    currentModalIndex = Math.max(0, Math.min(imageIndex, facilityImages.length - 1));
    console.log('📍 실제 모달 인덱스:', currentModalIndex);
    
    setupModalCarousel();
    
    const modalElement = document.getElementById('imageModal');
    const modal = new bootstrap.Modal(modalElement);
    
    // 기존 이벤트 리스너 제거 (중복 방지)
    modalElement.removeEventListener('shown.bs.modal', handleModalShown);
    modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
    
    // 새 이벤트 리스너 추가
    modalElement.addEventListener('shown.bs.modal', handleModalShown);
    modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
    
    modal.show();
    console.log('✅ 모달 표시 완료');
}

/**
 * 모달 표시 완료 이벤트 핸들러
 */
function handleModalShown() {
    console.log('🎯 모달이 완전히 열림 - 캐러셀 초기화');
    if (modalCarousel) {
        modalCarousel.to(currentModalIndex);
        updateModalImageInfo();
    }
    startAutoSlide();
}

/**
 * 모달 숨김 이벤트 핸들러
 */
function handleModalHidden() {
    console.log('🚪 모달이 닫힘 - 정리 작업');
    stopAutoSlide();
}

/**
 * 모달 캐러셀 설정
 */
function setupModalCarousel() {
    console.log('🔧 모달 캐러셀 설정 시작');
    
    const carouselInner = document.getElementById('modalCarouselInner');
    const indicators = document.getElementById('modalCarouselIndicators');
    
    if (!carouselInner || !indicators) {
        console.error('❌ 모달 캐러셀 요소를 찾을 수 없음');
        return;
    }
    
    // 기존 캐러셀 인스턴스 해제
    if (modalCarousel) {
        modalCarousel.dispose();
        modalCarousel = null;
    }
    
    // 기존 내용 정리
    carouselInner.innerHTML = '';
    indicators.innerHTML = '';
    
    console.log('📸 모달에 표시할 이미지 수:', facilityImages.length);
    
    // 이미지 아이템 생성
    facilityImages.forEach((image, index) => {
        console.log(`🖼️ 이미지 ${index + 1} 생성:`, image.path);
        
        // 캐러셀 아이템
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${index === currentModalIndex ? 'active' : ''}`;
        carouselItem.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="height: 80vh;">
                <img src="${image.path}" 
                     class="img-fluid" 
                     style="max-height: 100%; max-width: 100%; object-fit: contain;" 
                     alt="${image.alt || '시설 이미지'}"
                     onerror="this.src='/images/default_facility.jpg'">
            </div>
        `;
        carouselInner.appendChild(carouselItem);
        
        // 인디케이터 버튼 (이미지가 2개 이상일 때만)
        if (facilityImages.length > 1) {
            const indicator = document.createElement('button');
            indicator.type = 'button';
            indicator.setAttribute('data-bs-target', '#modalCarousel');
            indicator.setAttribute('data-bs-slide-to', index);
            indicator.className = index === currentModalIndex ? 'active' : '';
            indicator.setAttribute('aria-label', `이미지 ${index + 1}`);
            indicators.appendChild(indicator);
        }
    });
    
    // 캐러셀 요소 표시/숨김 처리
    const prevBtn = document.querySelector('#modalCarousel .carousel-control-prev');
    const nextBtn = document.querySelector('#modalCarousel .carousel-control-next');
    
    if (facilityImages.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        indicators.style.display = 'none';
    } else {
        if (prevBtn) prevBtn.style.display = 'block';
        if (nextBtn) nextBtn.style.display = 'block';
        indicators.style.display = 'block';
    }
    
    // 캐러셀 인스턴스 생성
    const carouselElement = document.getElementById('modalCarousel');
    modalCarousel = new bootstrap.Carousel(carouselElement, {
        interval: false, // 자동 슬라이드는 별도로 관리
        ride: false,
        wrap: true
    });
    
    // 기존 이벤트 리스너 제거
    carouselElement.removeEventListener('slide.bs.carousel', handleCarouselSlide);
    carouselElement.removeEventListener('slid.bs.carousel', handleCarouselSlid);
    
    // 슬라이드 이벤트 리스너 추가
    carouselElement.addEventListener('slide.bs.carousel', handleCarouselSlide);
    carouselElement.addEventListener('slid.bs.carousel', handleCarouselSlid);
    
    updateModalImageInfo();
    console.log('✅ 모달 캐러셀 설정 완료');
}

/**
 * 캐러셀 슬라이드 시작 이벤트
 */
function handleCarouselSlide(event) {
    console.log('🔄 캐러셀 슬라이드 시작:', event.from, '→', event.to);
    currentModalIndex = event.to;
}

/**
 * 캐러셀 슬라이드 완료 이벤트
 */
function handleCarouselSlid(event) {
    console.log('✅ 캐러셀 슬라이드 완료:', event.to);
    currentModalIndex = event.to;
    updateModalImageInfo();
}

/**
 * 모달 이미지 정보 업데이트
 */
function updateModalImageInfo() {
    const counter = document.getElementById('modalImageCounter');
    const altText = document.getElementById('modalImageAlt');
    
    if (facilityImages.length > 0 && currentModalIndex < facilityImages.length) {
        counter.textContent = `${currentModalIndex + 1} / ${facilityImages.length}`;
        altText.textContent = facilityImages[currentModalIndex].alt || '시설 이미지';
    }
}

/**
 * 자동 슬라이드 시작
 */
function startAutoSlide() {
    if (facilityImages.length <= 1) return;
    
    isAutoSliding = true;
    updateAutoSlideButton();
    
    autoSlideInterval = setInterval(() => {
        if (modalCarousel) {
            modalCarousel.next();
        }
    }, 5000);
    
    console.log('▶️ 자동 슬라이드 시작');
}

/**
 * 자동 슬라이드 정지
 */
function stopAutoSlide() {
    isAutoSliding = false;
    updateAutoSlideButton();
    
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
    
    console.log('⏸️ 자동 슬라이드 정지');
}

/**
 * 자동 슬라이드 토글
 */
function toggleAutoSlide() {
    if (isAutoSliding) {
        stopAutoSlide();
    } else {
        startAutoSlide();
    }
}

/**
 * 자동 슬라이드 버튼 업데이트
 */
function updateAutoSlideButton() {
    const icon = document.getElementById('autoSlideIcon');
    const text = document.getElementById('autoSlideText');
    
    if (icon && text) {
        if (isAutoSliding) {
            icon.className = 'fas fa-pause';
            text.textContent = '일시정지';
        } else {
            icon.className = 'fas fa-play';
            text.textContent = '자동재생';
        }
    }
}

/**
 * 이미지 다운로드
 */
function downloadImage() {
    if (facilityImages.length === 0 || currentModalIndex >= facilityImages.length) return;
    
    const currentImage = facilityImages[currentModalIndex];
    const link = document.createElement('a');
    link.href = currentImage.path;
    link.download = `시설이미지_${currentModalIndex + 1}.jpg`;
    link.click();
    
    console.log('💾 이미지 다운로드:', currentImage.path);
}

/**
 * 전화하기 버튼 클릭 이벤트 핸들러
 */
function callFacilityPhone(button) {
    const phone = button.getAttribute('data-phone');
    if (phone) {
        window.location.href = `tel:${phone}`;
    }
}

/**
 * 리뷰 작성 페이지로 이동
 */
function writeReview() {
    if (facilityData.facilityId) {
        window.location.href = `/review/write?facilityId=${facilityData.facilityId}`;
    }
}

/**
 * 주변 구인정보 검색
 */
function searchNearbyJobs() {
    if (facilityData.latitude && facilityData.longitude) {
        window.location.href = `/job/list?lat=${facilityData.latitude}&lng=${facilityData.longitude}&radius=5`;
    }
}

/**
 * 카카오톡 공유하기
 */
function shareToKakao() {
    if (!facilityData) return;
    
    const facilityName = facilityData.name || '시설명';
    const address = facilityData.address || '주소';
    const logoImageUrl = facilityData.facilityImage || '/images/default_facility.jpg';

    if (window.Kakao) {
        Kakao.Link.sendDefault({
            objectType: 'location',
            address: address,
            addressTitle: facilityName,
            content: {
                title: facilityName,
                description: `${address}\n상세 정보 보기`,
                imageUrl: logoImageUrl,
                link: {
                    mobileWebUrl: window.location.href,
                    webUrl: window.location.href
                }
            },
            buttons: [
                {
                    title: '상세 정보 보기',
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href
                    }
                }
            ]
        });
    } else {
        alert('카카오톡 공유하기를 사용할 수 없습니다.');
    }
}

/**
 * 시설 삭제 함수
 */
function deleteFacility(facilityId) {
    if (confirm('정말로 이 시설을 삭제하시겠습니까?\n삭제된 시설은 복구할 수 없습니다.')) {
        // AJAX로 삭제 요청
        fetch('/facility/delete/' + facilityId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (response.ok) {
                alert('시설이 삭제되었습니다.');
                window.location.href = '/facility/search';
            } else {
                alert('시설 삭제 중 오류가 발생했습니다.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('시설 삭제 중 오류가 발생했습니다.');
        });
    }
}

// 키보드 단축키 (모달이 열려있을 때)
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('imageModal');
    if (!modal || !modal.classList.contains('show')) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            if (modalCarousel) modalCarousel.prev();
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (modalCarousel) modalCarousel.next();
            break;
        case ' ': // 스페이스바
            e.preventDefault();
            toggleAutoSlide();
            break;
        case 'Escape':
            e.preventDefault();
            bootstrap.Modal.getInstance(modal)?.hide();
            break;
    }
});