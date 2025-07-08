/**
 * 스마트 스크롤 유틸리티
 * 프로필 이미지, 시설 이미지 크롭퍼에서 공통으로 사용
 * 이미지 확대/축소 한계점에서 자동으로 페이지 스크롤로 전환
 */

if (typeof SmartScrollUtility === 'undefined') {
    class SmartScrollUtility {
    constructor(cropper, options = {}) {
        this.cropper = cropper;
        this.options = {
            minZoom: 0.1,      // 최소 줌 (10%)
            maxZoom: 3.0,      // 최대 줌 (300%)
            maxThreshold: 2.8, // 최대 확대 임계값
            minThreshold: 0.2, // 최소 축소 임계값
            scrollMultiplier: 0.5, // 페이지 스크롤 강도
            zoomStep: 0.1,     // 줌 단계
            indicatorTimeout: 3000, // 줌 표시기 자동 숨김 시간
            ...options
        };
        
        this.zoomIndicatorTimeout = null;
        this.container = null;
        this.elements = {
            zoomIndicator: null,
            zoomLevel: null,
            zoomStatus: null
        };
        
        this.init();
    }
    
    /**
     * 초기화
     */
    init() {
        if (!this.cropper) {
            console.error('❌ SmartScrollUtility: cropper 객체가 필요합니다.');
            return;
        }
        
        this.findContainer();
        this.findZoomElements();
        this.setupEventListener();
        
        console.log('🖱️ SmartScrollUtility 초기화 완료');
        console.log('📊 설정:', this.options);
    }
    
    /**
     * 크롭 컨테이너 찾기
     */
    findContainer() {
        // 다양한 컨테이너 선택자 시도
        const selectors = [
            '.crop-image-container',  // 시설 이미지
            '.crop-container img',    // 프로필 이미지
            '.cropper-container',     // Cropper.js 기본
            '#cropImage'              // ID 직접 선택
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                this.container = element.closest('.crop-image-container') || 
                               element.parentElement || 
                               element;
                break;
            }
        }
        
        if (!this.container) {
            console.warn('⚠️ SmartScrollUtility: 크롭 컨테이너를 찾을 수 없습니다.');
        }
    }
    
    /**
     * 줌 표시기 요소 찾기
     */
    findZoomElements() {
        this.elements.zoomIndicator = document.getElementById('zoomIndicator');
        this.elements.zoomLevel = document.getElementById('zoomLevel');
        this.elements.zoomStatus = document.getElementById('zoomStatus');
        
        if (!this.elements.zoomIndicator) {
            console.log('💡 SmartScrollUtility: 줌 표시기가 없어 동적으로 생성합니다.');
            this.createZoomIndicator();
        }
    }
    
    /**
     * 동적으로 줌 표시기 생성
     */
    createZoomIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'zoomIndicator';
        indicator.className = 'zoom-indicator position-fixed';
        indicator.style.cssText = `
            top: 20px; 
            right: 20px; 
            z-index: 1000; 
            background: rgba(0,0,0,0.8); 
            color: white; 
            padding: 8px 12px; 
            border-radius: 6px; 
            font-size: 12px;
            display: none;
        `;
        
        indicator.innerHTML = `
            <i class="fas fa-search me-1"></i>
            <span id="zoomLevel">100%</span>
            <span id="zoomStatus" class="ms-2"></span>
        `;
        
        document.body.appendChild(indicator);
        
        // 요소 재할당
        this.elements.zoomIndicator = indicator;
        this.elements.zoomLevel = document.getElementById('zoomLevel');
        this.elements.zoomStatus = document.getElementById('zoomStatus');
        
        console.log('✅ 줌 표시기 동적 생성 완료');
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListener() {
        if (!this.container) {
            console.error('❌ SmartScrollUtility: 컨테이너가 없어 이벤트를 등록할 수 없습니다.');
            return;
        }
        
        // 기존 이벤트 제거 (중복 방지)
        this.container.removeEventListener('wheel', this.handleWheel.bind(this));
        
        // 새 이벤트 등록
        this.container.addEventListener('wheel', this.handleWheel.bind(this), { 
            passive: false 
        });
        
        console.log('🔧 휠 이벤트 리스너 등록 완료:', this.container);
    }
    
    /**
     * 휠 이벤트 처리 (메인 로직)
     */
    handleWheel(event) {
        if (!this.cropper) return;
        
        // 현재 줌 레벨 확인
        const canvasData = this.cropper.getCanvasData();
        const currentZoom = canvasData.naturalWidth > 0 ? 
                           canvasData.width / canvasData.naturalWidth : 1;
        
        const isZoomingIn = event.deltaY < 0;  // 휠 위로 = 확대
        const isZoomingOut = event.deltaY > 0; // 휠 아래로 = 축소
        
        console.log(`🔍 줌 상태: ${currentZoom.toFixed(2)} (${isZoomingIn ? '확대' : '축소'})`);
        
        // 확대 시: 최대 줌 근처에서 페이지 스크롤
        if (isZoomingIn && currentZoom >= this.options.maxThreshold) {
            this.updateZoomIndicator(currentZoom, '최대 확대');
            this.scrollPage(event.deltaY * this.options.scrollMultiplier);
            console.log('📈 최대 확대 -> 페이지 스크롤');
            return;
        }
        
        // 축소 시: 최소 줌 근처에서 페이지 스크롤
        if (isZoomingOut && currentZoom <= this.options.minThreshold) {
            this.updateZoomIndicator(currentZoom, '최소 축소');
            this.scrollPage(event.deltaY * this.options.scrollMultiplier);
            console.log('📉 최소 축소 -> 페이지 스크롤');
            return;
        }
        
        // 정상 범위: 이미지 줌 적용
        event.preventDefault();
        event.stopPropagation();
        
        const zoomDelta = isZoomingIn ? this.options.zoomStep : -this.options.zoomStep;
        this.cropper.zoom(zoomDelta);
        
        // 줌 표시기 업데이트
        const newZoom = Math.max(
            this.options.minZoom, 
            Math.min(this.options.maxZoom, currentZoom + zoomDelta)
        );
        this.updateZoomIndicator(newZoom, isZoomingIn ? '확대' : '축소');
    }
    
    /**
     * 페이지 스크롤 실행
     */
    scrollPage(scrollAmount) {
        window.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
        });
    }
    
    /**
     * 줌 표시기 업데이트
     */
    updateZoomIndicator(zoomLevel, status) {
        if (!this.elements.zoomIndicator || !this.elements.zoomLevel) return;
        
        // 줌 레벨 표시
        const zoomPercent = Math.round(zoomLevel * 100);
        this.elements.zoomLevel.textContent = zoomPercent + '%';
        
        // 상태 메시지 설정
        if (this.elements.zoomStatus) {
            let statusMessage = '';
            let statusClass = '';
            
            switch (status) {
                case '최대 확대':
                    statusMessage = '(최대 - 페이지 스크롤 가능)';
                    statusClass = 'text-warning';
                    break;
                case '최소 축소':
                    statusMessage = '(최소 - 페이지 스크롤 가능)';
                    statusClass = 'text-info';
                    break;
                default:
                    statusMessage = `(${status} 중)`;
                    statusClass = 'text-success';
            }
            
            this.elements.zoomStatus.textContent = statusMessage;
            this.elements.zoomStatus.className = `ms-2 ${statusClass}`;
        }
        
        // 표시기 보이기
        this.elements.zoomIndicator.style.display = 'block';
        
        // 자동 숨김 타이머
        clearTimeout(this.zoomIndicatorTimeout);
        this.zoomIndicatorTimeout = setTimeout(() => {
            if (this.elements.zoomIndicator) {
                this.elements.zoomIndicator.style.display = 'none';
            }
        }, this.options.indicatorTimeout);
    }
    
    /**
     * 설정 업데이트
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        console.log('🔧 SmartScrollUtility 설정 업데이트:', this.options);
    }
    
    /**
     * 크롭퍼 업데이트 (동적 변경 시)
     */
    updateCropper(newCropper) {
        this.cropper = newCropper;
        console.log('🔄 SmartScrollUtility 크롭퍼 업데이트');
    }
    
    /**
     * 정리 (메모리 누수 방지)
     */
    destroy() {
        if (this.container) {
            this.container.removeEventListener('wheel', this.handleWheel.bind(this));
        }
        
        clearTimeout(this.zoomIndicatorTimeout);
        
        // 동적 생성된 표시기 제거
        const dynamicIndicator = document.getElementById('zoomIndicator');
        if (dynamicIndicator && dynamicIndicator.style.position === 'fixed') {
            dynamicIndicator.remove();
        }
        
        this.cropper = null;
        this.container = null;
        this.elements = {};
        
        console.log('🧹 SmartScrollUtility 정리 완료');
    }
}

// 전역 접근을 위한 윈도우 객체 등록
window.SmartScrollUtility = SmartScrollUtility;

}

// 간편 사용 함수
window.createSmartScroll = function(cropper, options = {}) {
    return new SmartScrollUtility(cropper, options);
};

console.log('📦 SmartScrollUtility 모듈 로드 완료');