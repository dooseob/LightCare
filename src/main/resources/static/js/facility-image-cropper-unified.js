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
 */

// ================================================
// 네임스페이스 및 전역 상태 관리
// ================================================

// 전역 변수 충돌 방지 - 완전한 네임스페이스 격리
if (typeof window.FacilityCropperNamespace === 'undefined') {
    window.FacilityCropperNamespace = {};
}

// 전역 상태를 네임스페이스로 완전 격리
window.FacilityCropperNamespace = {
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
    }
};

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
        console.log('🔗 크롭퍼에 파일 설정:', files.length, '개');
    },
    
    // 단계 이동 메서드
    moveToStep: function(step) {
        this.state.currentStep = step;
        
        if (step === 2) {
            // 2단계로 이동
            document.getElementById('uploadSection').style.display = 'none';
            document.getElementById('cropSection').style.display = 'block';
            
            // 단계 표시기 업데이트
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            
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
    
    console.log('✅ 시설 이미지 크롭퍼 초기화 완료');
});

// ================================================
// 포맷 지원 확인
// ================================================

// 포맷 지원 확인 (AVIF/WebP 브라우저 호환성)
function checkFormatSupport() {
    console.log('🔍 브라우저 이미지 포맷 지원 확인');
    
    const ns = window.FacilityCropperNamespace;
    
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
}

// ================================================
// DOM 요소 초기화
// ================================================

// DOM 요소 초기화
function initializeElements() {
    console.log('🔍 DOM 요소 초기화 시작');
    
    const elements = window.FacilityCropperNamespace.elements;
    
    // 기본 요소들
    elements.imageInput = document.getElementById('imageInput');
    elements.uploadSection = document.getElementById('uploadSection');
    elements.cropSection = document.getElementById('cropSection');
    elements.compressionSection = document.getElementById('compressionSection');
    elements.manageSection = document.getElementById('manageSection');
    elements.completeSection = document.getElementById('completeSection');
    
    // 업로드 관련
    elements.uploadArea = document.getElementById('uploadArea');
    
    // 이미지 리스트
    elements.imageListSection = document.getElementById('imageListSection');
    elements.imageList = document.getElementById('imageList');
    elements.imageCount = document.getElementById('imageCount');
    
    // 크롭 관련
    elements.cropImage = document.getElementById('cropImage');
    elements.previewCanvas = document.getElementById('previewCanvas');
    elements.currentImageNumber = document.getElementById('currentImageNumber');
    elements.imageDimensions = document.getElementById('imageDimensions');
    elements.imageFileName = document.getElementById('imageFileName');
    
    // 줌 표시기
    elements.zoomIndicator = document.getElementById('zoomIndicator');
    elements.zoomLevel = document.getElementById('zoomLevel');
    elements.zoomStatus = document.getElementById('zoomStatus');
    
    // 단계 표시기
    elements.steps = {
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        step3: document.getElementById('step3'),
        step4: document.getElementById('step4'),
        step5: document.getElementById('step5')
    };
    
    // 버튼들
    elements.buttons = {
        backToUpload: document.getElementById('backToUploadBtn'),
        prevImage: document.getElementById('prevImageBtn'),
        nextImage: document.getElementById('nextImageBtn'),
        cropCurrent: document.getElementById('cropCurrentBtn'),
        zoomIn: document.getElementById('zoomInBtn'),
        zoomOut: document.getElementById('zoomOutBtn'),
        rotateLeft: document.getElementById('rotateLeftBtn'),
        rotateRight: document.getElementById('rotateRightBtn'),
        reset: document.getElementById('resetBtn'),
        goToManage: document.getElementById('goToManageBtn'),
        backToCompression: document.getElementById('backToCompressionBtn'),
        finalComplete: document.getElementById('finalCompleteBtn'),
        nextAndSave: document.getElementById('nextAndSaveBtn'),
        saveAndComplete: document.getElementById('saveAndCompleteBtn')
    };
    
    console.log('✅ DOM 요소 초기화 완료');
}

// ================================================
// 이벤트 리스너 설정
// ================================================

// 이벤트 리스너 설정
function setupEventListeners() {
    console.log('🔗 이벤트 리스너 설정 시작');
    const elements = window.FacilityCropperNamespace.elements;
    
    // 파일 입력 이벤트
    if (elements.imageInput) {
        elements.imageInput.removeEventListener('change', handleImageUpload);
        elements.imageInput.addEventListener('change', handleImageUpload);
        console.log('📁 파일 입력 이벤트 리스너 등록됨');
    }
    
    // 메인 파일 선택 버튼 (기존 버튼 사용하여 중복 방지)
    const mainFileSelectBtn = document.getElementById('mainFileSelectBtn');
    if (mainFileSelectBtn) {
        // 기존 이벤트 리스너가 있으므로 중복 등록하지 않음
        console.log('📁 기존 메인 파일 선택 버튼 감지됨 - 중복 이벤트 등록 생략');
    }
    
    // 통합된 이미지 불러오기 버튼 이벤트 설정
    const imageLoadBtn = document.getElementById('imageLoadBtn');
    const fileSelectOption = document.getElementById('fileSelectOption');
    const folderSelectOption = document.getElementById('folderSelectOption');
    
    if (imageLoadBtn) {
        imageLoadBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            handleFileSelection();
        });
    }
    
    if (fileSelectOption) {
        fileSelectOption.addEventListener('click', function(event) {
            event.preventDefault();
            handleFileSelection();
        });
    }
    
    if (folderSelectOption) {
        folderSelectOption.addEventListener('click', function(event) {
            event.preventDefault();
            handleFolderSelectionDirect();
        });
    }
    
    // 크롭 컨트롤 버튼들
    if (elements.buttons.zoomIn) {
        elements.buttons.zoomIn.addEventListener('click', () => zoomCropper(0.1));
    }
    if (elements.buttons.zoomOut) {
        elements.buttons.zoomOut.addEventListener('click', () => zoomCropper(-0.1));
    }
    if (elements.buttons.rotateLeft) {
        elements.buttons.rotateLeft.addEventListener('click', () => rotateCropper(-90));
    }
    if (elements.buttons.rotateRight) {
        elements.buttons.rotateRight.addEventListener('click', () => rotateCropper(90));
    }
    if (elements.buttons.reset) {
        elements.buttons.reset.addEventListener('click', () => resetCropper());
    }
    
    // 네비게이션 버튼들
    if (elements.buttons.backToUpload) {
        elements.buttons.backToUpload.addEventListener('click', goToUploadStep);
    }
    if (elements.buttons.prevImage) {
        elements.buttons.prevImage.addEventListener('click', goToPreviousImage);
    }
    if (elements.buttons.nextImage) {
        elements.buttons.nextImage.addEventListener('click', goToNextImage);
    }
    if (elements.buttons.cropCurrent) {
        elements.buttons.cropCurrent.addEventListener('click', cropCurrentImage);
    }
    
    // 새로운 버튼들 (통합 버전)
    if (elements.buttons.nextAndSave) {
        elements.buttons.nextAndSave.addEventListener('click', saveCurrentAndGoNext);
    }
    if (elements.buttons.saveAndComplete) {
        elements.buttons.saveAndComplete.addEventListener('click', saveCurrentAndComplete);
    }
    
    // 압축 설정 컨트롤 설정
    setupCompressionControls();
    
    console.log('✅ 이벤트 리스너 설정 완료');
}

// 파일 선택 처리 함수
function handleFileSelection() {
    try {
        const imageInput = document.getElementById('imageInput');
        if (!imageInput) {
            console.error('❌ imageInput 요소를 찾을 수 없습니다.');
            return;
        }
        
        // 파일 선택 대화상자 열기
        imageInput.click();
        console.log('✅ 파일 선택 대화상자 열림');
    } catch (error) {
        console.error('❌ 파일 선택 처리 오류:', error);
    }
}

// 폴더 선택 처리 함수 (폴더 선택 모듈과 연동)
function handleFolderSelectionDirect() {
    console.log('📂 폴더 선택 기능 호출');
    
    if (typeof window.FacilityFolderSelection !== 'undefined' && window.FacilityFolderSelection.openFolderModal) {
        window.FacilityFolderSelection.openFolderModal();
    } else {
        console.warn('⚠️ 폴더 선택 모듈이 로드되지 않았습니다. 파일 선택으로 대체합니다.');
        handleFileSelection();
    }
}

// 압축 설정 컨트롤
function setupCompressionControls() {
    // 품질 슬라이더 이벤트
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityPercent = document.getElementById('qualityPercent');
    
    if (qualitySlider && qualityPercent) {
        qualitySlider.addEventListener('input', function() {
            const value = Math.round(this.value * 100);
            qualityPercent.textContent = value + '%';
            updateCompressionPreview();
        });
        
        // 초기값 설정
        qualityPercent.textContent = Math.round(qualitySlider.value * 100) + '%';
    }
    
    // 이미지 형식 라디오 이벤트
    const formatRadios = document.querySelectorAll('input[name="imageFormat"]');
    formatRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateCompressionPreview();
            console.log('🔄 이미지 형식 변경:', this.value);
        });
    });
    
    // 자동 최적화 체크박스
    const autoOptimize = document.getElementById('autoOptimize');
    if (autoOptimize) {
        autoOptimize.addEventListener('change', function() {
            updateCompressionPreview();
            console.log('🤖 자동 최적화:', this.checked);
        });
    }
    
    // Alt 텍스트 자동 생성 버튼
    const autoGenerateAltBtn = document.getElementById('autoGenerateAltBtn');
    if (autoGenerateAltBtn) {
        autoGenerateAltBtn.addEventListener('click', generateAltText);
        console.log('✨ Alt 텍스트 자동 생성 버튼 등록됨');
    }
    
    console.log('⚙️ 압축 컨트롤 설정 완료');
}

// ================================================
// 이미지 업로드 및 처리
// ================================================

// 이미지 업로드 처리 (다중 파일 지원)
function handleImageUpload(event) {
    console.log('📁 다중 파일 업로드 이벤트 발생');
    const files = Array.from(event.target.files);
    
    if (files.length === 0) {
        console.log('선택된 파일이 없습니다');
        return;
    }
    
    console.log(`📸 선택된 파일 수: ${files.length}`);
    
    // 최대 5장 제한
    if (files.length > 5) {
        alert('최대 5장까지만 등록할 수 있습니다.');
        return;
    }
    
    // 파일 검증
    const validFiles = files.filter(file => validateImageFile(file));
    if (validFiles.length === 0) {
        alert('유효한 이미지 파일이 없습니다.');
        return;
    }
    
    if (validFiles.length !== files.length) {
        alert(`${files.length - validFiles.length}개 파일이 형식 오류로 제외되었습니다.`);
    }
    
    // 기존 이미지 초기화
    const ns = window.FacilityCropperNamespace;
    ns.originalImages = [];
    ns.croppedImages = [];
    ns.currentImageIndex = 0;
    
    // 순차적 파일 처리
    processFilesSequentially(validFiles);
}

// 이미지 파일 검증
function validateImageFile(file) {
    console.log(`🔍 파일 검증: ${file.name}`);
    
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
        console.error(`❌ 이미지 파일이 아님: ${file.name}`);
        return false;
    }
    
    // 지원되는 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        console.error(`❌ 지원되지 않는 형식: ${file.name} (${file.type})`);
        return false;
    }
    
    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
        console.error(`❌ 파일 크기 초과: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        return false;
    }
    
    console.log(`✅ 파일 검증 통과: ${file.name}`);
    return true;
}

// 순차적 파일 처리
function processFilesSequentially(files) {
    let processedCount = 0;
    const ns = window.FacilityCropperNamespace;
    
    console.log(`🔄 ${files.length}개 파일 순차 처리 시작`);
    
    files.forEach((file, index) => {
        console.log(`📸 파일 처리 중: ${file.name} (${index + 1}/${files.length})`);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = {
                id: index,
                name: file.name,
                size: file.size,
                type: file.type,
                dataUrl: e.target.result,
                originalFile: file,
                seoFileName: '',
                altText: '',
                selectedKeywords: [],
                processed: false
            };
            
            ns.originalImages.push(imageData);
            processedCount++;
            
            console.log(`✅ 이미지 로드 완료: ${file.name} (${processedCount}/${files.length})`);
            
            // 모든 파일 처리 완료 시
            if (processedCount === files.length) {
                console.log('🎉 모든 이미지 로드 완료 - 크롭 단계로 이동');
                
                showImageList();
                loadImageToCropper(ns.originalImages[0]);
                goToCropStep();
            }
        };
        
        reader.onerror = function() {
            console.error(`❌ 파일 읽기 실패: ${file.name}`);
            alert(`${file.name} 파일을 읽을 수 없습니다.`);
        };
        
        reader.readAsDataURL(file);
    });
}

// ================================================
// 크롭퍼 관련 기능
// ================================================

// 이미지를 크롭퍼에 로드
function loadImageToCropper(imageData) {
    const ns = window.FacilityCropperNamespace;
    const elements = ns.elements;
    
    if (!imageData || !elements.cropImage) {
        console.error('❌ loadImageToCropper: 이미지 데이터 또는 cropImage 요소가 없습니다.');
        return;
    }
    
    console.log(`🖼️ 크롭퍼에 이미지 로드: ${imageData.name}`);
    
    // 현재 이미지 정보 업데이트
    updateCurrentImageInfo();
    
    elements.cropImage.src = imageData.dataUrl;
    elements.cropImage.style.display = 'block';
    
    // 이미지 로드 후 크롭퍼 초기화
    elements.cropImage.onload = function() {
        console.log('✅ 이미지 로드 완료, 크롭퍼 초기화 시작');
        setTimeout(() => {
            initializeCropper();
            updateImageDimensions();
        }, 100);
    };
}

// 크롭용 이미지 로드 함수 (네임스페이스 적용)
function loadImageForCrop(index) {
    console.log('🖼️ 크롭용 이미지 로드:', index);
    const ns = window.FacilityCropperNamespace;
    
    if (!ns.originalImages || ns.originalImages.length === 0) {
        console.error('❌ 로드할 이미지가 없습니다');
        return;
    }
    
    if (index < 0 || index >= ns.originalImages.length) {
        console.error('❌ 잘못된 이미지 인덱스:', index);
        return;
    }
    
    ns.currentImageIndex = index;
    const file = ns.originalImages[index];
    
    // 이미지 읽기
    const reader = new FileReader();
    reader.onload = function(e) {
        const cropImage = document.getElementById('cropImage');
        if (cropImage) {
            cropImage.src = e.target.result;
            cropImage.style.display = 'block';
            
            // 기존 크롭퍼 정리
            if (ns.cropper) {
                ns.cropper.destroy();
            }
            
            // 새 크롭퍼 초기화
            ns.cropper = new Cropper(cropImage, {
                aspectRatio: 16/9,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 1,
                background: false,
                responsive: true,
                restore: false,
                checkCrossOrigin: false,
                modal: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
                
                ready: function() {
                    console.log('✅ 크롭퍼 준비 완료 - 이미지:', index + 1);
                    
                    // 네비게이션 UI 업데이트
                    updateImageNavigation();
                    
                    // 이미지 정보 업데이트
                    updateImageInfo(index);
                    
                    // Alt 태그 자동 생성
                    if (typeof generateAutoAltText === 'function') {
                        generateAutoAltText(index);
                    }
                    
                    // 스마트 스크롤 설정
                    setTimeout(() => {
                        setupSmartScroll();
                    }, 100);
                }
            });
        }
    };
    
    reader.readAsDataURL(file);
}

// 현재 이미지 정보 업데이트
function updateCurrentImageInfo() {
    const ns = window.FacilityCropperNamespace;
    const elements = ns.elements;
    
    if (!ns.originalImages.length) return;
    
    // 현재 이미지 번호 업데이트
    if (elements.currentImageNumber) {
        elements.currentImageNumber.textContent = `${ns.currentImageIndex + 1}/${ns.originalImages.length}`;
    }
    
    // 파일명 업데이트
    if (elements.imageFileName) {
        elements.imageFileName.textContent = ns.originalImages[ns.currentImageIndex]?.name || '';
    }
    
    // 네비게이션 버튼 표시/숨김
    if (elements.buttons.prevImage) {
        elements.buttons.prevImage.style.display = ns.currentImageIndex > 0 ? 'inline-block' : 'none';
    }
    if (elements.buttons.nextImage) {
        elements.buttons.nextImage.style.display = ns.currentImageIndex < ns.originalImages.length - 1 ? 'inline-block' : 'none';
    }
}

// 이미지 정보 업데이트 (안전하게 처리)
function updateImageInfo(fileOrIndex) {
    const ns = window.FacilityCropperNamespace;
    const imageFileName = document.getElementById('imageFileName');
    const imageDimensions = document.getElementById('imageDimensions');
    const currentImageNumber = document.getElementById('currentImageNumber');
    
    // 현재 이미지 가져오기
    let currentFile = null;
    if (typeof fileOrIndex === 'number') {
        // 인덱스로 호출된 경우
        currentFile = ns.originalImages[fileOrIndex];
    } else if (fileOrIndex && fileOrIndex.name) {
        // File 객체로 호출된 경우
        currentFile = fileOrIndex;
    } else {
        // 현재 인덱스의 파일 사용
        currentFile = ns.originalImages[ns.currentImageIndex];
    }
    
    if (!currentFile) {
        console.warn('⚠️ 유효한 파일을 찾을 수 없습니다');
        return;
    }
    
    if (imageFileName) {
        imageFileName.textContent = currentFile.name || 'unknown';
    }
    
    if (currentImageNumber) {
        currentImageNumber.textContent = `${ns.currentImageIndex + 1}/${ns.originalImages.length}`;
    }
    
    // 이미지 실제 크기 확인
    if (currentFile instanceof File || (currentFile.type && currentFile.type.startsWith('image/'))) {
        const img = new Image();
        img.onload = function() {
            if (imageDimensions) {
                imageDimensions.textContent = `${this.width} × ${this.height}`;
            }
        };
        img.onerror = function() {
            if (imageDimensions) {
                imageDimensions.textContent = '크기 확인 불가';
            }
        };
        
        try {
            img.src = URL.createObjectURL(currentFile);
        } catch (error) {
            console.warn('⚠️ 이미지 URL 생성 실패:', error);
            if (imageDimensions) {
                imageDimensions.textContent = '크기 확인 불가';
            }
        }
    } else {
        if (imageDimensions) {
            imageDimensions.textContent = '기존 이미지';
        }
    }
}

// 크롭퍼 초기화 (16:9 비율)
function initializeCropper() {
    const ns = window.FacilityCropperNamespace;
    const elements = ns.elements;
    
    if (!elements.cropImage) {
        console.error('❌ cropImage 요소를 찾을 수 없습니다.');
        return;
    }
    
    console.log('🔧 크롭퍼 초기화 - 16:9 비율');
    
    // 기존 크롭퍼 정리
    if (ns.cropper) {
        ns.cropper.destroy();
        ns.cropper = null;
    }
    
    ns.cropper = new Cropper(elements.cropImage, {
        aspectRatio: 16 / 9, // 시설 사진은 16:9 비율
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 0.8,
        responsive: true,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: true,
        rotatable: true,
        scalable: true,
        zoomable: true,
        minCropBoxWidth: 200,
        minCropBoxHeight: 112, // 16:9 비율에 맞춘 최소 높이
        ready() {
            console.log('✅ 크롭퍼 준비 완료');
            updatePreview();
            // 크롭퍼 준비 완료 후 스마트 스크롤 설정
            setTimeout(() => {
                setupSmartScroll();
            }, 100);
        },
        crop: updatePreview
    });
}

// 스마트 스크롤 기능 (크롭퍼와 페이지 스크롤 연동)
function setupSmartScroll() {
    const ns = window.FacilityCropperNamespace;
    const elements = ns.elements;
    
    if (!ns.cropper || !elements.cropImage) return;
    
    const cropContainer = elements.cropImage.parentElement;
    if (!cropContainer) return;
    
    // 최대/최소 줌 레벨 설정
    const MIN_ZOOM = 0.1;  // 최소 줌 (10%)
    const MAX_ZOOM = 3.0;  // 최대 줌 (300%)
    
    console.log('🖱️ 스마트 스크롤 기능 활성화');
    
    cropContainer.addEventListener('wheel', function(event) {
        if (!ns.cropper) return;
        
        // 현재 줌 레벨 확인
        const canvasData = ns.cropper.getCanvasData();
        const containerData = ns.cropper.getContainerData();
        const currentZoom = canvasData.naturalWidth > 0 ? canvasData.width / canvasData.naturalWidth : 1;
        
        const isZoomingIn = event.deltaY < 0;  // 휠을 위로 올리면 확대
        const isZoomingOut = event.deltaY > 0; // 휠을 아래로 내리면 축소
        
        console.log('🔍 현재 줌:', currentZoom.toFixed(2), '방향:', isZoomingIn ? '확대' : '축소');
        
        // 임계값 설정
        const maxThreshold = 2.8;  // 조금 더 낮은 최대값
        const minThreshold = 0.2;  // 조금 더 높은 최소값
        
        // 확대 시: 최대 줌 근처에서 페이지 스크롤 허용
        if (isZoomingIn && currentZoom >= maxThreshold) {
            updateZoomIndicator(currentZoom, '최대 확대');
            console.log('📈 최대 확대 근처 - 페이지 스크롤 실행');
            
            // 페이지 스크롤을 더 부드럽게 실행
            const scrollAmount = event.deltaY * 0.5; // 스크롤 강도 조절
            window.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
            });
            return;
        }
        
        // 축소 시: 최소 줌 근처에서 페이지 스크롤 허용  
        if (isZoomingOut && currentZoom <= minThreshold) {
            updateZoomIndicator(currentZoom, '최소 축소');
            console.log('📉 최소 축소 근처 - 페이지 스크롤 실행');
            
            // 페이지 스크롤을 더 부드럽게 실행
            const scrollAmount = event.deltaY * 0.5; // 스크롤 강도 조절
            window.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
            });
            return;
        }
        
        // 이미지 확대/축소 범위 내에서는 기본 스크롤 차단하고 줌 적용
        event.preventDefault();
        event.stopPropagation();
        
        const zoomDelta = isZoomingIn ? 0.1 : -0.1;
        ns.cropper.zoom(zoomDelta);
        
        // 줌 표시기 업데이트
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + zoomDelta));
        updateZoomIndicator(newZoom, isZoomingIn ? '확대' : '축소');
        
    }, { passive: false }); // passive: false로 설정해야 preventDefault 작동
}

// 줌 표시기 업데이트
function updateZoomIndicator(zoomLevel, status) {
    const elements = window.FacilityCropperNamespace.elements;
    
    if (!elements.zoomIndicator || !elements.zoomLevel || !elements.zoomStatus) return;
    
    // 줌 레벨을 퍼센트로 표시
    const zoomPercent = Math.round(zoomLevel * 100);
    elements.zoomLevel.textContent = zoomPercent + '%';
    
    // 상태 메시지 업데이트
    let statusMessage = '';
    let statusClass = '';
    
    if (status === '최대 확대') {
        statusMessage = '(최대 - 페이지 스크롤 가능)';
        statusClass = 'text-warning';
    } else if (status === '최소 축소') {
        statusMessage = '(최소 - 페이지 스크롤 가능)';
        statusClass = 'text-info';
    } else {
        statusMessage = `(${status} 중)`;
        statusClass = 'text-success';
    }
    
    elements.zoomStatus.textContent = statusMessage;
    elements.zoomStatus.className = `ms-2 ${statusClass}`;
    
    // 줌 표시기 보이기
    elements.zoomIndicator.style.display = 'block';
    
    // 3초 후 자동 숨김
    clearTimeout(window.zoomIndicatorTimeout);
    window.zoomIndicatorTimeout = setTimeout(() => {
        if (elements.zoomIndicator) {
            elements.zoomIndicator.style.display = 'none';
        }
    }, 3000);
}

// 미리보기 업데이트 (16:9 비율)
function updatePreview() {
    const ns = window.FacilityCropperNamespace;
    const elements = ns.elements;
    
    if (!ns.cropper || !elements.previewCanvas) return;
    
    console.log('🖼️ 미리보기 업데이트 시작');
    
    // 크롭된 이미지를 캔버스에 그리기 (16:9 비율)
    const canvas = ns.cropper.getCroppedCanvas({
        width: 192,
        height: 108, // 16:9 비율
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });
    
    if (canvas) {
        const ctx = elements.previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, elements.previewCanvas.width, elements.previewCanvas.height);
        ctx.drawImage(canvas, 0, 0, elements.previewCanvas.width, elements.previewCanvas.height);
        console.log('✅ 미리보기 업데이트 완료');
    }
}

// 이미지 크기 정보 업데이트
function updateImageDimensions() {
    const ns = window.FacilityCropperNamespace;
    const elements = ns.elements;
    
    if (!ns.cropper || !elements.imageDimensions) return;
    
    const imageData = ns.cropper.getImageData();
    elements.imageDimensions.textContent = `${Math.round(imageData.naturalWidth)} × ${Math.round(imageData.naturalHeight)}`;
}

// ================================================
// 이미지 크롭 및 저장
// ================================================

// 현재 이미지 크롭
function cropCurrentImage() {
    const ns = window.FacilityCropperNamespace;
    const elements = ns.elements;
    
    if (!ns.cropper) {
        alert('크롭퍼가 초기화되지 않았습니다.');
        return;
    }
    
    console.log(`🔄 이미지 크롭 중: ${ns.currentImageIndex + 1}/${ns.originalImages.length}`);
    
    // 버튼 로딩 상태 설정
    const cropBtn = elements.buttons.cropCurrent;
    setButtonLoading(cropBtn, true, '크롭 중...');
    
    try {
        // 크롭된 이미지 생성 (16:9 비율)
        const canvas = ns.cropper.getCroppedCanvas({
            width: 800,
            height: 450, // 16:9 비율
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        if (canvas) {
            const croppedImageData = canvas.toDataURL('image/jpeg', 0.9);
            
            // 크롭된 이미지 저장
            ns.croppedImages[ns.currentImageIndex] = {
                ...ns.originalImages[ns.currentImageIndex],
                croppedDataUrl: croppedImageData,
                isCropped: true
            };
            
            console.log(`✅ 이미지 크롭 완료: ${ns.currentImageIndex + 1}`);
            
            // 다음 이미지로 자동 이동 또는 관리 단계로
            setTimeout(() => {
                setButtonLoading(cropBtn, false);
                
                if (ns.currentImageIndex < ns.originalImages.length - 1) {
                    // 다음 이미지가 있으면 이동
                    goToNextImage();
                } else {
                    // 모든 이미지 크롭 완료 시 관리 단계로 이동
                    console.log('🎉 모든 이미지 크롭 완료 - 관리 단계로 이동');
                    goToManageStep();
                }
            }, 500);
        } else {
            throw new Error('캔버스 생성 실패');
        }
        
    } catch (error) {
        console.error('크롭 처리 오류:', error);
        setButtonLoading(cropBtn, false);
        alert('이미지 처리 중 오류가 발생했습니다.');
    }
}

// 현재 이미지 크롭 후 다음으로 이동
async function saveCurrentAndGoNext() {
    const ns = window.FacilityCropperNamespace;
    ns.debugLog.log('saveCurrentAndGoNext 함수 시작');
    ns.debugLog.checkState();
    
    try {
        ns.debugLog.log('현재 이미지 크롭 후 다음 이미지로 이동 시작', {
            currentIndex: ns.currentImageIndex,
            totalImages: ns.originalImages ? ns.originalImages.length : 'null'
        });
        
        // 현재 이미지 크롭 및 저장
        ns.debugLog.log('cropAndSaveCurrentImage 호출 전');
        await cropAndSaveCurrentImage();
        ns.debugLog.log('cropAndSaveCurrentImage 완료');
        
        // 다음 이미지로 이동
        if (ns.currentImageIndex < ns.originalImages.length - 1) {
            ns.currentImageIndex++;
            loadImageForCrop(ns.currentImageIndex);
            restoreImageData(ns.currentImageIndex);
            updateImageNavigation();
        } else {
            // 마지막 이미지인 경우 관리 단계로 이동
            console.log('✅ 마지막 이미지 완료 - 관리 단계로 이동');
            goToManageStep();
        }
        
    } catch (error) {
        console.error('❌ 이미지 저장 후 이동 중 오류:', error);
        alert('이미지 저장 중 오류가 발생했습니다: ' + error.message);
    }
}

// 현재 이미지 크롭 후 완료
async function saveCurrentAndComplete() {
    try {
        console.log('✅ 현재 이미지 크롭 후 전체 완료');
        
        // 현재 이미지 크롭 및 저장
        await cropAndSaveCurrentImage();
        
        // 관리 단계로 이동
        goToManageStep();
        
    } catch (error) {
        console.error('❌ 이미지 저장 후 완료 중 오류:', error);
        alert('이미지 저장 중 오류가 발생했습니다: ' + error.message);
    }
}

// 현재 이미지 크롭 및 저장
async function cropAndSaveCurrentImage() {
    return new Promise((resolve, reject) => {
        const ns = window.FacilityCropperNamespace;
        ns.debugLog.log('cropAndSaveCurrentImage 시작', {
            cropper: !!ns.cropper,
            originalImagesLength: ns.originalImages ? ns.originalImages.length : 'null',
            currentImageIndex: ns.currentImageIndex
        });
        
        if (!ns.cropper) {
            ns.debugLog.error('크롭퍼가 초기화되지 않았습니다');
            reject(new Error('크롭퍼가 초기화되지 않았습니다'));
            return;
        }
        
        if (!ns.originalImages || ns.originalImages.length === 0) {
            ns.debugLog.error('원본 이미지가 없습니다');
            reject(new Error('원본 이미지가 없습니다'));
            return;
        }
        
        if (ns.currentImageIndex < 0 || ns.currentImageIndex >= ns.originalImages.length) {
            ns.debugLog.error('잘못된 이미지 인덱스', { 
                currentImageIndex: ns.currentImageIndex, 
                totalImages: ns.originalImages.length 
            });
            reject(new Error('잘못된 이미지 인덱스'));
            return;
        }
        
        ns.debugLog.log('현재 이미지 데이터 저장 시작');
        // 현재 이미지 데이터 저장
        saveCurrentImageData();
        ns.debugLog.log('현재 이미지 데이터 저장 완료');
        
        ns.debugLog.log('크롭된 캔버스 생성 시작');
        // 크롭된 이미지 데이터 생성
        const canvas = ns.cropper.getCroppedCanvas({
            width: 960,
            height: 540,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        if (!canvas) {
            ns.debugLog.error('크롭된 캔버스 생성 실패');
            reject(new Error('크롭된 이미지를 생성할 수 없습니다'));
            return;
        }
        
        ns.debugLog.log('크롭된 캔버스 생성 완료', {
            canvasWidth: canvas.width,
            canvasHeight: canvas.height
        });
        
        // 압축 설정 적용
        const quality = parseFloat(document.getElementById('qualitySlider')?.value || '0.8');
        const format = document.querySelector('input[name="imageFormat"]:checked')?.value || 'jpeg';
        
        ns.debugLog.log('압축 설정 적용', { quality, format });
        
        let mimeType = 'image/jpeg';
        if (format === 'webp') mimeType = 'image/webp';
        if (format === 'avif') mimeType = 'image/avif';
        
        ns.debugLog.log('canvas.toBlob() 호출 준비', { mimeType, quality });
        
        // 타임아웃 설정 (10초)
        const timeoutId = setTimeout(() => {
            ns.debugLog.error('canvas.toBlob() 타임아웃 발생 - 10초 경과');
            reject(new Error('이미지 처리 타임아웃 (10초 경과)'));
        }, 10000);
        
        ns.debugLog.log('canvas.toBlob() 호출 시작');
        canvas.toBlob((blob) => {
            clearTimeout(timeoutId); // 타임아웃 해제
            
            if (!blob) {
                ns.debugLog.error('canvas.toBlob() 결과가 null/undefined');
                reject(new Error('이미지 압축에 실패했습니다'));
                return;
            }
            
            ns.debugLog.log('canvas.toBlob() 성공', {
                blobSize: blob.size,
                blobType: blob.type,
                currentIndex: ns.currentImageIndex
            });
            
            // 크롭된 이미지를 원본 이미지 배열에 저장
            const currentImage = ns.originalImages[ns.currentImageIndex];
            currentImage.croppedBlob = blob;
            currentImage.processed = true;
            
            console.log(`✅ 이미지 ${ns.currentImageIndex + 1} 크롭 완료:`, {
                size: `${blob.size} bytes`,
                type: blob.type,
                fileName: currentImage.seoFileName || currentImage.name
            });
            
            resolve(blob);
        }, mimeType, quality);
    });
}

// ================================================
// 단계 이동 및 UI 업데이트
// ================================================

// 단계 이동 함수들
function goToUploadStep() {
    hideAllSections();
    const elements = window.FacilityCropperNamespace.elements;
    if (elements.uploadSection) elements.uploadSection.style.display = 'block';
    updateStepIndicator(1);
    
    // 초기화
    if (elements.imageInput) elements.imageInput.value = '';
    const ns = window.FacilityCropperNamespace;
    if (ns.cropper) {
        ns.cropper.destroy();
        ns.cropper = null;
    }
    ns.originalImages = [];
    ns.croppedImages = [];
    ns.currentImageIndex = 0;
}

function goToCropStep() {
    hideAllSections();
    const elements = window.FacilityCropperNamespace.elements;
    if (elements.cropSection) elements.cropSection.style.display = 'block';
    updateStepIndicator(2);
    
    // 첫 번째 이미지로 설정
    const ns = window.FacilityCropperNamespace;
    if (ns.originalImages.length > 0) {
        ns.currentImageIndex = 0;
        loadImageForCrop(0);
    }
}

function goToCompressionStep() {
    hideAllSections();
    const elements = window.FacilityCropperNamespace.elements;
    if (elements.compressionSection) elements.compressionSection.style.display = 'block';
    updateStepIndicator(3);
    
    // 압축 미리보기 업데이트
    updateCompressionPreview();
}

function goToManageStep() {
    console.log('📋 관리 단계로 이동');
    
    hideAllSections();
    const elements = window.FacilityCropperNamespace.elements;
    if (elements.manageSection) {
        elements.manageSection.style.display = 'block';
        console.log('📋 관리 단계 표시 완료');
    }
    updateStepIndicator(4);
    
    // 관리 이미지 그리드 업데이트
    updateManageImagesGrid();
}

function goToCompleteStep() {
    hideAllSections();
    const elements = window.FacilityCropperNamespace.elements;
    if (elements.completeSection) {
        elements.completeSection.style.display = 'block';
        console.log('🎆 완료 단계 표시');
    }
    updateStepIndicator(5);
    
    // 완료된 이미지들 표시
    updateFinalImagesGrid();
}

// 모든 섹션 숨기기
function hideAllSections() {
    const elements = window.FacilityCropperNamespace.elements;
    const sections = ['uploadSection', 'cropSection', 'compressionSection', 'manageSection', 'completeSection'];
    sections.forEach(sectionId => {
        const section = elements[sectionId];
        if (section) {
            section.style.display = 'none';
        }
    });
    
    // 이미지 리스트 섹션도 숨김
    if (elements.imageListSection) {
        elements.imageListSection.style.display = 'none';
    }
}

// 단계 표시기 업데이트
function updateStepIndicator(currentStep) {
    const elements = window.FacilityCropperNamespace.elements;
    if (!elements.steps) return;
    
    // 모든 단계 초기화
    Object.values(elements.steps).forEach(step => {
        if (step) {
            step.classList.remove('active', 'completed');
        }
    });
    
    // 현재 단계까지 활성화
    for (let i = 1; i <= currentStep; i++) {
        const step = elements.steps[`step${i}`];
        if (step) {
            if (i === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.add('completed');
            }
        }
    }
}

// ================================================
// 압축 및 Alt 텍스트 관련
// ================================================

// 압축 미리보기 업데이트
function updateCompressionPreview() {
    const ns = window.FacilityCropperNamespace;
    const finalPreviewImage = document.getElementById('finalPreviewImage');
    const compressionSavings = document.getElementById('compressionSavings');
    const currentFormat = document.getElementById('currentFormat');
    
    if (!finalPreviewImage || ns.croppedImages.length === 0) return;
    
    // 첫 번째 크롭된 이미지를 미리보기로 표시
    const firstCroppedImage = ns.croppedImages.find(img => img && img.croppedDataUrl);
    if (!firstCroppedImage) return;
    
    // 현재 설정 가져오기
    const qualitySlider = document.getElementById('qualitySlider');
    const quality = qualitySlider ? parseFloat(qualitySlider.value) : 0.8;
    
    const formatRadios = document.querySelectorAll('input[name="imageFormat"]:checked');
    let format = formatRadios.length > 0 ? formatRadios[0].value : 'jpeg';
    
    // 브라우저 지원 확인 후 폴백
    if (format === 'avif' && !ns.formatSupport.avif) {
        console.log('⚠️ AVIF 미지원으로 WebP로 폴백');
        format = ns.formatSupport.webp ? 'webp' : 'jpeg';
        
        // UI에서 지원되는 형식으로 자동 변경
        const fallbackRadio = document.getElementById(ns.formatSupport.webp ? 'formatWEBP' : 'formatJPEG');
        if (fallbackRadio) {
            fallbackRadio.checked = true;
        }
    }
    
    if (format === 'webp' && !ns.formatSupport.webp) {
        console.log('⚠️ WebP 미지원으로 JPEG로 폴백');
        format = 'jpeg';
        
        // UI에서 JPEG로 자동 변경
        const jpegRadio = document.getElementById('formatJPEG');
        if (jpegRadio) {
            jpegRadio.checked = true;
        }
    }
    
    // 선택된 형식에 따라 이미지 재압축
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // 형식별 압축 적용
        let mimeType = 'image/jpeg';
        let compressionRatio = 0.7; // 기본 압축률
        
        switch(format) {
            case 'avif':
                mimeType = 'image/avif';
                compressionRatio = 0.9; // AVIF는 높은 압축률
                break;
            case 'webp':
                mimeType = 'image/webp';
                compressionRatio = 0.8; // WebP는 중간 압축률
                break;
            case 'jpeg':
            default:
                mimeType = 'image/jpeg';
                compressionRatio = 0.7; // JPEG는 낮은 압축률
                break;
        }
        
        // 압축된 이미지 생성
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        finalPreviewImage.src = compressedDataUrl;
        
        // 압축 정보 업데이트
        if (compressionSavings) {
            const savingsPercent = Math.round(compressionRatio * 100);
            compressionSavings.textContent = `평균 ${savingsPercent}% 용량 절약`;
            compressionSavings.className = 'compression-savings text-success fw-bold mb-2';
        }
        
        if (currentFormat) {
            currentFormat.textContent = format.toUpperCase();
            currentFormat.className = 'fw-bold';
        }
        
        console.log(`🔧 압축 미리보기 업데이트: ${format.toUpperCase()}, 품질: ${Math.round(quality * 100)}%`);
    };
    
    img.src = firstCroppedImage.croppedDataUrl;
}

// Alt 텍스트 자동 생성
function generateAltText() {
    const ns = window.FacilityCropperNamespace;
    const altInput = document.getElementById('altTextInput') || document.getElementById('altText');
    if (!altInput) return;
    
    console.log('✨ Alt 텍스트 자동 생성 시작');
    
    // 현재 이미지에 대한 개별 Alt 텍스트 생성
    const currentImage = ns.originalImages[ns.currentImageIndex];
    if (!currentImage) return;
    
    let altText = generateIndividualAltText(currentImage, ns.currentImageIndex);
    
    // 생성된 alt 텍스트를 이미지 데이터에 저장
    currentImage.generatedAltText = altText;
    
    // 사용자 지정 alt 텍스트가 있으면 우선 사용
    if (currentImage.customAltText && currentImage.customAltText.trim() !== '') {
        altText = currentImage.customAltText;
    }
    
    altInput.value = altText;
    console.log(`Alt 텍스트 자동 생성 완료 (${ns.currentImageIndex + 1}/${ns.originalImages.length}):`, altText);
}

// 개별 이미지의 고유한 Alt 텍스트 생성
function generateIndividualAltText(image, index) {
    const ns = window.FacilityCropperNamespace;
    let altText = '';
    
    // 이미지 순서에 따른 기본 역할 분류
    if (index === 0) {
        altText = '시설 메인 이미지';
    } else {
        const imageTypes = [
            '시설 외관', '시설 내부', '시설 환경', '시설 부대시설', 
            '시설 상세', '시설 추가 정보', '시설 기타'
        ];
        const typeIndex = Math.min(index - 1, imageTypes.length - 1);
        altText = imageTypes[typeIndex];
    }
    
    // 파일명에서 추가 정보 추출
    if (image.name) {
        const fileName = image.name.replace(/\.[^/.]+$/, '').toLowerCase();
        
        // 한글 키워드 인식
        const koreanKeywords = {
            '외관': '시설 외관',
            '내부': '시설 내부', 
            '로비': '시설 로비',
            '복도': '시설 복도',
            '방': '시설 객실',
            '식당': '시설 식당',
            '정원': '시설 정원',
            '주차': '주차장',
            '엘리베이터': '엘리베이터',
            '화장실': '화장실',
            '간호': '간호실',
            '의무': '의무실'
        };
        
        // 영문 키워드 인식
        const englishKeywords = {
            'exterior': '시설 외관',
            'interior': '시설 내부',
            'lobby': '시설 로비', 
            'room': '시설 객실',
            'dining': '시설 식당',
            'garden': '시설 정원',
            'parking': '주차장',
            'elevator': '엘리베이터',
            'bathroom': '화장실',
            'nurse': '간호실',
            'medical': '의무실'
        };
        
        // 키워드 매칭하여 더 구체적인 Alt 텍스트 생성
        let matchedKeyword = null;
        
        for (const [key, value] of Object.entries(koreanKeywords)) {
            if (fileName.includes(key)) {
                matchedKeyword = value;
                break;
            }
        }
        
        if (!matchedKeyword) {
            for (const [key, value] of Object.entries(englishKeywords)) {
                if (fileName.includes(key)) {
                    matchedKeyword = value;
                    break;
                }
            }
        }
        
        if (matchedKeyword) {
            altText = matchedKeyword;
        } else if (fileName.length > 0 && fileName !== 'image') {
            // 특별한 키워드가 없으면 파일명 활용
            const cleanFileName = fileName.replace(/[_-]/g, ' ').trim();
            if (cleanFileName.length > 0) {
                altText += ` - ${cleanFileName}`;
            }
        }
    }
    
    // 이미지 순서 정보 추가 (메인 이미지가 아닌 경우)
    if (index > 0 && ns.originalImages.length > 1) {
        altText += ` (${index + 1}번째 사진)`;
    }
    
    return altText;
}

// ================================================
// 이미지 네비게이션 및 데이터 관리
// ================================================

// 이전 이미지로 이동
function goToPreviousImage() {
    const ns = window.FacilityCropperNamespace;
    
    if (ns.currentImageIndex > 0) {
        saveCurrentImageData(); // 현재 이미지 데이터 저장
        ns.currentImageIndex--;
        loadImageForCrop(ns.currentImageIndex);
        restoreImageData(ns.currentImageIndex); // 이미지 데이터 복원
        updateImageNavigation();
    }
}

// 다음 이미지로 이동
function goToNextImage() {
    const ns = window.FacilityCropperNamespace;
    
    if (ns.currentImageIndex < ns.originalImages.length - 1) {
        saveCurrentImageData(); // 현재 이미지 데이터 저장
        ns.currentImageIndex++;
        loadImageForCrop(ns.currentImageIndex);
        restoreImageData(ns.currentImageIndex); // 이미지 데이터 복원
        updateImageNavigation();
    }
}

// 현재 이미지의 키워드/Alt 텍스트 데이터 저장
function saveCurrentImageData() {
    const ns = window.FacilityCropperNamespace;
    
    if (ns.currentImageIndex >= 0 && ns.originalImages[ns.currentImageIndex]) {
        const currentImage = ns.originalImages[ns.currentImageIndex];
        const seoFileName = document.getElementById('seoFileName');
        const altText = document.getElementById('altText');
        
        if (seoFileName) {
            currentImage.seoFileName = seoFileName.value;
        }
        if (altText) {
            currentImage.altText = altText.value;
        }
        
        // 선택된 키워드들 저장
        const selectedKeywords = Array.from(document.querySelectorAll('.keyword-btn.btn-success'))
            .map(btn => btn.dataset.keyword);
        currentImage.selectedKeywords = selectedKeywords;
        
        console.log(`💾 이미지 ${ns.currentImageIndex + 1} 데이터 저장:`, {
            seoFileName: currentImage.seoFileName,
            altText: currentImage.altText,
            selectedKeywords: currentImage.selectedKeywords
        });
    }
}

// 이미지 데이터 복원
function restoreImageData(index) {
    const ns = window.FacilityCropperNamespace;
    
    if (index >= 0 && ns.originalImages[index]) {
        const currentImage = ns.originalImages[index];
        const seoFileName = document.getElementById('seoFileName');
        const altText = document.getElementById('altText');
        
        // 파일명 복원
        if (seoFileName && currentImage.seoFileName) {
            seoFileName.value = currentImage.seoFileName;
        } else if (seoFileName) {
            seoFileName.value = ''; // 빈 값으로 초기화
        }
        
        // Alt 텍스트 복원
        if (altText && currentImage.altText) {
            altText.value = currentImage.altText;
        } else if (altText) {
            altText.value = ''; // 빈 값으로 초기화
        }
        
        // 키워드 버튼 상태 복원
        resetKeywordButtons();
        if (currentImage.selectedKeywords) {
            currentImage.selectedKeywords.forEach(keyword => {
                const button = document.querySelector(`[data-keyword="${keyword}"]`);
                if (button) {
                    button.classList.remove('btn-outline-primary', 'btn-outline-info', 'btn-outline-success');
                    button.classList.add('btn-success');
                }
            });
        }
        
        console.log(`🔄 이미지 ${index + 1} 데이터 복원 완료`);
    }
}

// 키워드 버튼 상태 초기화
function resetKeywordButtons() {
    document.querySelectorAll('.keyword-btn').forEach(button => {
        button.classList.remove('btn-success');
        if (button.closest('[class*="mb-2"]')?.querySelector('small')?.textContent === '기본') {
            button.classList.add('btn-outline-primary');
        } else if (button.closest('[class*="mb-2"]')?.querySelector('small')?.textContent === '공간') {
            button.classList.add('btn-outline-info');
        } else {
            button.classList.add('btn-outline-success');
        }
    });
}

// 이미지 네비게이션 UI 업데이트
function updateImageNavigation() {
    const ns = window.FacilityCropperNamespace;
    console.log('🔄 네비게이션 업데이트 시작');
    
    const prevBtn = document.getElementById('prevImageBtn');
    const nextAndSaveBtn = document.getElementById('nextAndSaveBtn');
    const saveAndCompleteBtn = document.getElementById('saveAndCompleteBtn');
    const currentImageNumber = document.getElementById('currentImageNumber'); // 상단 배지
    const navigationImageNumber = document.getElementById('navigationImageNumber'); // 하단 네비게이션
    
    // 이전 버튼: 첫 번째 이미지가 아닐 때만 표시
    if (prevBtn) {
        prevBtn.style.display = ns.currentImageIndex > 0 ? 'inline-block' : 'none';
    }
    
    // 저장 후 다음 버튼: 마지막 이미지가 아닐 때만 표시
    if (nextAndSaveBtn) {
        if (ns.currentImageIndex < ns.originalImages.length - 1) {
            nextAndSaveBtn.style.display = 'inline-block';
            nextAndSaveBtn.innerHTML = '<i class="fas fa-save me-1"></i>저장 후 다음<i class="fas fa-chevron-right ms-1"></i>';
        } else {
            nextAndSaveBtn.style.display = 'none';
        }
    }
    
    // 저장 후 완료 버튼: 항상 표시하되 텍스트 변경
    if (saveAndCompleteBtn) {
        if (ns.currentImageIndex === ns.originalImages.length - 1) {
            saveAndCompleteBtn.innerHTML = '<i class="fas fa-check me-2"></i>마지막 이미지 저장 후 완료';
            saveAndCompleteBtn.classList.remove('btn-success');
            saveAndCompleteBtn.classList.add('btn-primary');
        } else {
            saveAndCompleteBtn.innerHTML = '<i class="fas fa-check me-2"></i>저장 후 완료';
            saveAndCompleteBtn.classList.remove('btn-primary');
            saveAndCompleteBtn.classList.add('btn-success');
        }
    }
    
    // 이미지 번호 표시 - 안전하게 체크
    if (!ns.originalImages || ns.originalImages.length === 0) {
        console.warn('⚠️ originalImages가 비어있거나 null입니다');
        return;
    }
    
    const imageCountText = `${ns.currentImageIndex + 1}/${ns.originalImages.length}`;
    const navigationImageCountText = `${ns.currentImageIndex + 1} / ${ns.originalImages.length}`;
    
    if (currentImageNumber) {
        currentImageNumber.textContent = imageCountText;
        console.log('✅ 상단 이미지 번호 업데이트:', imageCountText);
    }
    if (navigationImageNumber) {
        navigationImageNumber.textContent = navigationImageCountText;
        console.log('✅ 하단 이미지 번호 업데이트:', navigationImageCountText);
    }
    
    console.log(`📊 네비게이션 업데이트 완료: ${ns.currentImageIndex + 1}/${ns.originalImages.length}`);
}

// ================================================
// 이미지 목록 및 그리드 관리
// ================================================

// 이미지 리스트 표시
function showImageList() {
    const elements = window.FacilityCropperNamespace.elements;
    const ns = window.FacilityCropperNamespace;
    
    if (!elements.imageListSection || !elements.imageList) return;
    
    if (elements.imageCount) {
        elements.imageCount.textContent = ns.originalImages.length;
    }
    elements.imageList.innerHTML = '';
    
    ns.originalImages.forEach((image, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'col-md-4 col-lg-3';
        imageItem.innerHTML = `
            <div class="card image-item" data-index="${index}">
                <div class="card-img-top position-relative">
                    <img src="${image.dataUrl}" class="img-fluid" style="height: 120px; object-fit: cover;">
                    <div class="position-absolute top-0 end-0 p-1">
                        <span class="badge bg-primary">${index + 1}</span>
                    </div>
                </div>
                <div class="card-body p-2">
                    <h6 class="card-title text-truncate small mb-1">${image.name}</h6>
                    <small class="text-muted">${formatFileSize(image.size)}</small>
                </div>
            </div>
        `;
        
        elements.imageList.appendChild(imageItem);
    });
    
    if (elements.imageListSection) {
        elements.imageListSection.style.display = 'block';
    }
}

// 관리 이미지 그리드 업데이트
function updateManageImagesGrid() {
    const ns = window.FacilityCropperNamespace;
    const manageImagesGrid = document.getElementById('manageImagesGrid');
    if (!manageImagesGrid) {
        console.error('❌ manageImagesGrid 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 중복 호출 방지
    if (window.managingGridUpdate) {
        console.warn('⚠️ 이미 그리드 업데이트 진행 중 - 중복 호출 방지');
        return;
    }
    window.managingGridUpdate = true;
    
    console.log('🔄 관리 이미지 그리드 업데이트 시작');
    
    // 기존 내용 완전 초기화
    manageImagesGrid.innerHTML = '';
    
    // 로딩 표시
    manageImagesGrid.innerHTML = `
        <div class="col-12 text-center">
            <div class="d-flex justify-content-center align-items-center" style="height: 200px;">
                <div class="spinner-border text-primary me-3" role="status">
                    <span class="visually-hidden">로딩 중...</span>
                </div>
                <span class="text-muted">저장된 이미지를 불러오는 중...</span>
            </div>
        </div>
    `;
    
    // 서버에서 저장된 이미지 목록 가져오기
    fetch(`/facility/facility-images/${ns.facilityId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('📋 서버 응답 데이터:', data);
            
            // 다시 한번 완전 초기화
            manageImagesGrid.innerHTML = '';
            
            if (data.success && data.images && data.images.length > 0) {
                const images = data.images;
                console.log(`📋 서버에서 가져온 이미지 수: ${images.length}개`);
                
                // 중복 제거 및 유효성 검증
                const uniqueImages = [];
                const seenIds = new Set();
                const seenPaths = new Set();
                
                images.forEach((image, index) => {
                    // 유효한 이미지 데이터인지 검증
                    if (!image || !image.imageId || !image.imagePath || 
                        image.imagePath.includes('default_facility.jpg') ||
                        image.imagePath === null || image.imagePath === undefined ||
                        image.imagePath.trim() === '') {
                        console.log(`❌ 유효하지 않은 이미지 데이터 제외: ${JSON.stringify(image)}`);
                        return;
                    }
                    
                    if (!seenIds.has(image.imageId) && !seenPaths.has(image.imagePath)) {
                        seenIds.add(image.imageId);
                        seenPaths.add(image.imagePath);
                        uniqueImages.push(image);
                        console.log(`✅ 유니크 이미지 추가: ${image.imageId}`);
                    } else {
                        console.log(`❌ 중복 이미지 제외: ${image.imageId} (이미 존재함)`);
                    }
                });
                
                console.log(`🔧 중복 제거 후 유니크 이미지 수: ${uniqueImages.length}개 (원본: ${images.length}개)`);
                
                // 이미지 그리드 생성
                const gridContainer = document.createElement('div');
                gridContainer.className = 'row g-3';
                
                uniqueImages.forEach((image, index) => {
                    const imageElement = document.createElement('div');
                    imageElement.className = 'col-md-4 col-sm-6 col-12';
                    imageElement.innerHTML = `
                        <div class="card h-100" data-image-id="${image.imageId}">
                            <div class="position-relative">
                                <img src="${image.imagePath}" class="card-img-top" 
                                     style="height: 200px; object-fit: cover;" 
                                     alt="${image.imageAltText || '시설 이미지'}" 
                                     onerror="handleImageError(this, '${image.imageId}')"
                                     data-original-src="${image.imagePath}">
                                
                                <!-- 메인 이미지 배지 -->
                                ${image.isMainImage ? `
                                    <div class="position-absolute top-0 start-0 m-2">
                                        <span class="badge bg-warning text-dark">
                                            <i class="fas fa-star me-1"></i>메인 이미지
                                        </span>
                                    </div>
                                ` : ''}
                                
                                <!-- 관리 버튼 -->
                                <div class="position-absolute top-0 end-0 m-2">
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-light dropdown-toggle" type="button" 
                                                data-bs-toggle="dropdown" aria-expanded="false">
                                            <i class="fas fa-cog"></i>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end">
                                            ${!image.isMainImage ? `
                                                <li>
                                                    <button class="dropdown-item set-main-image-btn" data-image-id="${image.imageId}">
                                                        <i class="fas fa-star text-warning me-2"></i>메인 이미지로 설정
                                                    </button>
                                                </li>
                                            ` : ''}
                                            <li>
                                                <button class="dropdown-item text-danger delete-image-btn" data-image-id="${image.imageId}">
                                                    <i class="fas fa-trash me-2"></i>이미지 삭제
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="card-body">
                                <h6 class="card-title text-truncate">
                                    ${image.imageAltText || `시설 이미지 ${index + 1}`}
                                </h6>
                                <small class="text-success">
                                    <i class="fas fa-check-circle me-1"></i>저장 완료
                                </small>
                                <br>
                                <small class="text-muted">ID: ${image.imageId}</small>
                            </div>
                        </div>
                    `;
                    gridContainer.appendChild(imageElement);
                });
                
                manageImagesGrid.appendChild(gridContainer);
                
                // 안내 메시지 추가
                const infoElement = document.createElement('div');
                infoElement.className = 'col-12 mt-4';
                infoElement.innerHTML = `
                    <div class="alert alert-info">
                        <h6 class="alert-heading">
                            <i class="fas fa-info-circle me-2"></i>이미지 관리 안내
                        </h6>
                        <ul class="mb-0 small">
                            <li>메인 이미지는 시설 목록에서 대표 이미지로 표시됩니다</li>
                            <li>불필요한 이미지는 삭제할 수 있습니다</li>
                            <li>최종 완료 후에는 시설 관리 페이지에서 수정 가능합니다</li>
                            <li>현재 <strong>${uniqueImages.length}장</strong>의 이미지가 등록되어 있습니다</li>
                        </ul>
                    </div>
                `;
                manageImagesGrid.appendChild(infoElement);
                
                // Bootstrap 드롭다운 초기화
                setTimeout(() => {
                    const dropdowns = manageImagesGrid.querySelectorAll('[data-bs-toggle="dropdown"]');
                    console.log(`🔧 Bootstrap 드롭다운 초기화: ${dropdowns.length}개`);
                    
                    dropdowns.forEach((dropdown, index) => {
                        try {
                            if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
                                const instance = new bootstrap.Dropdown(dropdown);
                                console.log(`✅ 드롭다운 ${index + 1} 초기화 성공`);
                            } else {
                                console.warn(`⚠️ Bootstrap을 사용할 수 없어 드롭다운 ${index + 1} 초기화 건너뜀`);
                            }
                        } catch (error) {
                            console.error(`❌ 드롭다운 ${index + 1} 초기화 실패:`, error);
                        }
                    });
                }, 100);
                
            } else {
                // 이미지가 없는 경우
                console.log('이미지가 없습니다:', data);
                manageImagesGrid.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-warning">
                            <h5><i class="fas fa-exclamation-triangle me-2"></i>등록된 이미지가 없습니다</h5>
                            <p class="mb-3">크롭 단계로 돌아가서 이미지를 저장해 주세요.</p>
                            <button type="button" class="btn btn-outline-secondary" onclick="goToCropStep()">
                                <i class="fas fa-arrow-left me-2"></i>크롭 단계로 돌아가기
                            </button>
                        </div>
                    </div>
                `;
            }
            
            // 작업 완료 후 플래그 해제
            window.managingGridUpdate = false;
            console.log('✅ 관리 이미지 그리드 업데이트 완료');
        })
        .catch(error => {
            console.error('❌ 이미지 목록을 가져오는 중 오류:', error);
            manageImagesGrid.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <h6><i class="fas fa-exclamation-triangle me-2"></i>오류 발생</h6>
                        <p class="mb-0">이미지 목록을 불러올 수 없습니다: ${error.message}</p>
                        <button type="button" class="btn btn-outline-primary mt-2" onclick="updateManageImagesGrid()">
                            <i class="fas fa-refresh me-2"></i>다시 시도
                        </button>
                    </div>
                </div>
            `;
            
            // 에러 시에도 플래그 해제
            window.managingGridUpdate = false;
        });
}

// 최종 이미지 그리드 업데이트
function updateFinalImagesGrid() {
    const ns = window.FacilityCropperNamespace;
    const finalImagesGrid = document.getElementById('finalImagesGrid');
    if (!finalImagesGrid) return;
    
    finalImagesGrid.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> 저장된 이미지 목록을 불러오는 중...</div>';
    
    // 서버에서 실제 저장된 이미지 목록을 가져와서 표시
    fetch(`/facility/facility-images/${ns.facilityId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('📋 Final grid - 서버 응답 데이터:', data);
            finalImagesGrid.innerHTML = '';
            
            // API 응답 구조 처리 (wrapped response)
            const images = data.success ? data.images : data;
            
            if (images && images.length > 0) {
                console.log(`📋 Final grid - 이미지 수: ${images.length}개`);
                
                // 유효한 이미지만 필터링
                const validImages = images.filter(image => {
                    if (!image || !image.imageId || !image.imagePath || 
                        image.imagePath.includes('default_facility.jpg') ||
                        image.imagePath === null || image.imagePath === undefined ||
                        image.imagePath.trim() === '') {
                        console.log(`❌ Final grid - 유효하지 않은 이미지 제외: ${JSON.stringify(image)}`);
                        return false;
                    }
                    return true;
                });
                
                console.log(`📋 Final grid - 유효한 이미지 수: ${validImages.length}개 (원본: ${images.length}개)`);
                
                validImages.forEach((image, index) => {
                    const imageElement = document.createElement('div');
                    imageElement.className = 'col-md-3 col-sm-4 col-6 mb-3';
                    imageElement.innerHTML = `
                        <div class="card" data-image-id="${image.imageId}">
                            <div class="position-relative">
                                <img src="${image.imagePath}" class="card-img-top" style="height: 120px; object-fit: cover;" 
                                     alt="${image.imageAltText || '시설 이미지'}" onerror="handleImageError(this, ${image.imageId})"
                                <div class="position-absolute top-0 end-0 p-1">
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-light dropdown-toggle" type="button" 
                                                data-bs-toggle="dropdown" aria-expanded="false">
                                            <i class="fas fa-cog"></i>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end">
                                            ${!image.isMainImage ? `
                                                <li><button class="dropdown-item set-main-image-btn" data-image-id="${image.imageId}">
                                                    <i class="fas fa-star text-warning me-2"></i>메인 이미지로 설정
                                                </button></li>
                                            ` : ''}
                                            <li><button class="dropdown-item text-danger delete-image-btn" data-image-id="${image.imageId}">
                                                <i class="fas fa-trash me-2"></i>이미지 삭제
                                            </button></li>
                                        </ul>
                                    </div>
                                </div>
                                ${image.isMainImage ? '<div class="position-absolute top-0 start-0 p-1"><span class="badge bg-primary"><i class="fas fa-star me-1"></i>메인</span></div>' : ''}
                            </div>
                            <div class="card-body p-2">
                                <small class="text-success">
                                    <i class="fas fa-check-circle me-1"></i>저장 완료 (ID: ${image.imageId})
                                </small>
                                <br>
                                <small class="text-muted">${image.imageAltText || '시설 이미지'}</small>
                            </div>
                        </div>
                    `;
                    finalImagesGrid.appendChild(imageElement);
                });
                
                console.log(`✅ Final grid - 렌더링된 유효 이미지 수: ${validImages.length}개`);
                
                // Bootstrap 드롭다운 초기화 (동적으로 생성된 요소들을 위해)
                setTimeout(() => {
                    const dropdowns = finalImagesGrid.querySelectorAll('[data-bs-toggle="dropdown"]');
                    dropdowns.forEach(dropdown => {
                        // Bootstrap 5 드롭다운 초기화
                        if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
                            new bootstrap.Dropdown(dropdown);
                        }
                    });
                    console.log(`🔧 Bootstrap 드롭다운 초기화 완료: ${dropdowns.length}개`);
                }, 100);
                
                // 추가 정보 표시
                const infoElement = document.createElement('div');
                infoElement.className = 'col-12 mt-3';
                infoElement.innerHTML = `
                    <div class="alert alert-success">
                        <h6><i class="fas fa-database me-2"></i>데이터베이스 저장 확인</h6>
                        <p class="mb-0">✅ 총 <strong>${validImages.length}장</strong>의 이미지가 성공적으로 저장되었습니다.</p>
                        <small class="text-muted">이미지는 /uploads/facility/ 디렉토리에 저장되고, facility_images 테이블에 등록됩니다.</small>
                    </div>
                `;
                finalImagesGrid.appendChild(infoElement);
                
            } else {
                console.log(`⚠️ Final grid - 표시할 유효한 이미지가 없음`);
                finalImagesGrid.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            아직 등록된 시설 이미지가 없습니다.
                            <br>
                            <small class="text-muted">이미지를 업로드하여 시설을 홍보해보세요!</small>
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('❌ 저장된 이미지 목록을 가져오는 중 오류:', error);
            finalImagesGrid.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        <h6><i class="fas fa-info-circle me-2"></i>로컬 이미지 표시</h6>
                        <p class="mb-2">서버 이미지 목록을 가져올 수 없어 로컬 크롭된 이미지를 표시합니다:</p>
                        <div class="row" id="localImages"></div>
                    </div>
                </div>
            `;
            
            // 로컬 이미지로 폴백
            const localContainer = document.getElementById('localImages');
            ns.croppedImages.forEach((image, index) => {
                if (image && image.croppedDataUrl) {
                    const imageElement = document.createElement('div');
                    imageElement.className = 'col-md-3 col-sm-4 col-6 mb-3';
                    imageElement.innerHTML = `
                        <div class="card">
                            <img src="${image.croppedDataUrl}" class="card-img-top" style="height: 120px; object-fit: cover;">
                            <div class="card-body p-2">
                                <small class="text-muted">크롭된 이미지 ${index + 1}</small>
                            </div>
                        </div>
                    `;
                    localContainer.appendChild(imageElement);
                }
            });
        });
}

// ================================================
// 드래그 앤 드롭 및 키보드 단축키
// ================================================

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
    const elements = window.FacilityCropperNamespace.elements;
    const uploadArea = elements.uploadArea;
    if (!uploadArea) return;
    
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    
    // 업로드 영역 클릭 시 파일 선택
    uploadArea.addEventListener('click', (event) => {
        if (!event.target.closest('#mainFileSelectBtn')) {
            console.log('🖱️ 업로드 영역 클릭됨');
            if (elements.imageInput) {
                elements.imageInput.click();
            }
        }
    });
    
    console.log('🎯 드래그 앤 드롭 설정 완료');
}

// 드래그 오버 처리
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#0d6efd';
    event.currentTarget.style.backgroundColor = '#f8f9ff';
}

// 드롭 처리
function handleDrop(event) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
        console.log(`🎯 드롭된 파일 수: ${files.length}`);
        // 파일 입력 이벤트와 동일한 처리
        const elements = window.FacilityCropperNamespace.elements;
        elements.imageInput.files = event.dataTransfer.files;
        handleImageUpload({ target: { files: event.dataTransfer.files } });
    }
    
    // 스타일 리셋
    event.currentTarget.style.borderColor = '';
    event.currentTarget.style.backgroundColor = '';
}

// 키보드 단축키 설정
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // 입력 필드에서는 단축키 비활성화
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const elements = window.FacilityCropperNamespace.elements;
        
        switch (event.key) {
            case '+':
            case '=':
                event.preventDefault();
                zoomCropper(0.1);
                break;
                
            case '-':
                event.preventDefault();
                zoomCropper(-0.1);
                break;
                
            case 'r':
            case 'R':
                event.preventDefault();
                rotateCropper(90);
                break;
                
            case 'l':
            case 'L':
                event.preventDefault();
                rotateCropper(-90);
                break;
                
            case 'Enter':
                event.preventDefault();
                if (elements.buttons.cropCurrent && !elements.buttons.cropCurrent.disabled) {
                    cropCurrentImage();
                }
                break;
                
            case 'Escape':
                event.preventDefault();
                resetCropper();
                break;
                
            case 'ArrowLeft':
                event.preventDefault();
                if (elements.buttons.prevImage && elements.buttons.prevImage.style.display !== 'none') {
                    goToPreviousImage();
                }
                break;
                
            case 'ArrowRight':
                event.preventDefault();
                if (elements.buttons.nextImage && elements.buttons.nextImage.style.display !== 'none') {
                    goToNextImage();
                }
                break;
        }
    });
    
    console.log('⌨️ 키보드 단축키 설정 완료');
}

// ================================================
// 유틸리티 함수들
// ================================================

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 크롭퍼 줌
function zoomCropper(ratio) {
    const ns = window.FacilityCropperNamespace;
    if (!ns.cropper) return;
    ns.cropper.zoom(ratio);
}

// 크롭퍼 회전
function rotateCropper(degree) {
    const ns = window.FacilityCropperNamespace;
    if (!ns.cropper) return;
    ns.cropper.rotate(degree);
}

// 크롭퍼 리셋
function resetCropper() {
    const ns = window.FacilityCropperNamespace;
    if (!ns.cropper) return;
    ns.cropper.reset();
}

// 버튼 로딩 상태 설정
function setButtonLoading(button, isLoading, loadingText = '처리 중...') {
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        button.setAttribute('data-original-text', button.innerHTML);
        button.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i>${loadingText}`;
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.innerHTML = originalText;
        }
    }
}

// 이미지 로드 에러 처리 함수
function handleImageError(imgElement, imageId) {
    console.warn(`⚠️ 이미지 로드 실패: ${imageId}, 원본 경로: ${imgElement.dataset.originalSrc || imgElement.src}`);
    
    // 이미 에러 처리되었는지 확인
    if (imgElement.classList.contains('error-handled')) {
        console.log('이미 에러 처리된 이미지입니다.');
        return;
    }
    
    // 에러 처리 완료 표시
    imgElement.classList.add('error-handled');
    
    // 기본 이미지로 교체하지 않고 플레이스홀더 표시
    imgElement.style.display = 'none';
    
    // 부모 컨테이너에 플레이스홀더 추가
    const placeholder = document.createElement('div');
    placeholder.className = 'bg-light rounded d-flex align-items-center justify-content-center';
    placeholder.style.cssText = 'height: 200px; background-color: #f8f9fa;';
    placeholder.innerHTML = `
        <div class="text-center text-muted">
            <i class="fas fa-image fa-3x mb-2"></i>
            <br>
            <small>이미지를 불러올 수 없습니다</small>
        </div>
    `;
    
    // 이미지 대신 플레이스홀더 삽입
    imgElement.parentNode.insertBefore(placeholder, imgElement);
    
    console.log(`✅ 이미지 ${imageId}에 대한 플레이스홀더 처리 완료`);
}

// ================================================
// 폴더 선택 모듈과 연동
// ================================================

// 폴더에서 선택된 이미지 처리 (facility-folder-selection.js에서 호출됨)
window.handleSelectedImages = function(selectedImages) {
    console.log('📂 폴더에서 선택된 이미지 처리:', selectedImages.length + '장');
    const ns = window.FacilityCropperNamespace;
    
    if (!selectedImages || selectedImages.length === 0) {
        console.warn('선택된 이미지가 없습니다');
        return;
    }
    
    // 최대 5장 제한
    if (selectedImages.length > 5) {
        alert('최대 5장까지만 등록할 수 있습니다.');
        return;
    }
    
    // 기존 이미지와 병합하거나 새로 시작
    if (ns.originalImages.length === 0) {
        // 처음 선택하는 경우
        ns.originalImages = [];
        ns.croppedImages = [];
        ns.currentImageIndex = 0;
    } else {
        // 추가 선택하는 경우 - 기존 이미지와 병합
        if (ns.originalImages.length + selectedImages.length > 5) {
            alert(`현재 ${ns.originalImages.length}장이 선택되어 있습니다. 최대 ${5 - ns.originalImages.length}장만 더 추가할 수 있습니다.`);
            const allowedCount = 5 - ns.originalImages.length;
            selectedImages = selectedImages.slice(0, allowedCount);
        }
    }
    
    // 선택된 이미지들을 originalImages에 추가
    selectedImages.forEach((imageData, index) => {
        const file = imageData.file;
        const dataUrl = imageData.dataUrl;
        
        const imageInfo = {
            id: ns.originalImages.length + index,
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: dataUrl,
            originalFile: file,
            seoFileName: '',
            altText: '',
            selectedKeywords: [],
            processed: false,
            imageOrder: ns.originalImages.length + index
        };
        
        ns.originalImages.push(imageInfo);
        console.log(`✅ 이미지 추가: ${file.name}`);
    });
    
    // UI 업데이트
    showImageList();
    
    console.log(`✅ 폴더 이미지 처리 완료: 총 ${ns.originalImages.length}장`);
};

// ================================================
// 페이지 언로드 시 정리 및 전역 함수 노출
// ================================================

// 키워드 클릭 함수를 전역으로 노출 (HTML onclick에서 사용)
window.handleKeywordClick = function(keyword, button) {
    console.log('🏷️ 키워드 클릭:', keyword);
    
    // 버튼 상태 토글
    if (button.classList.contains('btn-success')) {
        // 선택 해제
        button.classList.remove('btn-success');
        if (button.closest('[class*="mb-2"]')?.querySelector('small')?.textContent === '기본') {
            button.classList.add('btn-outline-primary');
        } else if (button.closest('[class*="mb-2"]')?.querySelector('small')?.textContent === '공간') {
            button.classList.add('btn-outline-info');
        } else {
            button.classList.add('btn-outline-success');
        }
        console.log(`❌ 키워드 선택 해제: ${keyword}`);
    } else {
        // 선택
        button.classList.remove('btn-outline-primary', 'btn-outline-info', 'btn-outline-success');
        button.classList.add('btn-success');
        console.log(`✅ 키워드 선택: ${keyword}`);
    }
};

// 전역 함수 노출 (HTML에서 직접 호출 가능)
window.goToNextImage = goToNextImage;
window.goToPreviousImage = goToPreviousImage;
window.saveCurrentAndGoNext = saveCurrentAndGoNext;
window.saveCurrentAndComplete = saveCurrentAndComplete;
window.goToCropStep = goToCropStep;
window.goToManageStep = goToManageStep;
window.updateManageImagesGrid = updateManageImagesGrid;

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    const ns = window.FacilityCropperNamespace;
    if (ns.cropper) {
        ns.cropper.destroy();
    }
});

console.log('📋 facility-image-cropper-unified.js 로드 완료 - 통합 버전');