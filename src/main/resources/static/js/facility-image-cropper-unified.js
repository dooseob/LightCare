/**
 * 시설 이미지 크롭 전용 JavaScript (통합 버전)
 * facility-image-cropper.js와 facility-image-cropper-fixed.js를 통합
 * 
 * 주요 기능:
 * - 다중 이미지 업로드 및 크롭 (최대 5장)
 * - 16:9 비율 자동 크롭
 * - AVIF/WebP 포맷 지원 및 브라우저 호환성 체크
 * - Alt 텍스트 자동 생성
 * - SEO 파일명 설정
 * - 키워드 기반 이미지 분류
 * - 스마트 스크롤 (크롭퍼와 페이지 스크롤 연동)
 * - 완전한 네임스페이스 격리로 충돌 방지
 * - 향상된 에러 처리 및 사용자 경험
 */

// ================================================
// 네임스페이스 및 전역 상태 관리
// ================================================

// 전역 변수 충돌 방지 - 완전한 네임스페이스 격리
if (typeof window.FacilityCropperNamespace === 'undefined') {
    window.FacilityCropperNamespace = {};
}

// 전역 상태를 네임스페이스로 완전 격리 (기존 값 보존)
if (!window.FacilityCropperNamespace.cropper) {
    Object.assign(window.FacilityCropperNamespace, {
    cropper: null,
    originalImages: [],
    croppedImages: [],
    currentImageIndex: 0,
    facilityId: null,
    isInitialized: false,
    
    // 기존 DB 이미지와 새 이미지 구분
    existingImages: [],
    newImages: [],
    isDataCleared: false,
    
    // DOM 요소들
    elements: {},
    
    // 포맷 지원 정보
    formatSupport: {
        avif: false,
        webp: false
    },
    
    // 줌 상태 관리 (Fixed 파일에서 개선된 부분)
    zoomState: {
        level: 1,
        lastUpdate: null,
        isIndicatorVisible: false
    }
    });
}

// 디버깅 로그 시스템 (네임스페이스로 격리)
if (!window.FacilityCropperNamespace.debugLog) {
    window.FacilityCropperNamespace.debugLog = {
        enabled: true,
        prefix: '🔍 [CropperDebug]',
        
        log: function(message, data = null) {
            if (!this.enabled) return;
            const timestamp = new Date().toLocaleTimeString();
            console.log(`${this.prefix} [${timestamp}] ${message}`, data ? data : '');
        },
        
        error: function(message, error = null) {
            if (!this.enabled) return;
            const timestamp = new Date().toLocaleTimeString();
            console.error(`${this.prefix} [${timestamp}] ❌ ${message}`, error ? error : '');
        },
        
        warn: function(message, data = null) {
            if (!this.enabled) return;
            const timestamp = new Date().toLocaleTimeString();
            console.warn(`${this.prefix} [${timestamp}] ⚠️ ${message}`, data ? data : '');
        },
        
        checkState: function() {
            this.log('현재 상태 체크', {
                isInitialized: window.FacilityCropperNamespace.isInitialized,
                cropper: !!window.FacilityCropperNamespace.cropper,
                originalImagesLength: window.FacilityCropperNamespace.originalImages ? window.FacilityCropperNamespace.originalImages.length : 'null',
                currentImageIndex: window.FacilityCropperNamespace.currentImageIndex,
                facilityId: window.FacilityCropperNamespace.facilityId
            });
        },
        
        checkDOM: function() {
            const domElements = {
                nextAndSaveBtn: !!document.getElementById('nextAndSaveBtn'),
                saveAndCompleteBtn: !!document.getElementById('saveAndCompleteBtn'),
                cropImage: !!document.getElementById('cropImage'),
                cropSection: !!document.getElementById('cropSection'),
                previewCanvas: !!document.getElementById('previewCanvas')
            };
            this.log('DOM 요소 상태', domElements);
            return domElements;
        }
    };
}

// 전역 크롭퍼 객체 생성 (타임리프 충돌 방지)
window.facilityImageCropper = {
    state: {
        selectedFiles: [],
        currentStep: 1,
        currentImageIndex: 0,
        facilityId: null
    },
    
    // 파일 설정 메서드
    setFiles: function(files) {
        window.FacilityCropperNamespace.originalImages = files;
        this.state.selectedFiles = files;
        window.FacilityCropperNamespace.debugLog.log('크롭퍼에 파일 설정:', files.length + '개');
    },
    
    // 단계 이동 메서드
    moveToStep: function(step) {
        this.state.currentStep = step;
        
        if (step === 2) {
            // 2단계로 이동
            const uploadSection = document.getElementById('uploadSection');
            const cropSection = document.getElementById('cropSection');
            
            if (uploadSection) uploadSection.style.display = 'none';
            if (cropSection) cropSection.style.display = 'block';
            
            // 단계 표시기 업데이트
            const step1 = document.getElementById('step1');
            const step2 = document.getElementById('step2');
            
            if (step1) step1.classList.remove('active');
            if (step2) step2.classList.add('active');
            
            // 첫 번째 이미지 로드
            if (window.FacilityCropperNamespace.originalImages.length > 0) {
                loadImageForCrop(0);
            }
        }
    }
};

// ================================================
// 초기화 및 이벤트 설정
// ================================================

// 초기화 (중복 방지 로직 추가)
document.addEventListener('DOMContentLoaded', function() {
    if (window.FacilityCropperNamespace.isInitialized) {
        console.log('⚠️ 시설 이미지 크롭퍼가 이미 초기화됨. 중복 초기화 방지.');
        return;
    }
    
    console.log('🎬 시설 이미지 크롭퍼 초기화 시작 (통합 버전)');
    window.FacilityCropperNamespace.isInitialized = true;
    
    // URL에서 시설 ID 추출
    const pathParts = window.location.pathname.split('/');
    window.FacilityCropperNamespace.facilityId = pathParts[pathParts.length - 1];
    window.facilityImageCropper.state.facilityId = window.FacilityCropperNamespace.facilityId;
    console.log('🏢 시설 ID:', window.FacilityCropperNamespace.facilityId);
    
    // 데이터 매니저 초기화 (기존 이미지와 새 이미지 충돌 방지)
    if (window.FacilityImageDataManager) {
        console.log('🗃️ 데이터 매니저 연동 초기화');
        window.FacilityImageDataManager.initialize(window.FacilityCropperNamespace.facilityId)
            .then(() => {
                console.log('✅ 데이터 매니저 연동 완료');
            })
            .catch(error => {
                console.error('❌ 데이터 매니저 연동 실패:', error);
            });
    }
    
    // 초기화 순서
    checkFormatSupport();
    initializeElements();
    setupEventListeners();
    setupDragAndDrop();
    setupKeyboardShortcuts();
    setupSmartScroll(); // Fixed 파일에서 추가된 기능
    
    console.log('✅ 시설 이미지 크롭퍼 초기화 완료');
});

// ================================================
// 포맷 지원 확인
// ================================================

// 포맷 지원 확인 (AVIF/WebP 브라우저 호환성)
function checkFormatSupport() {
    console.log('🔍 브라우저 이미지 포맷 지원 확인');
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        // AVIF 지원 확인
        const avifCanvas = document.createElement('canvas');
        avifCanvas.width = 1;
        avifCanvas.height = 1;
        ns.formatSupport.avif = avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
        
        // WebP 지원 확인  
        const webpCanvas = document.createElement('canvas');
        webpCanvas.width = 1;
        webpCanvas.height = 1;
        ns.formatSupport.webp = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        
        console.log('📊 포맷 지원 현황:', ns.formatSupport);
        
        // 지원되지 않는 포맷 UI에서 숨기기
        if (!ns.formatSupport.avif) {
            const avifOption = document.getElementById('formatAVIF');
            const avifLabel = document.querySelector('label[for="formatAVIF"]');
            if (avifOption && avifLabel) {
                avifOption.style.display = 'none';
                avifLabel.style.display = 'none';
                console.log('⚠️ AVIF 미지원으로 옵션 숨김');
            }
        }
        
        if (!ns.formatSupport.webp) {
            const webpOption = document.getElementById('formatWEBP');
            const webpLabel = document.querySelector('label[for="formatWEBP"]');
            if (webpOption && webpLabel) {
                webpOption.style.display = 'none';
                webpLabel.style.display = 'none';
                console.log('⚠️ WebP 미지원으로 옵션 숨김');
            }
        }
    } catch (error) {
        ns.debugLog.error('포맷 지원 확인 중 에러:', error);
    }
}

// ================================================
// DOM 요소 초기화
// ================================================

// DOM 요소 초기화 (향상된 버전)
function initializeElements() {
    console.log('🔍 DOM 요소 초기화 시작');
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        // 기본 요소들
        ns.elements.imageInput = document.getElementById('imageInput');
        ns.elements.uploadSection = document.getElementById('uploadSection');
        ns.elements.cropSection = document.getElementById('cropSection');
        ns.elements.compressionSection = document.getElementById('compressionSection');
        ns.elements.completeSection = document.getElementById('completeSection');
        ns.elements.manageSection = document.getElementById('manageSection'); // 원본 파일의 5단계 지원
        
        // 업로드 관련
        ns.elements.uploadArea = document.getElementById('uploadArea');
        ns.elements.folderInput = document.getElementById('folderInput'); // 폴더 업로드 지원
        
        // 이미지 리스트
        ns.elements.imageListSection = document.getElementById('imageListSection');
        ns.elements.imageList = document.getElementById('imageList');
        ns.elements.imageCount = document.getElementById('imageCount');
        
        // 크롭 관련
        ns.elements.cropImage = document.getElementById('cropImage');
        ns.elements.previewCanvas = document.getElementById('previewCanvas');
        ns.elements.currentImageNumber = document.getElementById('currentImageNumber');
        ns.elements.imageDimensions = document.getElementById('imageDimensions');
        ns.elements.imageFileName = document.getElementById('imageFileName');
        
        // 줌 표시기 (Fixed 파일에서 개선된 부분)
        ns.elements.zoomIndicator = document.getElementById('zoomIndicator');
        ns.elements.zoomLevel = document.getElementById('zoomLevel');
        ns.elements.zoomStatus = document.getElementById('zoomStatus');
        
        // 단계 표시기 (5단계 지원)
        ns.elements.steps = {
            step1: document.getElementById('step1'),
            step2: document.getElementById('step2'),
            step3: document.getElementById('step3'),
            step4: document.getElementById('step4'),
            step5: document.getElementById('step5') // 관리 단계
        };
        
        // 버튼들 (완전한 기능 세트)
        ns.elements.buttons = {
            // 업로드 단계
            fileSelectBtn: document.getElementById('fileSelectBtn'),
            folderSelectBtn: document.getElementById('folderSelectBtn'),
            
            // 크롭 단계
            backToUpload: document.getElementById('backToUploadBtn'),
            prevImage: document.getElementById('prevImageBtn'),
            nextImage: document.getElementById('nextImageBtn'),
            cropCurrent: document.getElementById('cropCurrentBtn'),
            zoomIn: document.getElementById('zoomInBtn'),
            zoomOut: document.getElementById('zoomOutBtn'),
            rotateLeft: document.getElementById('rotateLeftBtn'),
            rotateRight: document.getElementById('rotateRightBtn'),
            reset: document.getElementById('resetBtn'),
            
            // 고급 기능 (원본 파일)
            nextAndSave: document.getElementById('nextAndSaveBtn'),
            saveAndComplete: document.getElementById('saveAndCompleteBtn'),
            goToManage: document.getElementById('goToManageBtn'),
            finalComplete: document.getElementById('finalCompleteBtn')
        };
        
        // SEO 관련 요소들 (원본 파일의 고급 기능)
        ns.elements.seo = {
            seoFileName: document.getElementById('seoFileName'),
            previewFileName: document.getElementById('previewFileName'),
            keywordButtons: document.querySelectorAll('.keyword-btn'),
            altTextInput: document.getElementById('altTextInput')
        };
        
        console.log('✅ DOM 요소 초기화 완료');
        
        // DOM 요소 상태 확인
        ns.debugLog.checkDOM();
        
    } catch (error) {
        ns.debugLog.error('DOM 요소 초기화 중 에러:', error);
    }
}

// ================================================
// 이벤트 리스너 설정
// ================================================

// 이벤트 리스너 설정 (향상된 버전)
function setupEventListeners() {
    console.log('🔗 이벤트 리스너 설정 시작');
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        // 파일 입력 이벤트
        if (ns.elements.imageInput) {
            ns.elements.imageInput.removeEventListener('change', handleImageUpload);
            ns.elements.imageInput.addEventListener('change', handleImageUpload);
            console.log('📁 파일 입력 이벤트 리스너 등록됨');
        }
        
        // 폴더 입력 이벤트 (원본 파일의 고급 기능)
        if (ns.elements.folderInput) {
            ns.elements.folderInput.removeEventListener('change', handleFolderUpload);
            ns.elements.folderInput.addEventListener('change', handleFolderUpload);
            console.log('📁 폴더 입력 이벤트 리스너 등록됨');
        }
        
        // 파일 선택 버튼
        if (ns.elements.buttons.fileSelectBtn) {
            ns.elements.buttons.fileSelectBtn.addEventListener('click', () => {
                if (ns.elements.imageInput) {
                    ns.elements.imageInput.click();
                }
            });
        }
        
        // 폴더 선택 버튼 (원본 파일 기능)
        if (ns.elements.buttons.folderSelectBtn) {
            ns.elements.buttons.folderSelectBtn.addEventListener('click', () => {
                if (ns.elements.folderInput) {
                    ns.elements.folderInput.click();
                }
            });
        }
        
        // 크롭 관련 버튼들
        if (ns.elements.buttons.prevImage) {
            ns.elements.buttons.prevImage.addEventListener('click', () => {
                if (ns.currentImageIndex > 0) {
                    loadImageForCrop(ns.currentImageIndex - 1);
                }
            });
        }
        
        if (ns.elements.buttons.nextImage) {
            ns.elements.buttons.nextImage.addEventListener('click', () => {
                if (ns.currentImageIndex < ns.originalImages.length - 1) {
                    loadImageForCrop(ns.currentImageIndex + 1);
                }
            });
        }
        
        // 줌 컨트롤 (Fixed 파일에서 개선된 부분)
        if (ns.elements.buttons.zoomIn) {
            ns.elements.buttons.zoomIn.addEventListener('click', () => {
                if (ns.cropper) {
                    const currentZoom = ns.cropper.getZoomRatio();
                    ns.cropper.zoom(0.1);
                    ns.updateZoomIndicator(currentZoom + 0.1, 'zoom-in');
                }
            });
        }
        
        if (ns.elements.buttons.zoomOut) {
            ns.elements.buttons.zoomOut.addEventListener('click', () => {
                if (ns.cropper) {
                    const currentZoom = ns.cropper.getZoomRatio();
                    ns.cropper.zoom(-0.1);
                    ns.updateZoomIndicator(currentZoom - 0.1, 'zoom-out');
                }
            });
        }
        
        // 회전 컨트롤
        if (ns.elements.buttons.rotateLeft) {
            ns.elements.buttons.rotateLeft.addEventListener('click', () => {
                if (ns.cropper) {
                    ns.cropper.rotate(-90);
                }
            });
        }
        
        if (ns.elements.buttons.rotateRight) {
            ns.elements.buttons.rotateRight.addEventListener('click', () => {
                if (ns.cropper) {
                    ns.cropper.rotate(90);
                }
            });
        }
        
        // 리셋 버튼
        if (ns.elements.buttons.reset) {
            ns.elements.buttons.reset.addEventListener('click', () => {
                if (ns.cropper) {
                    ns.cropper.reset();
                }
            });
        }
        
        // 고급 저장 버튼들 (원본 파일 기능)
        if (ns.elements.buttons.nextAndSave) {
            ns.elements.buttons.nextAndSave.addEventListener('click', saveCurrentAndGoNext);
        }
        
        if (ns.elements.buttons.saveAndComplete) {
            ns.elements.buttons.saveAndComplete.addEventListener('click', saveCurrentAndComplete);
        }
        
        // SEO 키워드 버튼들 (원본 파일의 고급 기능)
        if (ns.elements.seo.keywordButtons) {
            ns.elements.seo.keywordButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    handleKeywordClick(this.textContent.trim());
                });
            });
        }
        
        console.log('✅ 이벤트 리스너 설정 완료');
        
    } catch (error) {
        ns.debugLog.error('이벤트 리스너 설정 중 에러:', error);
    }
}

// ================================================
// 스마트 스크롤 설정 (Fixed 파일에서 개선된 기능)
// ================================================

// 스마트 스크롤 설정
function setupSmartScroll() {
    console.log('🖱️ 스마트 스크롤 설정 시작');
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        // 크롭퍼 컨테이너에서 스크롤 이벤트 감지
        const cropSection = ns.elements.cropSection;
        if (cropSection) {
            cropSection.addEventListener('wheel', function(e) {
                // 크롭퍼가 활성화된 상태에서만 동작
                if (!ns.cropper) return;
                
                // Ctrl 키가 눌린 상태에서만 줌 동작
                if (e.ctrlKey) {
                    e.preventDefault();
                    
                    const delta = e.deltaY;
                    const zoomAmount = delta > 0 ? -0.1 : 0.1;
                    const currentZoom = ns.cropper.getZoomRatio();
                    const newZoom = currentZoom + zoomAmount;
                    
                    // 줌 범위 제한 (0.1 ~ 3.0)
                    if (newZoom >= 0.1 && newZoom <= 3.0) {
                        ns.cropper.zoom(zoomAmount);
                        ns.updateZoomIndicator(newZoom, delta > 0 ? 'zoom-out' : 'zoom-in');
                    }
                }
            }, { passive: false });
            
            console.log('✅ 스마트 스크롤 설정 완료');
        }
        
    } catch (error) {
        ns.debugLog.error('스마트 스크롤 설정 중 에러:', error);
    }
}

// 줌 인디케이터 업데이트 (Fixed 파일에서 개선된 기능)
window.FacilityCropperNamespace.updateZoomIndicator = function(zoomLevel, status) {
    const ns = window.FacilityCropperNamespace;
    
    try {
        // 줌 레벨 업데이트
        if (ns.elements.zoomLevel) {
            ns.elements.zoomLevel.textContent = Math.round(zoomLevel * 100) + '%';
        }
        
        // 줌 상태 업데이트
        if (ns.elements.zoomStatus) {
            const statusText = status === 'zoom-in' ? '확대' : status === 'zoom-out' ? '축소' : '줌';
            ns.elements.zoomStatus.textContent = statusText;
        }
        
        // 줌 인디케이터 표시
        if (ns.elements.zoomIndicator) {
            ns.elements.zoomIndicator.style.display = 'block';
            ns.elements.zoomIndicator.style.opacity = '1';
            
            // 상태 정보 업데이트
            ns.zoomState.level = zoomLevel;
            ns.zoomState.lastUpdate = Date.now();
            ns.zoomState.isIndicatorVisible = true;
            
            // 2초 후 자동 숨김
            setTimeout(() => {
                if (ns.elements.zoomIndicator && Date.now() - ns.zoomState.lastUpdate >= 2000) {
                    ns.elements.zoomIndicator.style.opacity = '0';
                    setTimeout(() => {
                        if (ns.elements.zoomIndicator) {
                            ns.elements.zoomIndicator.style.display = 'none';
                            ns.zoomState.isIndicatorVisible = false;
                        }
                    }, 300);
                }
            }, 2000);
        }
        
    } catch (error) {
        ns.debugLog.error('줌 인디케이터 업데이트 중 에러:', error);
    }
}

// ================================================
// 키보드 단축키 설정
// ================================================

// 키보드 단축키 설정 (원본 파일의 접근성 기능)
function setupKeyboardShortcuts() {
    console.log('⌨️ 키보드 단축키 설정 시작');
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        document.addEventListener('keydown', function(e) {
            // 크롭 섹션이 활성화된 상태에서만 동작
            if (!ns.elements.cropSection || ns.elements.cropSection.style.display === 'none') {
                return;
            }
            
            // 입력 필드에서는 단축키 비활성화
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    if (ns.currentImageIndex > 0) {
                        loadImageForCrop(ns.currentImageIndex - 1);
                    }
                    break;
                    
                case 'ArrowRight':
                    e.preventDefault();
                    if (ns.currentImageIndex < ns.originalImages.length - 1) {
                        loadImageForCrop(ns.currentImageIndex + 1);
                    }
                    break;
                    
                case '+':
                case '=':
                    e.preventDefault();
                    if (ns.cropper) {
                        ns.cropper.zoom(0.1);
                        ns.updateZoomIndicator(ns.cropper.getZoomRatio(), 'zoom-in');
                    }
                    break;
                    
                case '-':
                    e.preventDefault();
                    if (ns.cropper) {
                        ns.cropper.zoom(-0.1);
                        ns.updateZoomIndicator(ns.cropper.getZoomRatio(), 'zoom-out');
                    }
                    break;
                    
                case 'r':
                case 'R':
                    e.preventDefault();
                    if (ns.cropper) {
                        ns.cropper.reset();
                    }
                    break;
                    
                case 's':
                case 'S':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        saveCurrentAndGoNext();
                    }
                    break;
            }
        });
        
        console.log('✅ 키보드 단축키 설정 완료');
        
    } catch (error) {
        ns.debugLog.error('키보드 단축키 설정 중 에러:', error);
    }
}

// ================================================
// 드래그 앤 드롭 설정
// ================================================

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
    console.log('📎 드래그 앤 드롭 설정 시작');
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        if (ns.elements.uploadArea) {
            // 드래그 오버 효과
            ns.elements.uploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('drag-over');
            });
            
            // 드래그 리브 효과
            ns.elements.uploadArea.addEventListener('dragleave', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
            });
            
            // 파일 드롭 처리
            ns.elements.uploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                
                const files = Array.from(e.dataTransfer.files);
                const imageFiles = files.filter(file => file.type.startsWith('image/'));
                
                if (imageFiles.length > 0) {
                    // 가상 이벤트 객체 생성
                    const fakeEvent = {
                        target: {
                            files: imageFiles
                        }
                    };
                    handleImageUpload(fakeEvent);
                } else {
                    alert('이미지 파일만 업로드 가능합니다.');
                }
            });
            
            console.log('✅ 드래그 앤 드롭 설정 완료');
        }
        
    } catch (error) {
        ns.debugLog.error('드래그 앤 드롭 설정 중 에러:', error);
    }
}

// ================================================
// 이미지 업로드 및 처리
// ================================================

// 이미지 업로드 처리 (향상된 에러 처리)
window.FacilityCropperNamespace.handleImageUpload = function(event) {
    console.log('📁 이미지 업로드 처리 시작');
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) {
            ns.debugLog.warn('선택된 파일이 없습니다.');
            return;
        }
        
        if (files.length > 5) {
            alert('최대 5개의 이미지만 업로드할 수 있습니다.');
            return;
        }
        
        const validFiles = [];
        const invalidFiles = [];
        
        // 파일 유효성 검사
        files.forEach(file => {
            if (validateImageFile(file)) {
                validFiles.push(file);
            } else {
                invalidFiles.push(file);
            }
        });
        
        if (invalidFiles.length > 0) {
            const invalidNames = invalidFiles.map(f => f.name).join(', ');
            alert(`다음 파일들은 지원되지 않는 형식입니다: ${invalidNames}`);
        }
        
        if (validFiles.length === 0) {
            ns.debugLog.warn('유효한 이미지 파일이 없습니다.');
            return;
        }
        
        // 이미지 저장 및 UI 업데이트
        ns.originalImages = validFiles;
        ns.currentImageIndex = 0;
        
        // 이미지 리스트 표시
        displayImageList(validFiles);
        
        // 2단계로 이동
        window.facilityImageCropper.moveToStep(2);
        
        console.log('✅ 이미지 업로드 처리 완료:', validFiles.length + '개');
        
    } catch (error) {
        ns.debugLog.error('이미지 업로드 처리 중 에러:', error);
        alert('이미지 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
}

// 폴더 업로드 처리 (원본 파일의 고급 기능)
window.FacilityCropperNamespace.handleFolderUpload = function(event) {
    console.log('📁 폴더 업로드 처리 시작');
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) {
            ns.debugLog.warn('선택된 폴더가 비어있습니다.');
            return;
        }
        
        // 이미지 파일만 필터링
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            alert('폴더에 이미지 파일이 없습니다.');
            return;
        }
        
        if (imageFiles.length > 5) {
            alert('폴더에서 처음 5개의 이미지만 선택됩니다.');
            imageFiles.splice(5);
        }
        
        // 일반 이미지 업로드와 동일하게 처리
        const fakeEvent = {
            target: {
                files: imageFiles
            }
        };
        
        handleImageUpload(fakeEvent);
        
    } catch (error) {
        ns.debugLog.error('폴더 업로드 처리 중 에러:', error);
        alert('폴더 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
}

// 이미지 파일 유효성 검사
window.FacilityCropperNamespace.validateImageFile = function(file) {
    const ns = window.FacilityCropperNamespace;
    
    try {
        // 파일 크기 체크 (10MB 제한)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            ns.debugLog.warn(`파일 크기 초과: ${file.name} (${ns.formatFileSize(file.size)})`);
            return false;
        }
        
        // 파일 형식 체크
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
        if (!allowedTypes.includes(file.type)) {
            ns.debugLog.warn(`지원되지 않는 파일 형식: ${file.name} (${file.type})`);
            return false;
        }
        
        return true;
        
    } catch (error) {
        ns.debugLog.error('파일 유효성 검사 중 에러:', error);
        return false;
    }
}

// 파일 크기 포맷팅 (Fixed 파일에서 개선된 유틸리티)
window.FacilityCropperNamespace.formatFileSize = function(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ================================================
// 이미지 리스트 표시
// ================================================

// 이미지 리스트 표시
window.FacilityCropperNamespace.displayImageList = function(files) {
    console.log('📋 이미지 리스트 표시');
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        if (!ns.elements.imageList || !ns.elements.imageCount) {
            ns.debugLog.warn('이미지 리스트 요소를 찾을 수 없습니다.');
            return;
        }
        
        // 개수 업데이트
        ns.elements.imageCount.textContent = files.length;
        
        // 리스트 초기화
        ns.elements.imageList.innerHTML = '';
        
        // 각 파일에 대한 리스트 아이템 생성
        files.forEach((file, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'image-list-item';
            listItem.innerHTML = `
                <div class="image-info">
                    <div class="image-name">${file.name}</div>
                    <div class="image-size">${ns.formatFileSize(file.size)}</div>
                </div>
                <div class="image-status">
                    <span class="status-badge status-pending">대기중</span>
                </div>
            `;
            
            // 클릭 시 해당 이미지로 이동
            listItem.addEventListener('click', () => {
                window.FacilityCropperNamespace.loadImageForCrop(index);
            });
            
            ns.elements.imageList.appendChild(listItem);
        });
        
        // 이미지 리스트 섹션 표시
        if (ns.elements.imageListSection) {
            ns.elements.imageListSection.style.display = 'block';
        }
        
        console.log('✅ 이미지 리스트 표시 완료');
        
    } catch (error) {
        ns.debugLog.error('이미지 리스트 표시 중 에러:', error);
    }
}

// ================================================
// 크롭 이미지 로드
// ================================================

// 크롭용 이미지 로드
window.FacilityCropperNamespace.loadImageForCrop = function(index) {
    console.log('🖼️ 크롭용 이미지 로드:', index);
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        if (!ns.originalImages || ns.originalImages.length === 0) {
            ns.debugLog.error('원본 이미지가 없습니다.');
            return;
        }
        
        if (index < 0 || index >= ns.originalImages.length) {
            ns.debugLog.error('유효하지 않은 이미지 인덱스:', index);
            return;
        }
        
        const file = ns.originalImages[index];
        ns.currentImageIndex = index;
        
        // 이미지 정보 업데이트
        ns.updateImageInfo(file, index);
        
        // 크롭퍼 제거 (기존에 있다면)
        if (ns.cropper) {
            ns.cropper.destroy();
            ns.cropper = null;
        }
        
        // FileReader로 이미지 로드
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                if (ns.elements.cropImage) {
                    ns.elements.cropImage.src = e.target.result;
                    
                    // 이미지 로드 완료 후 크롭퍼 초기화
                    ns.elements.cropImage.onload = function() {
                        ns.initializeCropper();
                    };
                } else {
                    ns.debugLog.error('크롭 이미지 요소를 찾을 수 없습니다.');
                }
            } catch (error) {
                ns.debugLog.error('이미지 표시 중 에러:', error);
                ns.handleImageError(ns.elements.cropImage, index);
            }
        };
        
        reader.onerror = function() {
            ns.debugLog.error('파일 읽기 실패:', file.name);
            handleImageError(ns.elements.cropImage, index);
        };
        
        reader.readAsDataURL(file);
        
    } catch (error) {
        ns.debugLog.error('이미지 로드 중 에러:', error);
        handleImageError(ns.elements.cropImage, index);
    }
}

// 이미지 정보 업데이트
window.FacilityCropperNamespace.updateImageInfo = function(file, index) {
    const ns = window.FacilityCropperNamespace;
    
    try {
        // 현재 이미지 번호
        if (ns.elements.currentImageNumber) {
            ns.elements.currentImageNumber.textContent = `${index + 1} / ${ns.originalImages.length}`;
        }
        
        // 파일명
        if (ns.elements.imageFileName) {
            ns.elements.imageFileName.textContent = file.name;
        }
        
        // 이미지 크기 정보 (비동기로 로드)
        if (ns.elements.imageDimensions) {
            const img = new Image();
            img.onload = function() {
                ns.elements.imageDimensions.textContent = `${this.width} × ${this.height}px`;
            };
            img.src = URL.createObjectURL(file);
        }
        
        // 버튼 상태 업데이트
        window.FacilityCropperNamespace.updateNavigationButtons(index);
        
        // 이미지 리스트에서 현재 항목 하이라이트
        window.FacilityCropperNamespace.updateImageListSelection(index);
        
    } catch (error) {
        ns.debugLog.error('이미지 정보 업데이트 중 에러:', error);
    }
}

// 네비게이션 버튼 상태 업데이트
function updateNavigationButtons(index) {
    const ns = window.FacilityCropperNamespace;
    
    try {
        // 이전 버튼
        if (ns.elements.buttons.prevImage) {
            ns.elements.buttons.prevImage.disabled = (index === 0);
        }
        
        // 다음 버튼
        if (ns.elements.buttons.nextImage) {
            ns.elements.buttons.nextImage.disabled = (index === ns.originalImages.length - 1);
        }
        
    } catch (error) {
        ns.debugLog.error('네비게이션 버튼 업데이트 중 에러:', error);
    }
}

// 이미지 리스트 선택 상태 업데이트
function updateImageListSelection(index) {
    const ns = window.FacilityCropperNamespace;
    
    try {
        if (!ns.elements.imageList) return;
        
        // 모든 아이템에서 선택 상태 제거
        const allItems = ns.elements.imageList.querySelectorAll('.image-list-item');
        allItems.forEach(item => item.classList.remove('selected'));
        
        // 현재 아이템에 선택 상태 추가
        if (allItems[index]) {
            allItems[index].classList.add('selected');
        }
        
    } catch (error) {
        ns.debugLog.error('이미지 리스트 선택 업데이트 중 에러:', error);
    }
}

// ================================================
// 크롭퍼 초기화
// ================================================

// 크롭퍼 초기화 (향상된 설정)
function initializeCropper() {
    console.log('✂️ 크롭퍼 초기화 시작');
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        if (!ns.elements.cropImage) {
            ns.debugLog.error('크롭 이미지 요소를 찾을 수 없습니다.');
            return;
        }
        
        // 기존 크롭퍼 제거
        if (ns.cropper) {
            ns.cropper.destroy();
        }
        
        // 크롭퍼 생성
        ns.cropper = new Cropper(ns.elements.cropImage, {
            aspectRatio: 16/9, // 16:9 비율 고정
            viewMode: 1, // 캔버스가 컨테이너를 벗어나지 않도록
            dragMode: 'move', // 드래그로 이미지 이동
            autoCropArea: 0.8, // 초기 크롭 영역 크기 (Fixed 파일에서 개선)
            restore: false, // 크기 조절 시 크롭 박스 복원 안함
            guides: true, // 가이드 라인 표시
            center: true, // 중앙 인디케이터 표시
            highlight: true, // 크롭 영역 하이라이트
            cropBoxMovable: true, // 크롭 박스 이동 가능
            cropBoxResizable: true, // 크롭 박스 크기 조절 가능
            toggleDragModeOnDblclick: true, // 더블클릭으로 드래그 모드 전환
            
            // 최소 크기 설정 (원본 파일에서 개선)
            minCropBoxWidth: 160,
            minCropBoxHeight: 90,
            
            // 이벤트 핸들러
            ready: function() {
                console.log('✅ 크롭퍼 준비 완료');
                updatePreview();
            },
            
            cropstart: function() {
                ns.debugLog.log('크롭 시작');
            },
            
            cropmove: function() {
                updatePreview();
            },
            
            cropend: function() {
                ns.debugLog.log('크롭 완료');
                updatePreview();
            },
            
            crop: function(event) {
                // 실시간 크롭 데이터 업데이트
                updatePreview();
            },
            
            zoom: function(event) {
                // 줌 레벨 표시
                const zoomRatio = event.detail.ratio;
                ns.updateZoomIndicator(zoomRatio, event.detail.oldRatio > zoomRatio ? 'zoom-out' : 'zoom-in');
            }
        });
        
        console.log('✅ 크롭퍼 초기화 완료');
        
    } catch (error) {
        ns.debugLog.error('크롭퍼 초기화 중 에러:', error);
        alert('이미지 크롭퍼 초기화에 실패했습니다. 페이지를 새로고침해 주세요.');
    }
}

// ================================================
// 미리보기 업데이트
// ================================================

// 미리보기 업데이트
function updatePreview() {
    const ns = window.FacilityCropperNamespace;
    
    try {
        if (!ns.cropper || !ns.elements.previewCanvas) {
            return;
        }
        
        // 크롭된 이미지 데이터 가져오기
        const cropData = ns.cropper.getCropBoxData();
        const canvasData = ns.cropper.getCanvasData();
        
        // 프리뷰 캔버스 업데이트
        const canvas = ns.cropper.getCroppedCanvas({
            width: 320, // 미리보기 크기
            height: 180, // 16:9 비율 유지
            fillColor: '#fff'
        });
        
        if (canvas) {
            const ctx = ns.elements.previewCanvas.getContext('2d');
            ns.elements.previewCanvas.width = 320;
            ns.elements.previewCanvas.height = 180;
            
            ctx.clearRect(0, 0, 320, 180);
            ctx.drawImage(canvas, 0, 0, 320, 180);
        }
        
    } catch (error) {
        ns.debugLog.error('미리보기 업데이트 중 에러:', error);
    }
}

// ================================================
// 이미지 에러 처리
// ================================================

// 이미지 에러 처리 (원본 파일의 강력한 에러 처리)
function handleImageError(imgElement, imageIndex) {
    const ns = window.FacilityCropperNamespace;
    
    try {
        ns.debugLog.error(`이미지 로드 실패: 인덱스 ${imageIndex}`);
        
        // 에러 메시지 표시
        if (imgElement) {
            imgElement.alt = '이미지를 불러올 수 없습니다';
            imgElement.style.display = 'none';
        }
        
        // 에러 상태 UI 업데이트
        const errorDiv = document.createElement('div');
        errorDiv.className = 'image-error';
        errorDiv.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-message">이미지를 불러올 수 없습니다</div>
            <button class="btn btn-sm btn-outline-primary" onclick="retryImageLoad(${imageIndex})">
                다시 시도
            </button>
        `;
        
        // 크롭 섹션에 에러 메시지 표시
        if (ns.elements.cropSection) {
            const existingError = ns.elements.cropSection.querySelector('.image-error');
            if (existingError) {
                existingError.remove();
            }
            ns.elements.cropSection.appendChild(errorDiv);
        }
        
        // 이미지 리스트에서 에러 상태 표시
        updateImageListErrorState(imageIndex);
        
    } catch (error) {
        ns.debugLog.error('에러 처리 중 추가 에러:', error);
    }
}

// 이미지 리스트 에러 상태 업데이트
function updateImageListErrorState(index) {
    const ns = window.FacilityCropperNamespace;
    
    try {
        if (!ns.elements.imageList) return;
        
        const items = ns.elements.imageList.querySelectorAll('.image-list-item');
        if (items[index]) {
            const statusBadge = items[index].querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.className = 'status-badge status-error';
                statusBadge.textContent = '에러';
            }
        }
        
    } catch (error) {
        ns.debugLog.error('이미지 리스트 에러 상태 업데이트 중 에러:', error);
    }
}

// 이미지 재시도 로드
window.FacilityCropperNamespace.retryImageLoad = function(index) {
    console.log('🔄 이미지 재시도 로드:', index);
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        // 에러 메시지 제거
        if (ns.elements.cropSection) {
            const errorDiv = ns.elements.cropSection.querySelector('.image-error');
            if (errorDiv) {
                errorDiv.remove();
            }
        }
        
        // 이미지 재로드
        loadImageForCrop(index);
        
    } catch (error) {
        ns.debugLog.error('이미지 재시도 로드 중 에러:', error);
    }
}

// ================================================
// SEO 기능 (원본 파일의 고급 기능)
// ================================================

// SEO 기능 설정
function setupSEOFeatures() {
    console.log('🔍 SEO 기능 설정 시작');
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        // 시설명 자동 감지
        const facilityName = getCurrentFacilityName();
        
        if (facilityName && ns.elements.seo.previewFileName) {
            ns.elements.seo.previewFileName.textContent = facilityName;
        }
        
        // 키워드 버튼 이벤트 설정 (이미 setupEventListeners에서 처리됨)
        
        console.log('✅ SEO 기능 설정 완료');
        
    } catch (error) {
        ns.debugLog.error('SEO 기능 설정 중 에러:', error);
    }
}

// 현재 시설명 감지
window.FacilityCropperNamespace.getCurrentFacilityName = function() {
    try {
        // 페이지 제목에서 시설명 추출
        const title = document.title;
        const facilityMatch = title.match(/(.+?)\s*-\s*CareLink/);
        if (facilityMatch) {
            return facilityMatch[1].trim();
        }
        
        // H1 태그에서 시설명 추출
        const h1 = document.querySelector('h1');
        if (h1) {
            return h1.textContent.trim();
        }
        
        // 브레드크럼에서 시설명 추출
        const breadcrumb = document.querySelector('.breadcrumb-item.active');
        if (breadcrumb) {
            return breadcrumb.textContent.trim();
        }
        
        return null;
        
    } catch (error) {
        window.FacilityCropperNamespace.debugLog.error('시설명 감지 중 에러:', error);
        return null;
    }
}

// 키워드 클릭 처리
window.FacilityCropperNamespace.handleKeywordClick = function(keyword) {
    const ns = window.FacilityCropperNamespace;
    
    try {
        ns.debugLog.log('키워드 선택:', keyword);
        
        // 파일명에 키워드 적용
        if (ns.elements.seo.seoFileName) {
            const currentName = ns.elements.seo.seoFileName.value || '';
            const facilityName = getCurrentFacilityName() || '';
            
            // 새로운 파일명 생성
            let newFileName = facilityName;
            if (keyword) {
                newFileName += '_' + keyword;
            }
            
            // 한글을 영문으로 변환
            newFileName = convertKoreanToEnglishAdvanced(newFileName);
            
            ns.elements.seo.seoFileName.value = newFileName;
            
            // 미리보기 업데이트
            updateFileNamePreview();
        }
        
    } catch (error) {
        ns.debugLog.error('키워드 클릭 처리 중 에러:', error);
    }
}

// 한글-영문 변환 (원본 파일의 고급 기능)
window.FacilityCropperNamespace.convertKoreanToEnglishAdvanced = function(text) {
    try {
        // 기본 한글-영문 매핑
        const koreanToEnglish = {
            '요양원': 'nursing_home',
            '요양병원': 'hospital',
            '데이케어': 'daycare',
            '시설': 'facility',
            '내부': 'interior',
            '외부': 'exterior',
            '식당': 'dining',
            '침실': 'bedroom',
            '화장실': 'bathroom',
            '로비': 'lobby',
            '정원': 'garden'
        };
        
        let result = text;
        
        // 한글 단어 변환
        Object.keys(koreanToEnglish).forEach(korean => {
            result = result.replace(new RegExp(korean, 'g'), koreanToEnglish[korean]);
        });
        
        // 남은 한글을 로마자로 변환 (간단한 변환)
        result = result.replace(/[가-힣]/g, function(match) {
            // 기본적인 한글 로마자 변환 (완전하지 않음)
            return match.charCodeAt(0).toString(36);
        });
        
        // 특수문자 제거 및 언더스코어로 변환
        result = result.replace(/[^a-zA-Z0-9_]/g, '_');
        result = result.replace(/_+/g, '_');
        result = result.replace(/^_|_$/g, '');
        
        return result.toLowerCase();
        
    } catch (error) {
        window.FacilityCropperNamespace.debugLog.error('한글-영문 변환 중 에러:', error);
        return text.replace(/[^a-zA-Z0-9]/g, '_');
    }
}

// 파일명 미리보기 업데이트
window.FacilityCropperNamespace.updateFileNamePreview = function() {
    const ns = window.FacilityCropperNamespace;
    
    try {
        if (!ns.elements.seo.seoFileName || !ns.elements.seo.previewFileName) {
            return;
        }
        
        const baseFileName = ns.elements.seo.seoFileName.value || 'facility_image';
        const currentIndex = ns.currentImageIndex + 1;
        const fullFileName = `${baseFileName}_${currentIndex.toString().padStart(2, '0')}.jpg`;
        
        ns.elements.seo.previewFileName.textContent = fullFileName;
        
    } catch (error) {
        ns.debugLog.error('파일명 미리보기 업데이트 중 에러:', error);
    }
}

// ================================================
// 저장 기능
// ================================================

// 현재 이미지 저장 후 다음으로
function saveCurrentAndGoNext() {
    console.log('💾 현재 이미지 저장 후 다음으로');
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        if (!ns.cropper) {
            alert('크롭할 이미지가 없습니다.');
            return;
        }
        
        // 현재 이미지 크롭 및 저장
        const croppedCanvas = ns.cropper.getCroppedCanvas({
            width: 1920, // Full HD 가로
            height: 1080, // Full HD 세로 (16:9)
            fillColor: '#fff'
        });
        
        if (!croppedCanvas) {
            alert('이미지 크롭에 실패했습니다.');
            return;
        }
        
        // 크롭된 이미지를 배열에 저장
        croppedCanvas.toBlob(function(blob) {
            try {
                if (!ns.croppedImages) {
                    ns.croppedImages = [];
                }
                
                ns.croppedImages[ns.currentImageIndex] = blob;
                
                // 이미지 리스트 상태 업데이트
                ns.updateImageListSuccessState(ns.currentImageIndex);
                
                // 다음 이미지로 이동
                if (ns.currentImageIndex < ns.originalImages.length - 1) {
                    loadImageForCrop(ns.currentImageIndex + 1);
                } else {
                    // 마지막 이미지인 경우 완료 단계로
                    saveCurrentAndComplete();
                }
                
            } catch (error) {
                ns.debugLog.error('이미지 저장 중 에러:', error);
                alert('이미지 저장 중 오류가 발생했습니다.');
            }
        }, 'image/jpeg', 0.9);
        
    } catch (error) {
        ns.debugLog.error('저장 및 다음으로 이동 중 에러:', error);
        alert('처리 중 오류가 발생했습니다.');
    }
}

// 현재 이미지 저장 후 완료
function saveCurrentAndComplete() {
    console.log('💾 현재 이미지 저장 후 완료');
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        if (!ns.cropper) {
            // 이미 모든 이미지가 처리된 경우 바로 완료
            ns.saveAllImages();
            return;
        }
        
        // 현재 이미지 크롭 및 저장
        const croppedCanvas = ns.cropper.getCroppedCanvas({
            width: 1920,
            height: 1080,
            fillColor: '#fff'
        });
        
        if (!croppedCanvas) {
            alert('이미지 크롭에 실패했습니다.');
            return;
        }
        
        croppedCanvas.toBlob(function(blob) {
            try {
                if (!ns.croppedImages) {
                    ns.croppedImages = [];
                }
                
                ns.croppedImages[ns.currentImageIndex] = blob;
                
                // 이미지 리스트 상태 업데이트
                ns.updateImageListSuccessState(ns.currentImageIndex);
                
                // 모든 이미지 서버에 저장
                ns.saveAllImages();
                
            } catch (error) {
                ns.debugLog.error('최종 이미지 저장 중 에러:', error);
                alert('이미지 저장 중 오류가 발생했습니다.');
            }
        }, 'image/jpeg', 0.9);
        
    } catch (error) {
        ns.debugLog.error('저장 및 완료 중 에러:', error);
        alert('처리 중 오류가 발생했습니다.');
    }
}

// 이미지 리스트 성공 상태 업데이트
window.FacilityCropperNamespace.updateImageListSuccessState = function(index) {
    const ns = window.FacilityCropperNamespace;
    
    try {
        if (!ns.elements.imageList) return;
        
        const items = ns.elements.imageList.querySelectorAll('.image-list-item');
        if (items[index]) {
            const statusBadge = items[index].querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.className = 'status-badge status-success';
                statusBadge.textContent = '완료';
            }
        }
        
    } catch (error) {
        ns.debugLog.error('이미지 리스트 성공 상태 업데이트 중 에러:', error);
    }
}

// 모든 이미지 서버에 저장
window.FacilityCropperNamespace.saveAllImages = function() {
    console.log('🗄️ 모든 이미지 서버에 저장');
    
    const ns = window.FacilityCropperNamespace;
    
    try {
        if (!ns.croppedImages || ns.croppedImages.length === 0) {
            alert('저장할 이미지가 없습니다.');
            return;
        }
        
        // 로딩 상태 표시
        showLoadingState('이미지를 서버에 저장 중입니다...');
        
        // FormData 생성
        const formData = new FormData();
        formData.append('facilityId', ns.facilityId);
        
        // 크롭된 이미지들 추가
        ns.croppedImages.forEach((blob, index) => {
            if (blob) {
                const fileName = generateFileName(index);
                formData.append('images', blob, fileName);
            }
        });
        
        // 서버에 전송
        fetch('/api/facility/images/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`서버 오류: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            hideLoadingState();
            
            if (data.success) {
                alert('모든 이미지가 성공적으로 저장되었습니다!');
                
                // 완료 단계로 이동 또는 페이지 리다이렉트
                window.location.href = `/facility/manage/${ns.facilityId}`;
                
            } else {
                throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
            }
        })
        .catch(error => {
            hideLoadingState();
            ns.debugLog.error('서버 저장 중 에러:', error);
            alert('이미지 저장 중 오류가 발생했습니다: ' + error.message);
        });
        
    } catch (error) {
        hideLoadingState();
        ns.debugLog.error('모든 이미지 저장 중 에러:', error);
        alert('처리 중 오류가 발생했습니다.');
    }
}

// 파일명 생성
window.FacilityCropperNamespace.generateFileName = function(index) {
    const ns = window.FacilityCropperNamespace;
    
    try {
        const baseFileName = ns.elements.seo?.seoFileName?.value || 'facility_image';
        const paddedIndex = (index + 1).toString().padStart(2, '0');
        return `${baseFileName}_${paddedIndex}.jpg`;
        
    } catch (error) {
        ns.debugLog.error('파일명 생성 중 에러:', error);
        return `facility_image_${index + 1}.jpg`;
    }
}

// ================================================
// 로딩 상태 관리
// ================================================

// 로딩 상태 표시
window.FacilityCropperNamespace.showLoadingState = function(message = '처리 중입니다...') {
    try {
        // 기존 로딩 요소 제거
        hideLoadingState();
        
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'facilityImageLoading';
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        
        document.body.appendChild(loadingDiv);
        
    } catch (error) {
        console.error('로딩 상태 표시 중 에러:', error);
    }
}

// 로딩 상태 숨김
window.FacilityCropperNamespace.hideLoadingState = function() {
    try {
        const loadingDiv = document.getElementById('facilityImageLoading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
        
    } catch (error) {
        console.error('로딩 상태 숨김 중 에러:', error);
    }
}

// ================================================
// CSS 스타일 (동적 추가)
// ================================================

// 동적 CSS 스타일 추가
(function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* 로딩 오버레이 */
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        
        .loading-content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loading-message {
            font-size: 16px;
            color: #333;
        }
        
        /* 이미지 리스트 스타일 */
        .image-list-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            margin-bottom: 5px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .image-list-item:hover {
            background-color: #f8f9fa;
        }
        
        .image-list-item.selected {
            background-color: #e3f2fd;
            border-color: #2196f3;
        }
        
        .image-info {
            flex-grow: 1;
        }
        
        .image-name {
            font-weight: 500;
            margin-bottom: 2px;
        }
        
        .image-size {
            font-size: 0.875rem;
            color: #6c757d;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-success {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-error {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        /* 드래그 앤 드롭 스타일 */
        .drag-over {
            border-color: #007bff !important;
            background-color: #e3f2fd !important;
        }
        
        /* 에러 메시지 스타일 */
        .image-error {
            text-align: center;
            padding: 40px;
            background-color: #f8f9fa;
            border-radius: 10px;
            border: 2px dashed #dc3545;
        }
        
        .error-icon {
            font-size: 3rem;
            margin-bottom: 15px;
        }
        
        .error-message {
            font-size: 1.1rem;
            color: #dc3545;
            margin-bottom: 15px;
        }
        
        /* 줌 인디케이터 스타일 */
        #zoomIndicator {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 20px;
            border-radius: 25px;
            z-index: 1000;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }
    `;
    
    document.head.appendChild(style);
})();

console.log('🎉 시설 이미지 크롭퍼 (통합 버전) 로드 완료');