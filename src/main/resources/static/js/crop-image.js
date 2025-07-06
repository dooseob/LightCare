/**
 * 프로필 이미지 크롭 전용 JavaScript (시설 이미지 수준으로 개선)
 * 한국 표준 증명사진 비율(3:4) 최적화 버전
 * Cropper.js 라이브러리 사용 + 고급 압축 UI + 파일명 변환
 */

// 전역 변수
let cropper = null;
let originalImageData = null;
let originalImage = null;

// 포맷 지원 확인
let formatSupport = {
    avif: false,
    webp: false
};

// DOM 요소
const elements = {};

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 프로필 이미지 크롭퍼 초기화 시작 (시설 이미지 수준 개선)');
    
    // 시설 이미지와 동일한 초기화 순서
    checkFormatSupport();
    initializeElements();
    setupEventListeners();
    
    console.log('✅ 프로필 이미지 크롭퍼 초기화 완료');
});

// 포맷 지원 확인 (시설 이미지에서 가져옴)
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

// DOM 요소 초기화
function initializeElements() {
    console.log('🔍 DOM 요소 초기화 시작');
    
    // 기본 요소들
    elements.imageInput = document.getElementById('imageInput');
    elements.cropImage = document.getElementById('cropImage');
    elements.uploadSection = document.getElementById('uploadSection');
    elements.cropSection = document.getElementById('cropSection');
    elements.compressionSection = document.getElementById('compressionSection');
    elements.completeSection = document.getElementById('completeSection');
    elements.previewCanvas = document.getElementById('previewCanvas');
    elements.finalPreview = document.getElementById('finalPreview');
    elements.finalPreviewImage = document.getElementById('finalPreviewImage');
    elements.zoomIndicator = document.getElementById('zoomIndicator');
    elements.zoomLevel = document.getElementById('zoomLevel');
    elements.zoomStatus = document.getElementById('zoomStatus');
    
    // 압축 관련 요소
    elements.compressionSavings = document.getElementById('compressionSavings');
    elements.qualitySlider = document.getElementById('qualitySlider');
    elements.qualityLabel = document.getElementById('qualityLabel');
    elements.currentFormat = document.getElementById('currentFormat');
    elements.formatJPEG = document.getElementById('formatJPEG');
    elements.formatAVIF = document.getElementById('formatAVIF');
    elements.formatWEBP = document.getElementById('formatWEBP');
    
    // 파일명 변환 관련 요소
    elements.profileNameInput = document.getElementById('profileNameInput');
    elements.previewProfileName = document.getElementById('previewProfileName');
    elements.altTextInput = document.getElementById('altTextInput');
    
    // 단계 요소
    elements.steps = {
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        step3: document.getElementById('step3'),
        step4: document.getElementById('step4')
    };
    
    // 버튼 요소
    elements.buttons = {
        zoomIn: document.getElementById('zoomIn'),
        zoomOut: document.getElementById('zoomOut'),
        resetZoom: document.getElementById('resetZoom'),
        backToUpload: document.getElementById('backToUpload'),
        cropAndSave: document.getElementById('cropAndSave'),
        cropAnother: document.getElementById('cropAnother'),
        backToCrop: document.getElementById('backToCropBtn'),
        removeImage: document.getElementById('removeImageBtn'),
        saveImage: document.getElementById('saveImageBtn'),
        recompress: document.getElementById('recompressBtn'),
        autoGenerateAlt: document.getElementById('autoGenerateAltBtn'),
        optimize: document.getElementById('optimizeBtn'),
        previewProfileName: document.getElementById('previewProfileNameBtn')
    };
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 파일 입력 이벤트 등록
    if (elements.imageInput) {
        elements.imageInput.removeEventListener('change', handleImageUpload);
        elements.imageInput.addEventListener('change', handleImageUpload);
        console.log('파일 입력 이벤트 리스너 등록됨');
    }
    
    // 확대/축소 버튼
    if (elements.buttons.zoomIn) {
        elements.buttons.zoomIn.addEventListener('click', () => {
            if (cropper) {
                cropper.zoom(0.1);
            }
        });
    }
    
    if (elements.buttons.zoomOut) {
        elements.buttons.zoomOut.addEventListener('click', () => {
            if (cropper) {
                cropper.zoom(-0.1);
            }
        });
    }
    
    if (elements.buttons.resetZoom) {
        elements.buttons.resetZoom.addEventListener('click', () => {
            if (cropper) {
                cropper.reset();
            }
        });
    }
    
    // 네비게이션 버튼
    if (elements.buttons.backToUpload) {
        elements.buttons.backToUpload.addEventListener('click', goToUploadStep);
    }
    
    if (elements.buttons.cropAndSave) {
        elements.buttons.cropAndSave.addEventListener('click', cropAndSaveImage);
    }
    
    if (elements.buttons.cropAnother) {
        elements.buttons.cropAnother.addEventListener('click', goToUploadStep);
    }
    
    // 3단계 압축 관련 버튼
    if (elements.buttons.backToCrop) {
        elements.buttons.backToCrop.addEventListener('click', goToCropStep);
    }
    
    if (elements.buttons.removeImage) {
        elements.buttons.removeImage.addEventListener('click', goToUploadStep);
    }
    
    if (elements.buttons.saveImage) {
        elements.buttons.saveImage.addEventListener('click', saveCompressedImageToServer);
    }
    
    if (elements.buttons.recompress) {
        elements.buttons.recompress.addEventListener('click', updateCompression);
    }
    
    if (elements.buttons.autoGenerateAlt) {
        elements.buttons.autoGenerateAlt.addEventListener('click', generateAltText);
    }
    
    if (elements.buttons.optimize) {
        elements.buttons.optimize.addEventListener('click', autoOptimizeImage);
    }
    
    // 파일명 미리보기 버튼
    if (elements.buttons.previewProfileName) {
        elements.buttons.previewProfileName.addEventListener('click', updateProfileNamePreview);
    }
    
    // 파일명 입력 시 실시간 미리보기
    if (elements.profileNameInput) {
        elements.profileNameInput.addEventListener('input', updateProfileNamePreview);
    }
    
    // 압축 품질 슬라이더
    if (elements.qualitySlider) {
        elements.qualitySlider.addEventListener('input', (e) => {
            const quality = Math.round(e.target.value * 100);
            elements.qualityLabel.textContent = quality;
            updateCompression();
        });
    }
    
    // 이미지 형식 선택
    ['formatJPEG', 'formatAVIF', 'formatWEBP'].forEach(formatId => {
        const element = document.getElementById(formatId);
        if (element) {
            element.addEventListener('change', updateCompression);
        }
    });
    
    // 키워드 버튼 클릭 이벤트
    document.querySelectorAll('.keyword-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const keyword = this.getAttribute('data-keyword');
            addKeywordToInput(keyword);
            
            // 클릭 애니메이션
            this.classList.add('btn-success');
            setTimeout(() => {
                this.classList.remove('btn-success');
            }, 500);
        });
    });
    
    // 파일 선택 버튼
    const fileSelectBtn = document.getElementById('fileSelectBtn');
    if (fileSelectBtn) {
        fileSelectBtn.addEventListener('click', () => {
            console.log('파일 선택 버튼 클릭됨');
            if (elements.imageInput) {
                elements.imageInput.click();
            }
        });
    }
    
    // 드래그 앤 드롭 (업로드 영역 전체)
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
        
        // 업로드 영역 클릭 시 파일 선택 (버튼 영역 제외)
        uploadArea.addEventListener('click', (event) => {
            if (!event.target.closest('#fileSelectBtn')) {
                console.log('업로드 영역 클릭됨');
                if (elements.imageInput) {
                    elements.imageInput.click();
                }
            }
        });
    }
}

// 키워드를 입력 필드에 추가
function addKeywordToInput(keyword) {
    if (!elements.profileNameInput) return;
    
    const currentValue = elements.profileNameInput.value.trim();
    let newValue;
    
    if (currentValue === '') {
        newValue = keyword;
    } else {
        // 기존 값에 하이픈으로 연결
        newValue = currentValue + '-' + keyword;
    }
    
    elements.profileNameInput.value = newValue;
    updateProfileNamePreview();
    
    console.log('🏷️ 키워드 추가:', keyword, '→', newValue);
}

// 프로필 파일명 미리보기 업데이트
function updateProfileNamePreview() {
    if (!elements.profileNameInput || !elements.previewProfileName) return;
    
    const userInput = elements.profileNameInput.value.trim();
    let englishName = 'profile_user_photo';
    
    if (userInput) {
        englishName = 'profile_' + convertKoreanToEnglish(userInput);
    }
    
    // 최종 파일명 생성 (확장자는 선택된 형식에 따라)
    const selectedFormat = getSelectedImageFormat();
    const finalName = englishName + '.' + selectedFormat;
    
    elements.previewProfileName.textContent = finalName;
    console.log('📝 파일명 미리보기 업데이트:', userInput, '→', finalName);
}

// 한글을 영문으로 변환 (프로필 전용)
function convertKoreanToEnglish(korean) {
    if (!korean || korean.trim() === '') {
        return 'user_photo';
    }
    
    // 프로필 관련 한글 키워드를 영문으로 매핑
    const koreanToEnglish = {
        // 사진 종류
        '증명사진': 'id_photo',
        '프로필': 'profile',
        '정면사진': 'front_photo',
        '여권사진': 'passport_photo',
        
        // 용도
        '이력서': 'resume',
        '자격증': 'certificate',
        '신분증': 'id_card',
        '입사지원': 'job_application',
        
        // 일반적인 단어
        '사진': 'photo',
        '이미지': 'image',
        '사용자': 'user',
        '회원': 'member',
        '직원': 'staff',
        '학생': 'student',
        
        // 숫자
        '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
        '첫번째': 'first', '두번째': 'second', '세번째': 'third'
    };
    
    let result = korean.toLowerCase().trim();
    
    // 한글 키워드 변환
    for (const [key, value] of Object.entries(koreanToEnglish)) {
        result = result.replace(new RegExp(key, 'g'), value);
    }
    
    // 아직 한글이 남아있으면 일반적인 변환
    if (containsKorean(result)) {
        result = 'user_photo_' + Date.now().toString().slice(-4);
    }
    
    // 파일명 정리 (특수문자 제거)
    result = result.replace(/[^a-zA-Z0-9_-]/g, '_')
                  .replace(/_+/g, '_')
                  .replace(/^_+|_+$/g, '');
    
    // 너무 길면 자르기
    if (result.length > 30) {
        result = result.substring(0, 30);
    }
    
    // 비어있으면 기본값
    if (!result) {
        result = 'user_photo';
    }
    
    return result;
}

// 문자열에 한글이 포함되어 있는지 확인
function containsKorean(text) {
    if (!text) return false;
    return /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text);
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
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        handleImageFile(files[0]);
    }
    
    // 스타일 리셋
    event.currentTarget.style.borderColor = '';
    event.currentTarget.style.backgroundColor = '';
}

// 이미지 업로드 처리
function handleImageUpload(event) {
    console.log('파일 업로드 이벤트 발생:', event);
    const file = event.target.files[0];
    if (file) {
        console.log('선택된 파일:', file.name, file.size, file.type);
        handleImageFile(file);
    } else {
        console.log('선택된 파일이 없습니다');
    }
}

// 이미지 파일 처리
function handleImageFile(file) {
    console.log('이미지 파일 처리 시작:', file.name, '크기:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
    }
    
    // 지원되는 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert('JPG, PNG, WebP 파일만 지원됩니다.');
        return;
    }
    
    console.log('파일 검증 통과, FileReader 시작');
    
    // 큰 파일도 허용하고 압축으로 해결
    if (file.size > 5 * 1024 * 1024) {
        console.log('⚠️ 큰 파일 감지 (' + (file.size / 1024 / 1024).toFixed(2) + 'MB) - 압축으로 처리');
        showLargeFileNotice(file.size);
    }
    
    // 로컬에서 이미지 로드
    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('FileReader 로드 완료');
        originalImageData = e.target.result;
        window.originalFile = file; // 전역 변수에 원본 파일 저장
        loadImageToCropper(originalImageData);
        goToCropStep();
    };
    reader.onerror = function(e) {
        console.error('FileReader 오류:', e);
        alert('파일 읽기 중 오류가 발생했습니다.');
    };
    reader.readAsDataURL(file);
}

// 큰 파일 안내 메시지 표시
function showLargeFileNotice(fileSize) {
    const sizeMB = (fileSize / 1024 / 1024).toFixed(2);
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-info alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.cssText = 'z-index: 10000; min-width: 350px;';
    alertDiv.innerHTML = `
        <i class="fas fa-info-circle me-2"></i>
        큰 파일(${sizeMB}MB)을 업로드하셨습니다. 자동으로 압축하여 최적화합니다.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 8초 후 자동 제거
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 8000);
}

// 크롭퍼에 이미지 로드
function loadImageToCropper(imageData) {
    if (!elements.cropImage) return;
    
    elements.cropImage.src = imageData;
    elements.cropImage.style.display = 'block';
    
    // 이미지가 로드된 후 크롭퍼 초기화
    elements.cropImage.onload = function() {
        console.log('이미지 로드 완료, 크롭퍼 초기화 시작');
        setTimeout(() => {
            initializeCropper();
        }, 100);
    };
}

// 크롭퍼 초기화 (시설 이미지와 동일한 고급 설정 + 3:4 비율)
function initializeCropper() {
    if (cropper) {
        cropper.destroy();
    }
    
    console.log('🚀 Cropper.js 초기화 시작 (시설 수준 고급 설정)');
    
    // 한국 표준 증명사진 비율 적용 (가로3:세로4)
    const aspectRatio = 3 / 4; // 0.75 (세로가 더 긴 형태)
    
    cropper = new Cropper(elements.cropImage, {
        aspectRatio: aspectRatio, // 3:4 비율
        viewMode: 1, // 크롭 박스를 캔버스 내부로 제한
        dragMode: 'move', // 드래그 모드
        autoCropArea: 0.8, // 자동 크롭 영역 크기
        restore: false, // 크기 조정 시 크롭 박스 복원 안함
        guides: true, // 가이드 라인 표시
        center: true, // 중앙 표시자 표시 (파란색으로 개선됨)
        highlight: true, // 크롭 박스 하이라이트
        cropBoxMovable: true, // 크롭 박스 이동 가능
        cropBoxResizable: true, // 크롭 박스 크기 조정 가능
        toggleDragModeOnDblclick: false, // 더블클릭으로 드래그 모드 토글 안함
        
        // 초기화 완료 시
        ready: function() {
            console.log('✅ Cropper.js 초기화 완료 (고급 설정)');
            console.log('📏 설정된 aspectRatio:', aspectRatio);
            console.log('🎯 목표: 증명사진 비율 (3:4, 세로가 더 긴 형태)');
            
            // 초기 크롭 데이터 확인
            const cropData = cropper.getData();
            const currentRatio = cropData.width / cropData.height;
            console.log('📊 초기 크롭 영역:', Math.round(cropData.width), 'x', Math.round(cropData.height));
            console.log('📊 초기 실제 비율:', currentRatio.toFixed(3), '목표:', aspectRatio.toFixed(3));
            
            // 초기 미리보기 업데이트
            updatePreview();
        },
        
        // 크롭 변경 시
        crop: function(event) {
            const data = event.detail;
            const currentRatio = data.width / data.height;
            const targetRatio = aspectRatio;
            
            // 비율 차이 허용 오차 (0.5%) - 더 엄격하게
            const tolerance = 0.005;
            
            // 비율이 목표에서 벗어날 경우 강제 조정 (대각선 비례 조정)
            if (Math.abs(currentRatio - targetRatio) > tolerance) {
                console.log('🔧 비율 자동 조정 (대각선 비례):', currentRatio.toFixed(3), '→', targetRatio.toFixed(3));
                
                // 대각선 비례 조정: 중심점을 유지하면서 비율 맞춤
                const centerX = data.x + data.width / 2;
                const centerY = data.y + data.height / 2;
                
                let newWidth, newHeight;
                
                // 현재 크기에서 비율에 맞게 조정 (대각선 확대/축소)
                if (currentRatio > targetRatio) {
                    // 너무 넓음 - 높이 기준으로 조정
                    newHeight = data.height;
                    newWidth = newHeight * targetRatio;
                } else {
                    // 너무 높음 - 너비 기준으로 조정
                    newWidth = data.width;
                    newHeight = newWidth / targetRatio;
                }
                
                // 중심점 유지하면서 새 위치 계산
                const newX = centerX - newWidth / 2;
                const newY = centerY - newHeight / 2;
                
                // 비율 강제 적용 (대각선 비례 유지)
                cropper.setData({
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight
                });
                
                console.log('✅ 대각선 비율 조정 완료:', newWidth.toFixed(1), 'x', newHeight.toFixed(1));
            }
            
            // 미리보기 업데이트
            updatePreview();
        }
    });
    
    // 스마트 스크롤 기능 추가 (시설 이미지와 동일)
    setupSmartScroll();
}

// 스마트 스크롤 기능 (시설 이미지에서 가져옴)
function setupSmartScroll() {
    if (!cropper || !elements.cropImage) return;
    
    const cropContainer = elements.cropImage.parentElement;
    if (!cropContainer) return;
    
    // 최대/최소 줌 레벨 설정
    const MIN_ZOOM = 0.1;  // 최소 줌 (10%)
    const MAX_ZOOM = 3.0;  // 최대 줌 (300%)
    
    console.log('🖱️ 스마트 스크롤 기능 활성화');
    
    cropContainer.addEventListener('wheel', function(event) {
        if (!cropper) return;
        
        // 현재 줌 레벨 확인 (더 정확한 방식)
        const canvasData = cropper.getCanvasData();
        const containerData = cropper.getContainerData();
        const currentZoom = canvasData.naturalWidth > 0 ? canvasData.width / canvasData.naturalWidth : 1;
        
        const isZoomingIn = event.deltaY < 0;  // 휠을 위로 올리면 확대
        const isZoomingOut = event.deltaY > 0; // 휠을 아래로 내리면 축소
        
        console.log('🔍 현재 줌:', currentZoom.toFixed(2), '방향:', isZoomingIn ? '확대' : '축소');
        
        // 더 관대한 임계값 설정
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
        cropper.zoom(zoomDelta);
        
        // 줌 표시기 업데이트
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + zoomDelta));
        updateZoomIndicator(newZoom, isZoomingIn ? '확대' : '축소');
        
    }, { passive: false }); // passive: false로 설정해야 preventDefault 작동
}

// 줌 표시기 업데이트
function updateZoomIndicator(zoomLevel, status) {
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

// 미리보기 업데이트
function updatePreview() {
    if (!cropper || !elements.previewCanvas) {
        return;
    }
    
    console.log('🖼️ 미리보기 업데이트 시작');
    
    // 크롭된 이미지를 캔버스에 그리기
    const canvas = cropper.getCroppedCanvas({
        width: 90,  // 미리보기 캔버스 크기와 동일
        height: 120,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });
    
    if (canvas) {
        const ctx = elements.previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, elements.previewCanvas.width, elements.previewCanvas.height);
        
        // 크롭된 이미지를 미리보기 캔버스에 그리기
        ctx.drawImage(canvas, 0, 0, elements.previewCanvas.width, elements.previewCanvas.height);
        
        console.log('✅ 미리보기 업데이트 완료');
    }
}

// 크롭 완료 후 3단계로 이동
function cropAndSaveImage() {
    if (!cropper) {
        alert('이미지를 먼저 로드해주세요.');
        return;
    }
    
    setButtonLoading(elements.buttons.cropAndSave, true, '처리 중...');
    
    try {
        // 최종 크롭된 이미지 생성 (고품질)
        const canvas = cropper.getCroppedCanvas({
            width: 300,   // 최종 이미지 가로 크기
            height: 400,  // 최종 이미지 세로 크기 (3:4 비율)
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        if (canvas) {
            // 크롭된 원본 데이터를 전역 변수에 저장
            window.croppedCanvas = canvas;
            
            console.log('✅ 크롭 완료 - 3단계로 이동');
            
            // 3단계 압축 단계로 이동
            goToCompressionStep();
            
        } else {
            throw new Error('캔버스 생성 실패');
        }
        
    } catch (error) {
        console.error('크롭 처리 오류:', error);
        alert('이미지 처리 중 오류가 발생했습니다.');
    } finally {
        setButtonLoading(elements.buttons.cropAndSave, false);
    }
}

// 3단계: 압축 및 SEO 최적화 단계로 이동
function goToCompressionStep() {
    hideAllSections();
    if (elements.compressionSection) elements.compressionSection.style.display = 'block';
    updateStepIndicator(3);
    
    // 초기 압축 적용 및 미리보기 업데이트
    updateCompression();
    generateAltText();
    updateProfileNamePreview();
}

// 이미지 압축 업데이트 (시설 이미지에서 가져온 고급 기능)
function updateCompression() {
    if (!window.croppedCanvas) {
        console.error('❌ 크롭된 캔버스가 없습니다');
        return;
    }
    
    const quality = parseFloat(elements.qualitySlider.value || 0.8);
    const selectedFormat = getSelectedImageFormat();
    
    console.log('🔄 이미지 압축 업데이트 - 형식:', selectedFormat.toUpperCase(), '품질:', Math.round(quality * 100) + '%');
    
    try {
        let compressedImageData;
        let actualFormat = selectedFormat;
        let formatSupported = false;
        
        // 단계별 형식 지원 확인 및 압축
        if (selectedFormat === 'avif') {
            console.log('🔍 AVIF 지원 확인 중...');
            formatSupported = isFormatSupported('image/avif');
            if (formatSupported) {
                compressedImageData = window.croppedCanvas.toDataURL('image/avif', quality);
                console.log('✅ AVIF 형식으로 압축 성공');
            } else {
                console.log('⚠️ AVIF 미지원 - WebP 시도');
                formatSupported = isFormatSupported('image/webp');
                if (formatSupported) {
                    compressedImageData = window.croppedCanvas.toDataURL('image/webp', quality);
                    actualFormat = 'webp';
                    console.log('✅ WebP 형식으로 압축 성공 (AVIF 대체)');
                    showFormatFallbackMessage('AVIF', 'WebP');
                } else {
                    console.log('⚠️ WebP도 미지원 - JPEG 사용');
                    compressedImageData = window.croppedCanvas.toDataURL('image/jpeg', quality);
                    actualFormat = 'jpeg';
                    console.log('✅ JPEG 형식으로 압축 성공 (AVIF 대체)');
                    showFormatFallbackMessage('AVIF', 'JPEG');
                }
            }
        } else if (selectedFormat === 'webp') {
            console.log('🔍 WebP 지원 확인 중...');
            formatSupported = isFormatSupported('image/webp');
            if (formatSupported) {
                compressedImageData = window.croppedCanvas.toDataURL('image/webp', quality);
                console.log('✅ WebP 형식으로 압축 성공');
            } else {
                console.log('⚠️ WebP 미지원 - JPEG 사용');
                compressedImageData = window.croppedCanvas.toDataURL('image/jpeg', quality);
                actualFormat = 'jpeg';
                console.log('✅ JPEG 형식으로 압축 성공 (WebP 대체)');
                showFormatFallbackMessage('WebP', 'JPEG');
            }
        } else {
            // JPEG는 모든 브라우저에서 지원
            compressedImageData = window.croppedCanvas.toDataURL('image/jpeg', quality);
            console.log('✅ JPEG 형식으로 압축 성공');
        }
        
        // 데이터 유효성 검증
        if (!compressedImageData || !compressedImageData.startsWith('data:image/')) {
            throw new Error('압축된 이미지 데이터가 유효하지 않습니다');
        }
        
        // 현재 형식 표시 업데이트
        if (elements.currentFormat) {
            elements.currentFormat.textContent = actualFormat.toUpperCase();
        }
        
        // 최종 미리보기 업데이트
        if (elements.finalPreviewImage) {
            elements.finalPreviewImage.src = compressedImageData;
            elements.finalPreviewImage.onload = function() {
                console.log('✅ 최종 미리보기 이미지 로드 완료');
            };
            elements.finalPreviewImage.onerror = function() {
                console.error('❌ 최종 미리보기 이미지 로드 실패');
            };
        }
        
        // 압축 정보 업데이트
        updateCompressionInfo(compressedImageData, actualFormat);
        
        // 압축된 데이터 및 형식 저장
        window.compressedImageData = compressedImageData;
        window.selectedImageFormat = actualFormat;
        
        console.log('✅ 압축 처리 완료 - 형식:', actualFormat.toUpperCase(), '데이터 크기:', Math.round(compressedImageData.length / 1024) + 'KB');
        
    } catch (error) {
        console.error('❌ 압축 처리 오류:', error);
        
        // 오류 시 안전한 JPEG 폴백
        try {
            const fallbackData = window.croppedCanvas.toDataURL('image/jpeg', 0.8);
            if (elements.finalPreviewImage) {
                elements.finalPreviewImage.src = fallbackData;
            }
            updateCompressionInfo(fallbackData, 'jpeg');
            window.compressedImageData = fallbackData;
            window.selectedImageFormat = 'jpeg';
            
            console.log('🔄 JPEG 폴백 처리 완료');
            showFormatFallbackMessage(selectedFormat.toUpperCase(), 'JPEG');
        } catch (fallbackError) {
            console.error('❌ 폴백 처리도 실패:', fallbackError);
            alert('이미지 압축 처리 중 오류가 발생했습니다. 다른 이미지를 선택해주세요.');
        }
    }
}

// 선택된 이미지 형식 가져오기
function getSelectedImageFormat() {
    if (elements.formatAVIF && elements.formatAVIF.checked) return 'avif';
    if (elements.formatWEBP && elements.formatWEBP.checked) return 'webp';
    if (elements.formatJPEG && elements.formatJPEG.checked) return 'jpeg';
    return 'avif'; // 기본값
}

// 브라우저 형식 지원 여부 확인 (시설 이미지에서 가져옴)
function isFormatSupported(mimeType) {
    // 1. 기본 브라우저 지원 확인
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext('2d');
    
    // 작은 이미지 데이터 생성
    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = 'rgb(0, 255, 0)';
    ctx.fillRect(1, 0, 1, 1);
    ctx.fillStyle = 'rgb(0, 0, 255)';
    ctx.fillRect(0, 1, 1, 1);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(1, 1, 1, 1);
    
    try {
        const dataURL = canvas.toDataURL(mimeType, 0.9);
        const isSupported = dataURL.startsWith(`data:${mimeType}`);
        
        console.log(`🔍 형식 지원 확인: ${mimeType} - ${isSupported ? '지원됨' : '미지원'}`);
        console.log(`📄 DataURL 시작: ${dataURL.substring(0, 50)}...`);
        
        return isSupported;
    } catch (e) {
        console.warn(`⚠️ 형식 지원 확인 오류: ${mimeType}`, e);
        return false;
    }
}

// 형식 폴백 메시지 표시
function showFormatFallbackMessage(original, fallback) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-warning alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.cssText = 'z-index: 10000; min-width: 300px;';
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${original} 형식이 지원되지 않아 ${fallback}로 변환됩니다.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// 자동 최적화 기능
function autoOptimizeImage() {
    console.log('🚀 자동 최적화 시작');
    
    // AVIF가 지원되면 AVIF + 70% 품질 사용
    if (isFormatSupported('image/avif')) {
        elements.formatAVIF.checked = true;
        elements.qualitySlider.value = 0.7;
        elements.qualityLabel.textContent = '70';
        console.log('✅ AVIF 70% 품질로 자동 최적화');
    } 
    // WebP가 지원되면 WebP + 75% 품질 사용
    else if (isFormatSupported('image/webp')) {
        elements.formatWEBP.checked = true;
        elements.qualitySlider.value = 0.75;
        elements.qualityLabel.textContent = '75';
        console.log('✅ WebP 75% 품질로 자동 최적화');
    } 
    // 둘 다 안되면 JPEG + 80% 품질
    else {
        elements.formatJPEG.checked = true;
        elements.qualitySlider.value = 0.8;
        elements.qualityLabel.textContent = '80';
        console.log('✅ JPEG 80% 품질로 자동 최적화');
    }
    
    // 압축 업데이트
    updateCompression();
    
    // 성공 메시지
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.cssText = 'z-index: 10000; min-width: 300px;';
    alertDiv.innerHTML = `
        <i class="fas fa-magic me-2"></i>자동 최적화가 완료되었습니다!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

// 압축 정보 업데이트 (형식 정보 포함)
function updateCompressionInfo(compressedImageData, format) {
    if (!window.originalFile || !elements.compressionSavings) return;
    
    // 원본 파일 크기
    const originalSize = window.originalFile.size;
    
    // 압축된 파일 크기 (Base64를 Blob으로 변환하여 계산)
    const compressedSize = dataURLtoBlob(compressedImageData).size;
    
    // 절약률 계산
    const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    // 형식별 예상 추가 절약률 표시
    let formatBenefit = '';
    if (format === 'avif') {
        formatBenefit = ' (AVIF로 최대 절약)';
    } else if (format === 'webp') {
        formatBenefit = ' (WebP로 효율적 압축)';
    } else if (format === 'jpeg') {
        formatBenefit = ' (JPEG 호환성 우선)';
    }
    
    console.log('📊 압축 정보:', {
        format: format.toUpperCase(),
        originalSize: formatFileSize(originalSize),
        compressedSize: formatFileSize(compressedSize),
        savings: savings + '%'
    });
    
    elements.compressionSavings.innerHTML = 
        `<div>${savings}% 절약 (${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)})</div>
         <small class="text-muted">${format.toUpperCase()} 형식${formatBenefit}</small>`;
}

// Alt 텍스트 자동 생성 (프로필 전용)
function generateAltText() {
    if (!elements.altTextInput) return;
    
    // 기본 Alt 텍스트 생성
    let altText = '사용자 프로필 사진';
    
    // 파일명 입력에서 추가 정보 추출
    if (elements.profileNameInput && elements.profileNameInput.value.trim()) {
        const profileName = elements.profileNameInput.value.trim();
        altText += ` - ${profileName}`;
    }
    // 원본 파일명에서 추가 정보 추출
    else if (window.originalFile && window.originalFile.name) {
        const fileName = window.originalFile.name.replace(/\.[^/.]+$/, ''); // 확장자 제거
        if (fileName.length > 0 && fileName !== 'image') {
            altText += ` - ${fileName}`;
        }
    }
    
    elements.altTextInput.value = altText;
    console.log('🏷️ Alt 텍스트 자동 생성:', altText);
}

// 압축된 이미지를 서버에 저장 (고급 기능 포함)
function saveCompressedImageToServer() {
    console.log('📤 최종 이미지 업로드 시작');
    
    if (!window.compressedImageData) {
        console.error('❌ 압축된 이미지 데이터가 없습니다');
        alert('압축된 이미지가 없습니다. 다시 시도해주세요.');
        return;
    }
    
    const altText = elements.altTextInput?.value?.trim() || '사용자 프로필 사진';
    const selectedFormat = window.selectedImageFormat || 'jpeg';
    const quality = Math.round((elements.qualitySlider?.value || 0.8) * 100);
    const customFileName = elements.profileNameInput?.value?.trim() || '';
    
    console.log('📋 업로드 정보:');
    console.log('  - Alt 텍스트:', altText);
    console.log('  - 형식:', selectedFormat.toUpperCase());
    console.log('  - 품질:', quality + '%');
    console.log('  - 사용자 파일명:', customFileName);
    console.log('  - 데이터 크기:', Math.round(window.compressedImageData.length / 1024) + 'KB');
    
    if (elements.buttons.saveImage) {
        setButtonLoading(elements.buttons.saveImage, true, '저장 중...');
    }
    
    // Base64 데이터를 Blob으로 변환
    const blob = dataURLtoBlob(window.compressedImageData);
    console.log('📦 Blob 생성 완료 - 크기:', formatFileSize(blob.size), '타입:', blob.type);
    
    const formData = new FormData();
    formData.append('croppedImage', blob, `profile.${selectedFormat}`);
    formData.append('altText', altText);
    formData.append('format', selectedFormat);
    formData.append('quality', quality.toString());
    formData.append('customFileName', customFileName);
    
    console.log('📤 FormData 전송 시작...');
    
    fetch('/member/myinfo/crop-image/save', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('📨 서버 응답 수신:', response.status, response.statusText);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (elements.buttons.saveImage) {
            setButtonLoading(elements.buttons.saveImage, false);
        }
        
        console.log('📄 서버 응답 데이터:', data);
        
        if (data.success) {
            // 최종 완료 미리보기 설정
            if (elements.finalPreview) {
                elements.finalPreview.src = window.compressedImageData;
            }
            
            // 성공 시 완료 단계 표시
            goToCompleteStep();
            console.log('✅ 프로필 이미지 저장 성공');
            
            // 성공 메시지 표시
            showSuccessMessage('프로필 이미지가 성공적으로 저장되었습니다!');
            
        } else {
            console.error('❌ 서버에서 실패 응답:', data.message);
            alert(data.message || '이미지 저장에 실패했습니다.');
        }
    })
    .catch(error => {
        if (elements.buttons.saveImage) {
            setButtonLoading(elements.buttons.saveImage, false);
        }
        console.error('❌ 업로드 오류:', error);
        alert('이미지 저장 중 오류가 발생했습니다: ' + error.message);
    });
}

// 성공 메시지 표시
function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.cssText = 'z-index: 10000; min-width: 350px;';
    alertDiv.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Base64를 Blob으로 변환
function dataURLtoBlob(dataurl) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 단계 이동 함수들
function goToUploadStep() {
    hideAllSections();
    if (elements.uploadSection) elements.uploadSection.style.display = 'block';
    updateStepIndicator(1);
    
    // 전체 초기화
    if (elements.imageInput) elements.imageInput.value = '';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    originalImageData = null;
    originalImage = null;
    window.croppedCanvas = null;
    window.originalFile = null;
    window.compressedImageData = null;
}

function goToCropStep() {
    hideAllSections();
    if (elements.cropSection) elements.cropSection.style.display = 'block';
    updateStepIndicator(2);
}

function goToCompleteStep() {
    hideAllSections();
    if (elements.completeSection) elements.completeSection.style.display = 'block';
    updateStepIndicator(4);
}

// 모든 섹션 숨기기
function hideAllSections() {
    if (elements.uploadSection) elements.uploadSection.style.display = 'none';
    if (elements.cropSection) elements.cropSection.style.display = 'none';
    if (elements.compressionSection) elements.compressionSection.style.display = 'none';
    if (elements.completeSection) elements.completeSection.style.display = 'none';
}

// 단계 표시기 업데이트
function updateStepIndicator(currentStep) {
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