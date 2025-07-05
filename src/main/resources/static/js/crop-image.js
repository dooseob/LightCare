/**
 * 프로필 이미지 크롭 전용 JavaScript
 * 한국 표준 증명사진 비율(3:4) 최적화 버전
 * Cropper.js 라이브러리 사용
 */

// 전역 변수
let cropper = null;
let originalImageData = null;
let originalImage = null;

// DOM 요소
const elements = {};

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    console.log('프로필 이미지 크롭 페이지 초기화 완료 (Cropper.js)');
});

// DOM 요소 초기화
function initializeElements() {
    elements.imageInput = document.getElementById('imageInput');
    elements.cropImage = document.getElementById('cropImage');
    elements.uploadSection = document.getElementById('uploadSection');
    elements.cropSection = document.getElementById('cropSection');
    elements.completeSection = document.getElementById('completeSection');
    elements.previewCanvas = document.getElementById('previewCanvas');
    elements.finalPreview = document.getElementById('finalPreview');
    elements.zoomIndicator = document.getElementById('zoomIndicator');
    elements.zoomLevel = document.getElementById('zoomLevel');
    elements.zoomStatus = document.getElementById('zoomStatus');
    
    // 단계 요소
    elements.steps = {
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        step3: document.getElementById('step3')
    };
    
    // 버튼 요소
    elements.buttons = {
        zoomIn: document.getElementById('zoomIn'),
        zoomOut: document.getElementById('zoomOut'),
        resetZoom: document.getElementById('resetZoom'),
        backToUpload: document.getElementById('backToUpload'),
        cropAndSave: document.getElementById('cropAndSave'),
        cropAnother: document.getElementById('cropAnother')
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
    console.log('이미지 파일 처리 시작:', file.name);
    
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
    }
    
    // 파일 크기 검증 해제 (대용량 파일도 자동 압축)
    // 용량 제한 없이 처리 - 압축을 통해 자동으로 용량 최적화
    console.log(`📦 파일 크기: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) - 제한 없음`);
    
    // 지원되는 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        alert('JPG, PNG 파일만 지원됩니다.');
        return;
    }
    
    console.log('파일 검증 통과, FileReader 시작');
    
    // 로컬에서 이미지 로드
    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('FileReader 로드 완료');
        originalImageData = e.target.result;
        loadImageToCropper(originalImageData);
        goToCropStep();
    };
    reader.onerror = function(e) {
        console.error('FileReader 오류:', e);
        alert('파일 읽기 중 오류가 발생했습니다.');
    };
    reader.readAsDataURL(file);
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

// 크롭퍼 초기화 (Cropper.js 사용)
function initializeCropper() {
    if (cropper) {
        cropper.destroy();
    }
    
    console.log('🚀 Cropper.js 초기화 시작');
    
    // 한국 표준 증명사진 비율 적용 (가로3:세로4)
    const aspectRatio = 3 / 4; // 0.75 (세로가 더 긴 형태)
    
    cropper = new Cropper(elements.cropImage, {
        aspectRatio: aspectRatio, // 3:4 비율
        viewMode: 1, // 크롭 박스를 캔버스 내부로 제한
        dragMode: 'move', // 드래그 모드
        autoCropArea: 0.8, // 자동 크롭 영역 크기
        restore: false, // 크기 조정 시 크롭 박스 복원 안함
        guides: true, // 가이드 라인 표시
        center: true, // 중앙 표시자 표시
        highlight: true, // 크롭 박스 하이라이트
        cropBoxMovable: true, // 크롭 박스 이동 가능
        cropBoxResizable: true, // 크롭 박스 크기 조정 가능
        toggleDragModeOnDblclick: false, // 더블클릭으로 드래그 모드 토글 안함
        
        // 초기화 완료 시
        ready: function() {
            console.log('✅ Cropper.js 초기화 완료');
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
            
            // 비율 확인 로그
            if (Math.abs(currentRatio - aspectRatio) > 0.01) {
                console.log('⚠️ 비율 확인:', currentRatio.toFixed(3), '목표:', aspectRatio.toFixed(3));
            }
            
            // 미리보기 업데이트
            updatePreview();
        }
    });
    
    // 스마트 스크롤 기능 추가 (이미지 확대/축소 우선, 한계점에서 페이지 스크롤)
    setupSmartScroll();
}

// 스마트 스크롤 기능
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

// 크롭 및 저장
function cropAndSaveImage() {
    if (!cropper) {
        alert('이미지를 먼저 로드해주세요.');
        return;
    }
    
    setButtonLoading(elements.buttons.cropAndSave, true, '저장 중...');
    
    try {
        // 최종 크롭된 이미지 생성 (고품질)
        const canvas = cropper.getCroppedCanvas({
            width: 300,   // 최종 이미지 가로 크기
            height: 400,  // 최종 이미지 세로 크기 (3:4 비율)
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        if (canvas) {
            // Base64로 변환하여 서버에 전송
            const croppedImageData = canvas.toDataURL('image/jpeg', 0.9);
            saveImageToServer(croppedImageData);
        } else {
            throw new Error('캔버스 생성 실패');
        }
        
    } catch (error) {
        console.error('크롭 처리 오류:', error);
        setButtonLoading(elements.buttons.cropAndSave, false);
        alert('이미지 처리 중 오류가 발생했습니다.');
    }
}

// 서버에 크롭된 이미지 저장
function saveImageToServer(croppedImageData) {
    const formData = new FormData();
    formData.append('croppedImage', croppedImageData);
    
    fetch('/member/myinfo/crop-image/save', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        setButtonLoading(elements.buttons.cropAndSave, false);
        
        if (data.success) {
            // 최종 미리보기 설정
            if (elements.finalPreview) {
                elements.finalPreview.src = croppedImageData;
            }
            
            // 성공 시 완료 단계 표시
            goToCompleteStep();
            console.log('프로필 이미지 저장 성공');
            
            // 3초 후 마이페이지로 자동 이동 (선택사항)
            setTimeout(() => {
                window.location.href = '/member/myinfo/edit';
            }, 2000);
        } else {
            alert(data.message || '이미지 저장에 실패했습니다.');
        }
    })
    .catch(error => {
        setButtonLoading(elements.buttons.cropAndSave, false);
        console.error('저장 오류:', error);
        alert('이미지 저장 중 오류가 발생했습니다.');
    });
}

// 단계 이동 함수들
function goToUploadStep() {
    hideAllSections();
    if (elements.uploadSection) elements.uploadSection.style.display = 'block';
    updateStepIndicator(1);
    
    // 초기화
    if (elements.imageInput) elements.imageInput.value = '';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    originalImageData = null;
    originalImage = null;
}

function goToCropStep() {
    hideAllSections();
    if (elements.cropSection) elements.cropSection.style.display = 'block';
    updateStepIndicator(2);
}

function goToCompleteStep() {
    hideAllSections();
    if (elements.completeSection) elements.completeSection.style.display = 'block';
    updateStepIndicator(3);
}

// 모든 섹션 숨기기
function hideAllSections() {
    if (elements.uploadSection) elements.uploadSection.style.display = 'none';
    if (elements.cropSection) elements.cropSection.style.display = 'none';
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