/**
 * 시설 이미지 크롭 전용 JavaScript (프로필 방식 완전 적용)
 * 프로필 이미지 업로드의 모든 기능을 다중 이미지 + 16:9 비율로 적용
 * 누락 기능: Alt 텍스트 자동 생성, AVIF/WebP 지원 확인, 로딩 상태 관리
 */

// 전역 변수 (프로필과 동일)
let cropper = null;
let originalImages = [];
let croppedImages = [];
let currentImageIndex = 0;
let facilityId = null;

// DOM 요소들 (프로필과 동일 구조)
const elements = {};

// 포맷 지원 확인 (프로필에서 누락된 기능)
let formatSupport = {
    avif: false,
    webp: false
};

// 초기화 (프로필과 동일)
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 시설 이미지 크롭퍼 초기화 시작 (프로필 방식 완전 적용)');
    
    // URL에서 시설 ID 추출
    const pathParts = window.location.pathname.split('/');
    facilityId = pathParts[pathParts.length - 1];
    console.log('🏢 시설 ID:', facilityId);
    
    // 프로필과 동일한 초기화 순서
    checkFormatSupport();
    initializeElements();
    setupEventListeners();
    setupDragAndDrop();
    
    console.log('✅ 시설 이미지 크롭퍼 초기화 완료');
});

// 포맷 지원 확인 (프로필에서 누락된 기능 추가)
function checkFormatSupport() {
    console.log('🔍 브라우저 이미지 포맷 지원 확인');
    
    // AVIF 지원 확인
    const avifCanvas = document.createElement('canvas');
    avifCanvas.width = 1;
    avifCanvas.height = 1;
    formatSupport.avif = avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    
    // WebP 지원 확인  
    const webpCanvas = document.createElement('canvas');
    webpCanvas.width = 1;
    webpCanvas.height = 1;
    formatSupport.webp = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    console.log('📊 포맷 지원 현황:', formatSupport);
    
    // 지원되지 않는 포맷 숨기기
    if (!formatSupport.avif) {
        const avifOption = document.getElementById('formatAVIF');
        const avifLabel = document.querySelector('label[for="formatAVIF"]');
        if (avifOption && avifLabel) {
            avifOption.style.display = 'none';
            avifLabel.style.display = 'none';
            console.log('⚠️ AVIF 미지원으로 옵션 숨김');
        }
    }
    
    if (!formatSupport.webp) {
        const webpOption = document.getElementById('formatWEBP');
        const webpLabel = document.querySelector('label[for="formatWEBP"]');
        if (webpOption && webpLabel) {
            webpOption.style.display = 'none';
            webpLabel.style.display = 'none';
            console.log('⚠️ WebP 미지원으로 옵션 숨김');
        }
    }
}

// DOM 요소 초기화 (프로필과 동일)
function initializeElements() {
    console.log('🔍 DOM 요소 초기화 시작');
    
    // 기본 요소들
    elements.imageInput = document.getElementById('imageInput');
    elements.uploadSection = document.getElementById('uploadSection');
    elements.cropSection = document.getElementById('cropSection');
    elements.compressionSection = document.getElementById('compressionSection');
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
    
    // 줌 표시기 (프로필과 동일)
    elements.zoomIndicator = document.getElementById('zoomIndicator');
    elements.zoomLevel = document.getElementById('zoomLevel');
    elements.zoomStatus = document.getElementById('zoomStatus');
    
    // 단계 표시기
    elements.steps = {
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        step3: document.getElementById('step3'),
        step4: document.getElementById('step4')
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
        reset: document.getElementById('resetBtn')
    };
    
    console.log('✅ DOM 요소 초기화 완료');
}

// 이벤트 리스너 설정 (프로필과 동일 패턴)
function setupEventListeners() {
    console.log('🔗 이벤트 리스너 설정 시작');
    
    // 파일 입력 이벤트 (프로필과 동일)
    if (elements.imageInput) {
        elements.imageInput.removeEventListener('change', handleImageUpload);
        elements.imageInput.addEventListener('change', handleImageUpload);
        console.log('📁 파일 입력 이벤트 리스너 등록됨');
    }
    
    // 파일 선택 버튼 (프로필 방식 - 직접 참조)
    const fileSelectBtn = document.getElementById('fileSelectBtn');
    if (fileSelectBtn) {
        fileSelectBtn.addEventListener('click', () => {
            console.log('📁 파일 선택 버튼 클릭됨');
            if (elements.imageInput) {
                elements.imageInput.click();
            } else {
                console.error('❌ imageInput 요소를 찾을 수 없습니다.');
            }
        });
        console.log('✅ 파일 선택 버튼 이벤트 등록 완료');
    } else {
        console.error('❌ fileSelectBtn 요소를 찾을 수 없습니다.');
    }
    
    // 크롭 컨트롤 버튼들 (프로필과 동일)
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
    
    // 압축 단계 버튼들
    const backToCropBtn = document.getElementById('backToCropBtn');
    if (backToCropBtn) {
        backToCropBtn.addEventListener('click', () => {
            console.log('🔙 크롭 단계로 돌아가기');
            goToCropStep();
        });
    }
    
    const saveAllImagesBtn = document.getElementById('saveAllImagesBtn');
    if (saveAllImagesBtn) {
        saveAllImagesBtn.addEventListener('click', () => {
            console.log('💾 모든 이미지 저장 시작');
            saveAllImages();
        });
    }
    
    // 완료 단계 버튼들
    const addMoreImagesBtn = document.getElementById('addMoreImagesBtn');
    if (addMoreImagesBtn) {
        addMoreImagesBtn.addEventListener('click', () => {
            console.log('➕ 이미지 더 추가 버튼 클릭');
            goToUploadStep();
        });
    }
    
    // 압축 설정 컨트롤 설정
    setupCompressionControls();
    
    // 키보드 단축키 (프로필과 동일)
    setupKeyboardShortcuts();
    
    console.log('✅ 이벤트 리스너 설정 완료');
}

// 압축 설정 컨트롤 (프로필에서 누락된 기능)
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
    
    // Alt 텍스트 자동 생성 버튼 (프로필에서 누락된 기능 추가)
    const autoGenerateAltBtn = document.getElementById('autoGenerateAltBtn');
    if (autoGenerateAltBtn) {
        autoGenerateAltBtn.addEventListener('click', generateAltText);
        console.log('✨ Alt 텍스트 자동 생성 버튼 등록됨');
    }
    
    console.log('⚙️ 압축 컨트롤 설정 완료');
}

// 이미지 업로드 처리 (프로필과 동일하되 다중 파일 지원)
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
    
    // 프로필과 동일한 파일 검증
    const validFiles = files.filter(file => validateImageFile(file));
    if (validFiles.length === 0) {
        alert('유효한 이미지 파일이 없습니다.');
        return;
    }
    
    if (validFiles.length !== files.length) {
        alert(`${files.length - validFiles.length}개 파일이 형식 오류로 제외되었습니다.`);
    }
    
    // 기존 이미지 초기화
    originalImages = [];
    croppedImages = [];
    currentImageIndex = 0;
    
    // 프로필 방식: 순차적 파일 처리
    processFilesSequentially(validFiles);
}

// 이미지 파일 검증 (프로필과 동일)
function validateImageFile(file) {
    console.log(`🔍 파일 검증: ${file.name}`);
    
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
        console.error(`❌ 이미지 파일이 아님: ${file.name}`);
        return false;
    }
    
    // 지원되는 형식 검증 (프로필과 동일)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        console.error(`❌ 지원되지 않는 형식: ${file.name} (${file.type})`);
        return false;
    }
    
    // 파일 크기 검증 (프로필과 동일 - 5MB)
    if (file.size > 5 * 1024 * 1024) {
        console.error(`❌ 파일 크기 초과: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        return false;
    }
    
    console.log(`✅ 파일 검증 통과: ${file.name}`);
    return true;
}

// 순차적 파일 처리 (프로필 방식 적용)
function processFilesSequentially(files) {
    let processedCount = 0;
    
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
                originalFile: file
            };
            
            originalImages.push(imageData);
            processedCount++;
            
            console.log(`✅ 이미지 로드 완료: ${file.name} (${processedCount}/${files.length})`);
            
            // 모든 파일 처리 완료 시 (프로필과 동일한 순서)
            if (processedCount === files.length) {
                console.log('🎉 모든 이미지 로드 완료 - 크롭 단계로 이동');
                
                showImageList();
                loadImageToCropper(originalImages[0]);
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

// 이미지를 크롭퍼에 로드 (프로필과 동일)
function loadImageToCropper(imageData) {
    if (!imageData || !elements.cropImage) {
        console.error('❌ loadImageToCropper: 이미지 데이터 또는 cropImage 요소가 없습니다.');
        return;
    }
    
    console.log(`🖼️ 크롭퍼에 이미지 로드: ${imageData.name}`);
    
    // 현재 이미지 정보 업데이트
    updateCurrentImageInfo();
    
    elements.cropImage.src = imageData.dataUrl;
    elements.cropImage.style.display = 'block';
    
    // 프로필 방식: 이미지 로드 후 크롭퍼 초기화
    elements.cropImage.onload = function() {
        console.log('✅ 이미지 로드 완료, 크롭퍼 초기화 시작');
        setTimeout(() => {
            initializeCropper();
            updateImageDimensions();
        }, 100);
    };
}

// 현재 이미지 정보 업데이트
function updateCurrentImageInfo() {
    if (!originalImages.length) return;
    
    // 현재 이미지 번호 업데이트
    if (elements.currentImageNumber) {
        elements.currentImageNumber.textContent = `${currentImageIndex + 1}/${originalImages.length}`;
    }
    
    // 파일명 업데이트
    if (elements.imageFileName) {
        elements.imageFileName.textContent = originalImages[currentImageIndex]?.name || '';
    }
    
    // 네비게이션 버튼 표시/숨김
    if (elements.buttons.prevImage) {
        elements.buttons.prevImage.style.display = currentImageIndex > 0 ? 'inline-block' : 'none';
    }
    if (elements.buttons.nextImage) {
        elements.buttons.nextImage.style.display = currentImageIndex < originalImages.length - 1 ? 'inline-block' : 'none';
    }
}

// 크롭퍼 초기화 (16:9 비율, 프로필과 동일한 패턴)
function initializeCropper() {
    if (!elements.cropImage) {
        console.error('❌ cropImage 요소를 찾을 수 없습니다.');
        return;
    }
    
    console.log('🔧 크롭퍼 초기화 - 16:9 비율 (프로필 방식)');
    
    // 기존 크롭퍼 정리
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    
    cropper = new Cropper(elements.cropImage, {
        aspectRatio: 16 / 9, // 시설 사진은 16:9 비율 (프로필과 유일한 차이점)
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
            // 프로필과 동일: 크롭퍼 준비 완료 후 스마트 스크롤 설정
            setTimeout(() => {
                setupSmartScroll();
            }, 100);
        },
        crop: updatePreview
    });
}

// 스마트 스크롤 기능 (프로필과 정확히 동일)
function setupSmartScroll() {
    if (!cropper || !elements.cropImage) return;
    
    const cropContainer = elements.cropImage.parentElement;
    if (!cropContainer) return;
    
    // 최대/최소 줌 레벨 설정 (프로필과 정확히 동일)
    const MIN_ZOOM = 0.1;  // 최소 줌 (10%)
    const MAX_ZOOM = 3.0;  // 최대 줌 (300%)
    
    console.log('🖱️ 스마트 스크롤 기능 활성화');
    
    cropContainer.addEventListener('wheel', function(event) {
        if (!cropper) return;
        
        // 현재 줌 레벨 확인 (프로필과 정확히 동일한 방식)
        const canvasData = cropper.getCanvasData();
        const containerData = cropper.getContainerData();
        const currentZoom = canvasData.naturalWidth > 0 ? canvasData.width / canvasData.naturalWidth : 1;
        
        const isZoomingIn = event.deltaY < 0;  // 휠을 위로 올리면 확대
        const isZoomingOut = event.deltaY > 0; // 휠을 아래로 내리면 축소
        
        console.log('🔍 현재 줌:', currentZoom.toFixed(2), '방향:', isZoomingIn ? '확대' : '축소');
        
        // 프로필과 정확히 동일한 임계값 설정
        const maxThreshold = 2.8;  // 조금 더 낮은 최대값
        const minThreshold = 0.2;  // 조금 더 높은 최소값
        
        // 확대 시: 최대 줌 근처에서 페이지 스크롤 허용
        if (isZoomingIn && currentZoom >= maxThreshold) {
            updateZoomIndicator(currentZoom, '최대 확대');
            console.log('📈 최대 확대 근처 - 페이지 스크롤 실행');
            
            // 페이지 스크롤을 더 부드럽게 실행 (프로필과 정확히 동일)
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
            
            // 페이지 스크롤을 더 부드럽게 실행 (프로필과 정확히 동일)
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
        cropper.zoom(zoomDelta);
        
        // 줌 표시기 업데이트
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + zoomDelta));
        updateZoomIndicator(newZoom, isZoomingIn ? '확대' : '축소');
        
    }, { passive: false }); // passive: false로 설정해야 preventDefault 작동
}

// 줌 표시기 업데이트 (프로필과 정확히 동일)
function updateZoomIndicator(zoomLevel, status) {
    if (!elements.zoomIndicator || !elements.zoomLevel || !elements.zoomStatus) return;
    
    // 줌 레벨을 퍼센트로 표시 (프로필과 동일)
    const zoomPercent = Math.round(zoomLevel * 100);
    elements.zoomLevel.textContent = zoomPercent + '%';
    
    // 상태 메시지 업데이트 (프로필과 동일)
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
    
    // 줌 표시기 보이기 (프로필과 동일)
    elements.zoomIndicator.style.display = 'block';
    
    // 3초 후 자동 숨김 (프로필과 동일)
    clearTimeout(window.zoomIndicatorTimeout);
    window.zoomIndicatorTimeout = setTimeout(() => {
        if (elements.zoomIndicator) {
            elements.zoomIndicator.style.display = 'none';
        }
    }, 3000);
}

// 미리보기 업데이트 (16:9 비율)
function updatePreview() {
    if (!cropper || !elements.previewCanvas) return;
    
    console.log('🖼️ 미리보기 업데이트 시작');
    
    // 크롭된 이미지를 캔버스에 그리기 (16:9 비율)
    const canvas = cropper.getCroppedCanvas({
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
    if (!cropper || !elements.imageDimensions) return;
    
    const imageData = cropper.getImageData();
    elements.imageDimensions.textContent = `${Math.round(imageData.naturalWidth)} × ${Math.round(imageData.naturalHeight)}`;
}

// 현재 이미지 크롭 (프로필 방식 + 로딩 상태)
function cropCurrentImage() {
    if (!cropper) {
        alert('크롭퍼가 초기화되지 않았습니다.');
        return;
    }
    
    console.log(`🔄 이미지 크롭 중: ${currentImageIndex + 1}/${originalImages.length}`);
    
    // 프로필과 동일한 버튼 로딩 상태 설정
    const cropBtn = elements.buttons.cropCurrent;
    setButtonLoading(cropBtn, true, '크롭 중...');
    
    try {
        // 크롭된 이미지 생성 (16:9 비율)
        const canvas = cropper.getCroppedCanvas({
            width: 800,
            height: 450, // 16:9 비율
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        if (canvas) {
            const croppedImageData = canvas.toDataURL('image/jpeg', 0.9);
            
            // 크롭된 이미지 저장
            croppedImages[currentImageIndex] = {
                ...originalImages[currentImageIndex],
                croppedDataUrl: croppedImageData,
                isCropped: true
            };
            
            console.log(`✅ 이미지 크롭 완료: ${currentImageIndex + 1}`);
            
            // 다음 이미지로 자동 이동 또는 압축 단계로
            setTimeout(() => {
                setButtonLoading(cropBtn, false);
                
                if (currentImageIndex < originalImages.length - 1) {
                    // 다음 이미지가 있으면 이동
                    goToNextImage();
                } else {
                    // 모든 이미지 크롭 완료 시 압축 단계로 이동
                    console.log('🎉 모든 이미지 크롭 완료 - 압축 단계로 이동');
                    goToCompressionStep();
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

// 압축 단계로 이동
function goToCompressionStep() {
    hideAllSections();
    if (elements.compressionSection) {
        elements.compressionSection.style.display = 'block';
        console.log('📦 압축 단계 표시 완료');
    }
    updateStepIndicator(3);
    
    // 크롭된 이미지들을 압축 미리보기에 표시
    updateCompressionPreview();
    
    // Alt 텍스트 자동 생성 (프로필에서 누락된 기능)
    generateAltText();
}

// 압축 미리보기 업데이트 (실시간 반영)
function updateCompressionPreview() {
    const finalPreviewImage = document.getElementById('finalPreviewImage');
    const compressionSavings = document.getElementById('compressionSavings');
    const currentFormat = document.getElementById('currentFormat');
    
    if (!finalPreviewImage || croppedImages.length === 0) return;
    
    // 첫 번째 크롭된 이미지를 미리보기로 표시
    const firstCroppedImage = croppedImages.find(img => img && img.croppedDataUrl);
    if (!firstCroppedImage) return;
    
    // 현재 설정 가져오기
    const qualitySlider = document.getElementById('qualitySlider');
    const quality = qualitySlider ? parseFloat(qualitySlider.value) : 0.8;
    
    const formatRadios = document.querySelectorAll('input[name="imageFormat"]:checked');
    let format = formatRadios.length > 0 ? formatRadios[0].value : 'jpeg';
    
    // 브라우저 지원 확인 후 폴백 (프로필에서 누락된 기능)
    if (format === 'avif' && !formatSupport.avif) {
        console.log('⚠️ AVIF 미지원으로 WebP로 폴백');
        format = formatSupport.webp ? 'webp' : 'jpeg';
        
        // UI에서 지원되는 형식으로 자동 변경
        const fallbackRadio = document.getElementById(formatSupport.webp ? 'formatWEBP' : 'formatJPEG');
        if (fallbackRadio) {
            fallbackRadio.checked = true;
        }
    }
    
    if (format === 'webp' && !formatSupport.webp) {
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

// Alt 텍스트 자동 생성 (프로필에서 누락된 기능 추가)
function generateAltText() {
    const altInput = document.getElementById('altTextInput');
    if (!altInput) return;
    
    console.log('✨ Alt 텍스트 자동 생성 시작');
    
    // 시설 이미지용 기본 Alt 텍스트 생성
    let altText = '시설 대표 이미지';
    
    // 파일명에서 추가 정보 추출 (프로필과 동일한 로직)
    if (originalImages.length > 0 && originalImages[0].name) {
        const fileName = originalImages[0].name.replace(/\.[^/.]+$/, ''); // 확장자 제거
        if (fileName.length > 0 && fileName !== 'image') {
            altText += ` - ${fileName}`;
        }
    }
    
    // 다중 이미지인 경우 추가 정보
    if (originalImages.length > 1) {
        altText += ` (${originalImages.length}장)`;
    }
    
    altInput.value = altText;
    console.log('Alt 텍스트 자동 생성 완료:', altText);
}

// 모든 이미지 저장 기능 (프로필과 동일한 패턴)
function saveAllImages() {
    if (croppedImages.length === 0) {
        alert('저장할 이미지가 없습니다.');
        return;
    }
    
    console.log('📤 시설 이미지 서버 저장 시작');
    const saveBtn = document.getElementById('saveAllImagesBtn');
    setButtonLoading(saveBtn, true, '저장 중...');
    
    // Alt 텍스트 가져오기
    const altTextInput = document.getElementById('altTextInput');
    const altText = altTextInput ? altTextInput.value.trim() : '';
    
    // 압축 설정 가져오기
    const qualitySlider = document.getElementById('qualitySlider');
    const quality = qualitySlider ? parseFloat(qualitySlider.value) : 0.8;
    
    const formatRadios = document.querySelectorAll('input[name="imageFormat"]:checked');
    let format = formatRadios.length > 0 ? formatRadios[0].value : 'jpeg';
    
    // 브라우저 지원 확인 후 폴백
    if (format === 'avif' && !formatSupport.avif) {
        format = formatSupport.webp ? 'webp' : 'jpeg';
    }
    if (format === 'webp' && !formatSupport.webp) {
        format = 'jpeg';
    }
    
    // FormData 생성 (프로필과 동일한 방식)
    const formData = new FormData();
    formData.append('facilityId', facilityId);
    formData.append('altText', altText);
    formData.append('quality', quality);
    formData.append('format', format);
    
    // 크롭된 이미지들 추가
    croppedImages.forEach((image, index) => {
        if (image && image.croppedDataUrl) {
            formData.append(`croppedImage_${index}`, image.croppedDataUrl);
            formData.append(`originalName_${index}`, image.name);
        }
    });
    
    console.log(`📸 전송할 이미지 수: ${croppedImages.filter(img => img && img.croppedDataUrl).length}`);
    
    // 서버에 저장 요청 (프로필과 동일한 패턴)
    fetch(`/facility/crop-images/${facilityId}/save`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('📡 서버 응답 상태:', response.status);
        return response.json();
    })
    .then(data => {
        setButtonLoading(saveBtn, false);
        console.log('📥 서버 응답 데이터:', data);
        
        if (data.success) {
            console.log('✅ 시설 이미지 저장 성공');
            goToCompleteStep();
            
            // 성공 메시지 표시 (프로필과 동일)
            setTimeout(() => {
                alert('시설 이미지가 성공적으로 저장되었습니다!');
            }, 500);
            
        } else {
            console.error('❌ 저장 실패:', data.message);
            alert(data.message || '이미지 저장에 실패했습니다.');
        }
    })
    .catch(error => {
        setButtonLoading(saveBtn, false);
        console.error('🚨 저장 오류:', error);
        alert('이미지 저장 중 오류가 발생했습니다.');
    });
}

// 단계 이동 함수들 (프로필과 동일)
function goToUploadStep() {
    hideAllSections();
    if (elements.uploadSection) elements.uploadSection.style.display = 'block';
    updateStepIndicator(1);
    
    // 초기화 (프로필과 동일)
    if (elements.imageInput) elements.imageInput.value = '';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    originalImages = [];
    croppedImages = [];
    currentImageIndex = 0;
}

function goToCropStep() {
    hideAllSections();
    if (elements.cropSection) elements.cropSection.style.display = 'block';
    updateStepIndicator(2);
}

function goToCompleteStep() {
    hideAllSections();
    if (elements.completeSection) {
        elements.completeSection.style.display = 'block';
        console.log('🎆 완료 단계 표시');
    }
    updateStepIndicator(4);
    
    // 완료된 이미지들 표시
    updateFinalImagesGrid();
}

// 모든 섹션 숨기기 (프로필과 동일)
function hideAllSections() {
    const sections = ['uploadSection', 'cropSection', 'compressionSection', 'completeSection'];
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

// 단계 표시기 업데이트 (프로필과 동일)
function updateStepIndicator(currentStep) {
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

// 이미지 리스트 표시
function showImageList() {
    if (!elements.imageListSection || !elements.imageList) return;
    
    if (elements.imageCount) {
        elements.imageCount.textContent = originalImages.length;
    }
    elements.imageList.innerHTML = '';
    
    originalImages.forEach((image, index) => {
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

// 최종 이미지 그리드 업데이트
function updateFinalImagesGrid() {
    const finalImagesGrid = document.getElementById('finalImagesGrid');
    if (!finalImagesGrid) return;
    
    finalImagesGrid.innerHTML = '';
    
    croppedImages.forEach((image, index) => {
        if (image && image.croppedDataUrl) {
            const imageElement = document.createElement('div');
            imageElement.className = 'col-md-3 col-sm-4 col-6 mb-3';
            imageElement.innerHTML = `
                <div class="card">
                    <img src="${image.croppedDataUrl}" class="card-img-top" style="height: 120px; object-fit: cover;">
                    <div class="card-body p-2">
                        <small class="text-muted">이미지 ${index + 1}</small>
                    </div>
                </div>
            `;
            finalImagesGrid.appendChild(imageElement);
        }
    });
    
    console.log(`🖼️ 최종 이미지 그리드 업데이트: ${croppedImages.length}개`);
}

// 드래그 앤 드롭 설정 (프로필과 동일)
function setupDragAndDrop() {
    const uploadArea = elements.uploadArea;
    if (!uploadArea) return;
    
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    
    // 업로드 영역 클릭 시 파일 선택 (프로필 방식)
    uploadArea.addEventListener('click', (event) => {
        if (!event.target.closest('#fileSelectBtn')) {
            console.log('🖱️ 업로드 영역 클릭됨');
            if (elements.imageInput) {
                elements.imageInput.click();
            }
        }
    });
    
    console.log('🎯 드래그 앤 드롭 설정 완료');
}

// 드래그 오버 처리 (프로필과 동일)
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#0d6efd';
    event.currentTarget.style.backgroundColor = '#f8f9ff';
}

// 드롭 처리 (프로필과 동일)
function handleDrop(event) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
        console.log(`🎯 드롭된 파일 수: ${files.length}`);
        // 파일 입력 이벤트와 동일한 처리
        elements.imageInput.files = event.dataTransfer.files;
        handleImageUpload({ target: { files: event.dataTransfer.files } });
    }
    
    // 스타일 리셋
    event.currentTarget.style.borderColor = '';
    event.currentTarget.style.backgroundColor = '';
}

// 파일 크기 포맷팅 (프로필과 동일)
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 크롭퍼 줌 (프로필과 동일)
function zoomCropper(ratio) {
    if (!cropper) return;
    cropper.zoom(ratio);
}

// 크롭퍼 회전 (프로필과 동일)
function rotateCropper(degree) {
    if (!cropper) return;
    cropper.rotate(degree);
}

// 크롭퍼 리셋 (프로필과 동일)
function resetCropper() {
    if (!cropper) return;
    cropper.reset();
}

// 이전 이미지로 이동
function goToPreviousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        loadImageToCropper(originalImages[currentImageIndex]);
    }
}

// 다음 이미지로 이동
function goToNextImage() {
    if (currentImageIndex < originalImages.length - 1) {
        currentImageIndex++;
        loadImageToCropper(originalImages[currentImageIndex]);
    }
}

// 키보드 단축키 설정 (프로필과 동일)
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // 입력 필드에서는 단축키 비활성화
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
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

// 버튼 로딩 상태 설정 (프로필과 정확히 동일)
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

// 페이지 언로드 시 정리 (프로필과 동일)
window.addEventListener('beforeunload', function() {
    if (cropper) {
        cropper.destroy();
    }
});