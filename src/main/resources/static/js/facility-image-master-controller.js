/**
 * 시설 이미지 업로드 마스터 컨트롤러
 * 모든 단계와 기능을 통합 관리하는 고도화된 시스템
 * 
 * 기능:
 * 1. 1단계(선택/오더) - 2단계(크롭/편집) - 3단계(관리/저장) 완전 연결
 * 2. 백엔드 API와 실시간 동기화
 * 3. 오류 처리 및 복구 메커니즘
 * 4. 사용자 경험 최적화
 * 5. 기존 기능 완전 호환
 */

console.log('🎛️ 시설 이미지 마스터 컨트롤러 로드 시작');

// ========================================
// 전역 상태 관리 (Redux 패턴 적용)
// ========================================
window.FacilityImageMaster = {
    // 현재 상태
    state: {
        currentStep: 1,
        facilityId: null,
        selectedFiles: [],
        processedImages: [],
        uploadedImages: [],
        imageOrder: [],
        isProcessing: false,
        hasErrors: false,
        errorMessages: [],
        settings: {
            maxImages: 5,
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
            maxFileSize: 10 * 1024 * 1024, // 10MB
            cropRatio: 16/9,
            quality: 0.8
        }
    },
    
    // 이벤트 리스너들
    listeners: {
        stateChange: [],
        stepChange: [],
        imageAdd: [],
        imageRemove: [],
        error: [],
        success: []
    },
    
    // API 엔드포인트
    endpoints: {
        uploadImages: '/facility/facility-images/upload',
        reorderImages: '/facility/facility-images/reorder',
        deleteImage: '/facility/facility-images/delete',
        getImages: '/facility/facility-images',
        setMainImage: '/facility/facility-images/main'
    }
};

// ========================================
// 상태 관리 함수들
// ========================================

// 상태 업데이트 (불변성 보장)
function updateState(updates) {
    const oldState = window.FacilityImageMaster.state;
    const newState = { ...oldState, ...updates };
    
    // 중첩 객체 깊은 복사
    if (updates.settings) {
        newState.settings = { ...oldState.settings, ...updates.settings };
    }
    
    window.FacilityImageMaster.state = newState;
    
    // 상태 변경 이벤트 발생
    triggerEvent('stateChange', { oldState, newState });
    
    console.log('📊 상태 업데이트:', updates);
    return newState;
}

// 이벤트 리스너 등록
function addEventListener(eventType, callback) {
    if (window.FacilityImageMaster.listeners[eventType]) {
        window.FacilityImageMaster.listeners[eventType].push(callback);
    }
}

// 이벤트 발생
function triggerEvent(eventType, data) {
    const listeners = window.FacilityImageMaster.listeners[eventType] || [];
    listeners.forEach(callback => {
        try {
            callback(data);
        } catch (error) {
            console.error(`이벤트 리스너 오류 (${eventType}):`, error);
        }
    });
}

// ========================================
// 초기화 및 설정
// ========================================
function initializeFacilityImageMaster() {
    console.log('🔧 마스터 컨트롤러 초기화 시작');
    
    // URL에서 시설 ID 추출
    const facilityId = extractFacilityId();
    updateState({ facilityId });
    
    // DOM 요소 확인 및 초기화
    const requiredElements = validateDOMElements();
    if (!requiredElements.isValid) {
        console.error('❌ 필수 DOM 요소 누락:', requiredElements.missing);
        return false;
    }
    
    // 각 단계 컨트롤러 초기화
    initializeStepControllers();
    
    // 글로벌 이벤트 리스너 설정
    setupGlobalEventListeners();
    
    // 기존 이미지 로드 (편집 모드인 경우)
    loadExistingImages();
    
    // 오류 복구 메커니즘 설정
    setupErrorRecovery();
    
    console.log('✅ 마스터 컨트롤러 초기화 완료');
    return true;
}

// 시설 ID 추출 (여러 방법 시도)
function extractFacilityId() {
    let facilityId = null;
    
    try {
        // 1. URL 경로에서 추출
        const pathParts = window.location.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        if (!isNaN(lastPart) && lastPart !== '') {
            facilityId = parseInt(lastPart);
        }
        
        // 2. 메타 태그에서 추출
        if (!facilityId) {
            const metaTag = document.querySelector('meta[name="facility-id"]');
            if (metaTag) {
                facilityId = parseInt(metaTag.getAttribute('content'));
            }
        }
        
        // 3. 히든 인풋에서 추출
        if (!facilityId) {
            const hiddenInput = document.querySelector('input[name="facilityId"]');
            if (hiddenInput) {
                facilityId = parseInt(hiddenInput.value);
            }
        }
        
        // 4. 데이터 속성에서 추출
        if (!facilityId) {
            const container = document.querySelector('[data-facility-id]');
            if (container) {
                facilityId = parseInt(container.dataset.facilityId);
            }
        }
        
    } catch (error) {
        console.error('❌ 시설 ID 추출 중 오류:', error);
    }
    
    console.log('🏢 추출된 시설 ID:', facilityId);
    return facilityId;
}

// DOM 요소 검증
function validateDOMElements() {
    const requiredElements = {
        // 1단계 요소들
        step1: [
            'uploadSection',
            'imageInput', 
            'folderInput',
            'selectedImagesPreview',
            'imageOrderList',
            'proceedToCropBtn'
        ],
        // 2단계 요소들 
        step2: [
            'cropSection',
            'cropImage',
            'previewCanvas'
        ],
        // 3단계 요소들
        step3: [
            'manageSection',
            'manageImagesGrid'
        ],
        // 공통 요소들
        common: [
            'progressArea',
            'stepIndicator'
        ]
    };
    
    const missing = [];
    const found = {};
    
    // 각 요소 검증
    Object.entries(requiredElements).forEach(([category, elements]) => {
        found[category] = {};
        elements.forEach(elementId => {
            const element = document.getElementById(elementId);
            found[category][elementId] = !!element;
            if (!element) {
                missing.push(`${category}.${elementId}`);
            }
        });
    });
    
    return {
        isValid: missing.length === 0,
        missing,
        found
    };
}

// ========================================
// 단계별 컨트롤러 초기화
// ========================================
function initializeStepControllers() {
    console.log('🎯 단계별 컨트롤러 초기화');
    
    // 1단계: 이미지 선택 및 오더링
    initializeStep1Controller();
    
    // 2단계: 크롭 및 편집  
    initializeStep2Controller();
    
    // 3단계: 관리 및 저장
    initializeStep3Controller();
    
    // 단계 간 네비게이션
    setupStepNavigation();
}

// 1단계 컨트롤러
function initializeStep1Controller() {
    console.log('📁 1단계 컨트롤러 초기화 - 이미지 선택 및 오더링');
    
    const step1Elements = {
        imageLoadBtn: document.getElementById('imageLoadBtn'),
        fileSelectOption: document.getElementById('fileSelectOption'),
        folderSelectOption: document.getElementById('folderSelectOption'),
        imageInput: document.getElementById('imageInput'),
        folderInput: document.getElementById('folderInput'),
        uploadArea: document.getElementById('uploadArea')
    };
    
    // 파일 선택 이벤트
    if (step1Elements.imageInput) {
        step1Elements.imageInput.addEventListener('change', (e) => {
            handleFileSelection(e.target.files, 'file');
        });
    }
    
    // 폴더 선택 이벤트
    if (step1Elements.folderInput) {
        step1Elements.folderInput.addEventListener('change', (e) => {
            handleFileSelection(e.target.files, 'folder');
        });
    }
    
    // 드래그 앤 드롭
    if (step1Elements.uploadArea) {
        setupDragAndDrop(step1Elements.uploadArea);
    }
    
    // 버튼 이벤트
    if (step1Elements.imageLoadBtn) {
        step1Elements.imageLoadBtn.addEventListener('click', () => {
            step1Elements.imageInput?.click();
        });
    }
    
    if (step1Elements.fileSelectOption) {
        step1Elements.fileSelectOption.addEventListener('click', (e) => {
            e.preventDefault();
            step1Elements.imageInput?.click();
        });
    }
    
    if (step1Elements.folderSelectOption) {
        step1Elements.folderSelectOption.addEventListener('click', (e) => {
            e.preventDefault();
            step1Elements.folderInput?.click();
        });
    }
}

// 2단계 컨트롤러
function initializeStep2Controller() {
    console.log('✂️ 2단계 컨트롤러 초기화 - 크롭 및 편집');
    
    // Cropper.js 설정
    setupImageCropper();
    
    // SEO 키워드 시스템 연결
    setupSEOKeywords();
    
    // 압축 설정
    setupImageCompression();
}

// 3단계 컨트롤러  
function initializeStep3Controller() {
    console.log('💾 3단계 컨트롤러 초기화 - 관리 및 저장');
    
    // 이미지 관리 기능
    setupImageManagement();
    
    // 서버 업로드
    setupServerUpload();
    
    // 순서 재정렬
    setupImageReordering();
}

// ========================================
// 파일 처리 통합 시스템
// ========================================
function handleFileSelection(files, source) {
    console.log(`📁 파일 선택 처리 - ${source}:`, files.length, '개');
    
    if (window.FacilityImageMaster.state.isProcessing) {
        showNotification('이미 처리 중입니다. 잠시 후 다시 시도해주세요.', 'warning');
        return;
    }
    
    updateState({ isProcessing: true });
    
    try {
        // 1. 파일 유효성 검사
        const validationResult = validateFiles(files);
        if (!validationResult.isValid) {
            throw new Error(validationResult.message);
        }
        
        // 2. 이미지 파일만 필터링
        const imageFiles = Array.from(files).filter(file => 
            file.type.startsWith('image/')
        );
        
        // 3. 최대 개수 체크
        const maxImages = window.FacilityImageMaster.state.settings.maxImages;
        if (imageFiles.length > maxImages) {
            showNotification(`최대 ${maxImages}장까지만 선택할 수 있습니다. 처음 ${maxImages}장을 선택합니다.`, 'info');
            imageFiles.splice(maxImages);
        }
        
        // 4. 상태 업데이트
        updateState({ 
            selectedFiles: imageFiles,
            imageOrder: [] // 새 파일 선택 시 순서 초기화
        });
        
        // 5. 미리보기 생성
        generateImagePreview(imageFiles);
        
        // 6. 이벤트 발생
        triggerEvent('imageAdd', { files: imageFiles, source });
        
    } catch (error) {
        console.error('❌ 파일 선택 처리 오류:', error);
        handleError('파일 처리 중 오류가 발생했습니다: ' + error.message);
    } finally {
        updateState({ isProcessing: false });
    }
}

// 파일 유효성 검사
function validateFiles(files) {
    const settings = window.FacilityImageMaster.state.settings;
    
    for (const file of files) {
        // 파일 크기 검사
        if (file.size > settings.maxFileSize) {
            return {
                isValid: false,
                message: `파일 크기가 너무 큽니다: ${file.name} (최대 ${formatFileSize(settings.maxFileSize)})`
            };
        }
        
        // 파일 타입 검사 (이미지만)
        if (!file.type.startsWith('image/')) {
            continue; // 이미지가 아닌 파일은 건너뛰기
        }
        
        if (!settings.allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                message: `지원하지 않는 파일 형식입니다: ${file.name}`
            };
        }
    }
    
    return { isValid: true };
}

// ========================================
// 이미지 미리보기 및 순서 관리
// ========================================
function generateImagePreview(files) {
    console.log('🖼️ 이미지 미리보기 생성:', files.length, '개');
    
    const selectedImagesPreview = document.getElementById('selectedImagesPreview');
    const imageOrderList = document.getElementById('imageOrderList');
    const selectedCount = document.getElementById('selectedCount');
    
    if (!selectedImagesPreview || !imageOrderList) {
        console.error('❌ 미리보기 요소를 찾을 수 없습니다');
        return;
    }
    
    // UI 표시
    selectedImagesPreview.style.display = 'block';
    if (selectedCount) selectedCount.textContent = files.length;
    
    // 기존 내용 초기화
    imageOrderList.innerHTML = '';
    
    // 순서 큐 초기화
    updateState({ imageOrder: [] });
    
    // 각 파일에 대해 미리보기 생성
    files.forEach((file, index) => {
        createImagePreviewCard(file, index, imageOrderList);
    });
    
    // 안내 메시지 표시
    showOrderingInstructions();
}

// 개별 이미지 미리보기 카드 생성
function createImagePreviewCard(file, index, container) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-4 col-sm-6';
    colDiv.dataset.index = index;
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card border-secondary h-100 image-order-item';
    cardDiv.style.cursor = 'pointer';
    cardDiv.style.transition = 'all 0.3s ease';
    
    // 클릭 이벤트 (순서 지정)
    cardDiv.addEventListener('click', () => handleImageOrderClick(index));
    
    // 마우스 호버 효과
    cardDiv.addEventListener('mouseenter', () => {
        cardDiv.style.transform = 'translateY(-2px)';
        cardDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
    
    cardDiv.addEventListener('mouseleave', () => {
        cardDiv.style.transform = 'translateY(0)';
        cardDiv.style.boxShadow = '';
    });
    
    // 파일 읽기 및 미리보기 생성
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageHtml = `
            <div class="card-img-top position-relative" style="height: 150px; overflow: hidden;">
                <img src="${e.target.result}" alt="미리보기 ${index + 1}" 
                     class="img-fluid h-100 w-100" style="object-fit: cover;">
                <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-secondary order-badge" id="orderBadge_${index}">
                        <i class="fas fa-image me-1"></i>대기
                    </span>
                </div>
                <div class="position-absolute bottom-0 start-0 end-0 p-2 bg-dark bg-opacity-75">
                    <small class="text-white">
                        <i class="fas fa-hand-pointer me-1"></i>클릭하여 순서 지정
                    </small>
                </div>
            </div>
            <div class="card-body p-2">
                <h6 class="card-title mb-1 text-truncate" title="${file.name}">
                    ${file.name}
                </h6>
                <p class="card-text small text-muted mb-2">
                    ${formatFileSize(file.size)}
                </p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="order-status" id="orderStatus_${index}">
                        <small class="text-muted">
                            <i class="fas fa-hand-pointer me-1"></i>클릭하여 순서 지정
                        </small>
                    </div>
                    <button type="button" class="btn btn-outline-danger btn-sm" 
                            onclick="removeImageFromPreview(${index})" 
                            title="이미지 제거">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        cardDiv.innerHTML = imageHtml;
    };
    
    reader.readAsDataURL(file);
    
    colDiv.appendChild(cardDiv);
    container.appendChild(colDiv);
}

// 이미지 순서 클릭 처리
function handleImageOrderClick(index) {
    console.log('🎯 이미지 순서 클릭:', index);
    
    const currentOrder = window.FacilityImageMaster.state.imageOrder;
    const orderIndex = currentOrder.indexOf(index);
    
    if (orderIndex !== -1) {
        // 이미 선택된 이미지 → 순서에서 제거
        const newOrder = [...currentOrder];
        newOrder.splice(orderIndex, 1);
        updateState({ imageOrder: newOrder });
        
        console.log(`🔄 이미지 ${index} 순서 제거 (기존 ${orderIndex + 1}번)`);
        showOrderChangeAnimation(index, 'removed');
        
    } else {
        // 새로운 이미지 → 순서에 추가
        const newOrder = [...currentOrder, index];
        updateState({ imageOrder: newOrder });
        
        console.log(`➕ 이미지 ${index} 순서 추가 (${newOrder.length}번)`);
        showOrderChangeAnimation(index, 'added', newOrder.length);
    }
    
    // UI 업데이트
    updateOrderUI();
    checkOrderCompletion();
}

// 순서 UI 업데이트
function updateOrderUI() {
    const files = window.FacilityImageMaster.state.selectedFiles;
    const orderQueue = window.FacilityImageMaster.state.imageOrder;
    
    files.forEach((file, index) => {
        const orderBadge = document.getElementById(`orderBadge_${index}`);
        const orderStatus = document.getElementById(`orderStatus_${index}`);
        const cardElement = document.querySelector(`[data-index="${index}"] .card`);
        
        if (orderBadge && orderStatus && cardElement) {
            const orderIndex = orderQueue.indexOf(index);
            
            if (orderIndex !== -1) {
                // 순서가 지정된 경우
                const orderNumber = orderIndex + 1;
                orderBadge.className = 'badge bg-success order-badge';
                orderBadge.innerHTML = `<i class="fas fa-check me-1"></i>${orderNumber}번`;
                orderStatus.innerHTML = `<small class="text-success"><i class="fas fa-check-circle me-1"></i>${orderNumber}번째 선택</small>`;
                cardElement.classList.remove('border-secondary');
                cardElement.classList.add('border-success');
            } else {
                // 순서가 지정되지 않은 경우
                orderBadge.className = 'badge bg-secondary order-badge';
                orderBadge.innerHTML = `<i class="fas fa-image me-1"></i>대기`;
                orderStatus.innerHTML = `<small class="text-muted"><i class="fas fa-hand-pointer me-1"></i>클릭하여 순서 지정</small>`;
                cardElement.classList.remove('border-success');
                cardElement.classList.add('border-secondary');
            }
        }
    });
}

// 순서 지정 완료 확인
function checkOrderCompletion() {
    const files = window.FacilityImageMaster.state.selectedFiles;
    const orderQueue = window.FacilityImageMaster.state.imageOrder;
    const proceedToCropBtn = document.getElementById('proceedToCropBtn');
    
    if (orderQueue.length === files.length && files.length > 0) {
        // 모든 이미지에 순서가 지정됨
        if (proceedToCropBtn) {
            proceedToCropBtn.style.display = 'inline-block';
            proceedToCropBtn.classList.add('btn-success');
            proceedToCropBtn.classList.remove('btn-secondary');
            proceedToCropBtn.innerHTML = '<i class="fas fa-crop-alt me-2"></i>크롭 시작 (순서 완료)';
            
            // 버튼 클릭 이벤트
            proceedToCropBtn.onclick = () => proceedToStep2();
        }
        
        showNotification('모든 이미지의 순서가 지정되었습니다! 크롭을 시작할 수 있습니다.', 'success');
    } else {
        if (proceedToCropBtn) {
            proceedToCropBtn.style.display = 'none';
        }
    }
}

// ========================================
// 단계 전환 시스템
// ========================================
function proceedToStep2() {
    console.log('🎨 2단계로 진행 - 크롭 및 편집');
    
    const files = window.FacilityImageMaster.state.selectedFiles;
    const orderQueue = window.FacilityImageMaster.state.imageOrder;
    
    // 순서 확인
    if (orderQueue.length !== files.length) {
        showNotification(`모든 이미지의 순서를 지정해주세요. (${orderQueue.length}/${files.length})`, 'warning');
        return;
    }
    
    // 순서에 따라 파일 재정렬
    const orderedFiles = orderQueue.map(originalIndex => files[originalIndex]);
    updateState({ 
        selectedFiles: orderedFiles,
        currentStep: 2 
    });
    
    // UI 전환
    changeStepUI(2);
    
    // 2단계 기능 활성화
    activateStep2Features(orderedFiles);
    
    triggerEvent('stepChange', { from: 1, to: 2, files: orderedFiles });
}

function proceedToStep3() {
    console.log('💾 3단계로 진행 - 관리 및 저장');
    
    updateState({ currentStep: 3 });
    changeStepUI(3);
    activateStep3Features();
    
    triggerEvent('stepChange', { from: 2, to: 3 });
}

// 단계 UI 변경
function changeStepUI(step) {
    // 모든 단계 섹션 숨기기
    const sections = ['uploadSection', 'cropSection', 'manageSection'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'none';
    });
    
    // 해당 단계 섹션 표시
    const currentSectionId = ['', 'uploadSection', 'cropSection', 'manageSection'][step];
    const currentSection = document.getElementById(currentSectionId);
    if (currentSection) currentSection.style.display = 'block';
    
    // 단계 표시기 업데이트
    updateStepIndicator(step);
}

// 단계 표시기 업데이트
function updateStepIndicator(currentStep) {
    const steps = document.querySelectorAll('.step-item');
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNum < currentStep) {
            step.classList.add('completed');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
        }
    });
}

// ========================================
// 오류 처리 및 복구
// ========================================
function handleError(message, error = null) {
    console.error('❌ 오류 발생:', message, error);
    
    const errorState = {
        hasErrors: true,
        errorMessages: [...window.FacilityImageMaster.state.errorMessages, message],
        isProcessing: false
    };
    
    updateState(errorState);
    showNotification(message, 'error');
    triggerEvent('error', { message, error });
}

function setupErrorRecovery() {
    // 전역 오류 처리
    window.addEventListener('error', (event) => {
        handleError(`JavaScript 오류: ${event.message}`, event.error);
    });
    
    // Promise 거부 처리
    window.addEventListener('unhandledrejection', (event) => {
        handleError(`Promise 거부: ${event.reason}`, event.reason);
    });
}

// ========================================
// 유틸리티 함수들
// ========================================
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showNotification(message, type = 'info') {
    const alertClass = {
        'info': 'alert-info',
        'success': 'alert-success',
        'warning': 'alert-warning',
        'error': 'alert-danger'
    }[type] || 'alert-info';
    
    const icon = {
        'info': 'fas fa-info-circle',
        'success': 'fas fa-check-circle',
        'warning': 'fas fa-exclamation-triangle',
        'error': 'fas fa-times-circle'
    }[type] || 'fas fa-info-circle';
    
    // 기존 알림 제거
    const existingAlert = document.querySelector('.master-notification');
    if (existingAlert) existingAlert.remove();
    
    // 새 알림 생성
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClass} alert-dismissible fade show master-notification position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        <i class="${icon} me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 자동 제거
    setTimeout(() => {
        if (alertDiv.parentNode) alertDiv.remove();
    }, 5000);
}

function showOrderChangeAnimation(index, action, orderNumber = null) {
    const cardElement = document.querySelector(`[data-index="${index}"] .card`);
    
    if (cardElement) {
        cardElement.classList.remove('order-added', 'order-removed');
        
        if (action === 'added') {
            cardElement.classList.add('order-added');
        } else if (action === 'removed') {
            cardElement.classList.add('order-removed');
        }
        
        setTimeout(() => {
            cardElement.classList.remove('order-added', 'order-removed');
        }, 500);
    }
}

function showOrderingInstructions() {
    const instructions = document.createElement('div');
    instructions.className = 'alert alert-info mt-3';
    instructions.innerHTML = `
        <h6><i class="fas fa-hand-pointer me-2"></i>이미지 순서 지정 방법</h6>
        <ol class="mb-0">
            <li>원하는 순서대로 이미지를 클릭하세요</li>
            <li>이미 선택한 이미지를 다시 클릭하면 순서에서 제거됩니다</li>
            <li>모든 이미지의 순서를 지정하면 다음 단계로 진행할 수 있습니다</li>
        </ol>
    `;
    
    const selectedImagesPreview = document.getElementById('selectedImagesPreview');
    if (selectedImagesPreview) {
        // 기존 안내 제거
        const existingInstructions = selectedImagesPreview.querySelector('.alert-info');
        if (existingInstructions) existingInstructions.remove();
        
        selectedImagesPreview.appendChild(instructions);
    }
}

// ========================================
// 전역 함수 노출
// ========================================
window.initializeFacilityImageMaster = initializeFacilityImageMaster;
window.handleImageOrderClick = handleImageOrderClick;
window.removeImageFromPreview = function(index) {
    const files = [...window.FacilityImageMaster.state.selectedFiles];
    const orderQueue = [...window.FacilityImageMaster.state.imageOrder];
    
    // 파일 제거
    files.splice(index, 1);
    
    // 순서 큐에서 해당 인덱스 제거 및 재조정
    const orderIndex = orderQueue.indexOf(index);
    if (orderIndex !== -1) {
        orderQueue.splice(orderIndex, 1);
    }
    
    // 제거된 인덱스보다 큰 모든 인덱스를 1씩 감소
    for (let i = 0; i < orderQueue.length; i++) {
        if (orderQueue[i] > index) {
            orderQueue[i]--;
        }
    }
    
    updateState({ selectedFiles: files, imageOrder: orderQueue });
    
    if (files.length === 0) {
        document.getElementById('selectedImagesPreview').style.display = 'none';
    } else {
        generateImagePreview(files);
    }
};

// ========================================
// 자동 초기화
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // 기존 스크립트와의 충돌 방지를 위해 지연 초기화
    setTimeout(() => {
        if (typeof window.initializeFacilityImageMaster === 'function') {
            initializeFacilityImageMaster();
        }
    }, 100);
});

console.log('✅ 시설 이미지 마스터 컨트롤러 완전 로드 완료');

// ========================================
// 2단계 기능 구현 (크롭 및 편집)
// ========================================
function activateStep2Features(orderedFiles) {
    console.log('🎨 2단계 기능 활성화 - 크롭 및 편집:', orderedFiles.length, '개 파일');
    
    // 현재 이미지 인덱스 초기화
    updateState({ currentImageIndex: 0 });
    
    // 이미지 크롭 UI 설정
    setupImageCropper();
    
    // 첫 번째 이미지 로드
    loadImageForCropping(0);
    
    // 네비게이션 버튼 설정
    setupCroppingNavigation();
    
    // SEO 키워드 시스템 연결
    setupSEOKeywords();
    
    // 압축 설정
    setupImageCompression();
    
    // 진행 상태 표시
    updateCroppingProgress(0, orderedFiles.length);
}

function setupImageCropper() {
    console.log('✂️ 이미지 크롭퍼 설정');
    
    const cropImage = document.getElementById('cropImage');
    const cropContainer = document.getElementById('cropContainer');
    
    if (!cropImage || !cropContainer) {
        console.error('❌ 크롭 요소를 찾을 수 없습니다');
        return;
    }
    
    // 기존 크롭퍼 정리
    if (window.currentCropper) {
        window.currentCropper.destroy();
        window.currentCropper = null;
    }
    
    // 크롭 설정 (16:9 비율)
    const cropperOptions = {
        aspectRatio: 16/9,
        viewMode: 1,
        dragMode: 'move',
        background: false,
        guides: true,
        center: true,
        highlight: true,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        ready: function() {
            console.log('✅ 크롭퍼 준비 완료');
            updateCropperUI();
        },
        crop: function(event) {
            // 실시간 크롭 정보 업데이트
            updateCropInfo(event.detail);
        }
    };
    
    // 크롭퍼 초기화 대기
    if (typeof Cropper !== 'undefined') {
        window.currentCropper = new Cropper(cropImage, cropperOptions);
    } else {
        console.error('❌ Cropper.js를 찾을 수 없습니다');
    }
}

function loadImageForCropping(index) {
    console.log('📷 이미지 로드 for 크롭:', index);
    
    const files = window.FacilityImageMaster.state.selectedFiles;
    const file = files[index];
    
    if (!file) {
        console.error('❌ 파일을 찾을 수 없습니다:', index);
        return;
    }
    
    const cropImage = document.getElementById('cropImage');
    if (!cropImage) return;
    
    // 파일 읽기
    const reader = new FileReader();
    reader.onload = function(e) {
        cropImage.src = e.target.result;
        
        // 크롭퍼 업데이트
        if (window.currentCropper) {
            window.currentCropper.replace(e.target.result);
        }
        
        // 파일 정보 업데이트
        updateCurrentImageInfo(file, index);
    };
    
    reader.readAsDataURL(file);
}

function setupCroppingNavigation() {
    console.log('🧭 크롭 네비게이션 설정');
    
    // 이전/다음 버튼
    const prevBtn = document.getElementById('prevImageBtn');
    const nextBtn = document.getElementById('nextImageBtn');
    const completeBtn = document.getElementById('completeCropBtn');
    const skipBtn = document.getElementById('skipCropBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const currentIndex = window.FacilityImageMaster.state.currentImageIndex || 0;
            if (currentIndex > 0) {
                saveCropAndMove(currentIndex - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const currentIndex = window.FacilityImageMaster.state.currentImageIndex || 0;
            const files = window.FacilityImageMaster.state.selectedFiles;
            if (currentIndex < files.length - 1) {
                saveCropAndMove(currentIndex + 1);
            }
        });
    }
    
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            completeCropping();
        });
    }
    
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            skipCurrentCrop();
        });
    }
}

function saveCropAndMove(newIndex) {
    console.log('💾 크롭 저장 및 이동:', newIndex);
    
    // 현재 크롭 저장
    const currentIndex = window.FacilityImageMaster.state.currentImageIndex || 0;
    saveCroppedImage(currentIndex);
    
    // 새 이미지 로드
    updateState({ currentImageIndex: newIndex });
    loadImageForCropping(newIndex);
    
    // 진행 상태 업데이트
    const files = window.FacilityImageMaster.state.selectedFiles;
    updateCroppingProgress(newIndex, files.length);
}

function saveCroppedImage(index) {
    if (!window.currentCropper) return;
    
    const canvas = window.currentCropper.getCroppedCanvas({
        width: 1920,
        height: 1080,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });
    
    if (canvas) {
        // 압축된 이미지 생성
        canvas.toBlob((blob) => {
            const processedImages = window.FacilityImageMaster.state.processedImages || [];
            processedImages[index] = blob;
            updateState({ processedImages });
            
            console.log('✅ 이미지 크롭 완료:', index, blob.size, 'bytes');
        }, 'image/jpeg', 0.8);
    }
}

function completeCropping() {
    console.log('🎯 크롭 완료 처리');
    
    // 마지막 이미지 저장
    const currentIndex = window.FacilityImageMaster.state.currentImageIndex || 0;
    saveCroppedImage(currentIndex);
    
    // 3단계로 진행
    setTimeout(() => {
        proceedToStep3();
    }, 500);
}

function updateCroppingProgress(current, total) {
    const progressBar = document.getElementById('croppingProgressBar');
    const progressText = document.getElementById('croppingProgressText');
    
    if (progressBar) {
        const percentage = ((current + 1) / total) * 100;
        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', percentage);
    }
    
    if (progressText) {
        progressText.textContent = `${current + 1} / ${total}`;
    }
}

// ========================================
// 3단계 기능 구현 (관리 및 저장)
// ========================================
function activateStep3Features() {
    console.log('💾 3단계 기능 활성화 - 관리 및 저장');
    
    // 이미지 관리 그리드 생성
    setupImageManagement();
    
    // 서버 업로드 준비
    setupServerUpload();
    
    // 순서 재정렬 기능
    setupImageReordering();
    
    // 최종 업로드 버튼 활성화
    enableFinalUpload();
}

function setupImageManagement() {
    console.log('📋 이미지 관리 설정');
    
    const manageGrid = document.getElementById('manageImagesGrid');
    if (!manageGrid) return;
    
    const processedImages = window.FacilityImageMaster.state.processedImages || [];
    const selectedFiles = window.FacilityImageMaster.state.selectedFiles || [];
    
    manageGrid.innerHTML = '';
    
    processedImages.forEach((blob, index) => {
        if (blob) {
            const originalFile = selectedFiles[index];
            const imageCard = createImageManagementCard(blob, originalFile, index);
            manageGrid.appendChild(imageCard);
        }
    });
}

function createImageManagementCard(blob, originalFile, index) {
    const card = document.createElement('div');
    card.className = 'col-md-4 mb-3';
    card.dataset.imageIndex = index;
    
    const imageUrl = URL.createObjectURL(blob);
    
    card.innerHTML = `
        <div class="card h-100">
            <div class="card-img-top position-relative">
                <img src="${imageUrl}" class="img-fluid" style="aspect-ratio: 16/9; object-fit: cover;">
                <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-primary">${index + 1}</span>
                </div>
            </div>
            <div class="card-body p-2">
                <h6 class="card-title mb-1">${originalFile.name}</h6>
                <p class="card-text small text-muted mb-2">
                    ${formatFileSize(blob.size)}
                </p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editImage(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="removeImage(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="mainImage${index}" 
                               onchange="setMainImage(${index})">
                        <label class="form-check-label small" for="mainImage${index}">메인</label>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function setupServerUpload() {
    console.log('🚀 서버 업로드 설정');
    
    const uploadBtn = document.getElementById('finalUploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            performFinalUpload();
        });
    }
}

function performFinalUpload() {
    console.log('📤 최종 업로드 시작');
    
    const processedImages = window.FacilityImageMaster.state.processedImages || [];
    const facilityId = window.FacilityImageMaster.state.facilityId;
    
    if (!facilityId) {
        showNotification('시설 ID를 찾을 수 없습니다.', 'error');
        return;
    }
    
    updateState({ isProcessing: true });
    
    // FormData 생성
    const formData = new FormData();
    formData.append('facilityId', facilityId);
    
    processedImages.forEach((blob, index) => {
        if (blob) {
            formData.append('images', blob, `facility-image-${index + 1}.jpg`);
        }
    });
    
    // 서버 업로드
    fetch('/facility/facility-images/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('이미지 업로드가 완료되었습니다!', 'success');
            updateState({ uploadedImages: data.images });
            
            // 성공 후 관리 페이지로 이동
            setTimeout(() => {
                window.location.href = '/facility/manage';
            }, 2000);
        } else {
            throw new Error(data.message || '업로드 실패');
        }
    })
    .catch(error => {
        console.error('❌ 업로드 오류:', error);
        handleError('이미지 업로드 중 오류가 발생했습니다: ' + error.message);
    })
    .finally(() => {
        updateState({ isProcessing: false });
    });
}

function setupImageReordering() {
    console.log('🔄 이미지 순서 재정렬 설정');
    
    // 드래그 앤 드롭으로 순서 변경 (추후 구현)
    const manageGrid = document.getElementById('manageImagesGrid');
    if (manageGrid) {
        // Sortable.js 연동 예정
        console.log('순서 재정렬 기능 준비됨');
    }
}

function enableFinalUpload() {
    const uploadBtn = document.getElementById('finalUploadBtn');
    if (uploadBtn) {
        uploadBtn.disabled = false;
        uploadBtn.classList.remove('btn-secondary');
        uploadBtn.classList.add('btn-success');
        uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt me-2"></i>시설 이미지 업로드';
    }
}

// ========================================
// SEO 키워드 시스템 연결
// ========================================
function setupSEOKeywords() {
    console.log('🏷️ SEO 키워드 시스템 연결');
    
    // 키워드 선택기 생성
    const keywordContainer = document.getElementById('keywordContainer');
    if (keywordContainer && typeof createKeywordSelector === 'function') {
        createKeywordSelector('keywordContainer');
    }
    
    // 키워드 드롭다운 생성
    const keywordDropdown = document.getElementById('keywordDropdown');
    if (keywordDropdown && typeof createKeywordDropdown === 'function') {
        createKeywordDropdown('keywordDropdown');
    }
}

function setupImageCompression() {
    console.log('🗜️ 이미지 압축 설정');
    
    // 압축 설정은 크롭퍼에서 자동으로 처리됨
    // 필요시 추가 압축 로직 구현
}

// ========================================
// 드래그 앤 드롭 설정
// ========================================
function setupDragAndDrop(uploadArea) {
    console.log('🎯 드래그 앤 드롭 설정');
    
    if (!uploadArea) return;
    
    // 드래그 이벤트 처리
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files, 'drag-drop');
        }
    });
}

// ========================================
// 단계 네비게이션 설정
// ========================================
function setupStepNavigation() {
    console.log('🧭 단계 네비게이션 설정');
    
    // 뒤로 가기 버튼들
    const backToStep1Btn = document.getElementById('backToStep1Btn');
    const backToStep2Btn = document.getElementById('backToStep2Btn');
    
    if (backToStep1Btn) {
        backToStep1Btn.addEventListener('click', () => {
            updateState({ currentStep: 1 });
            changeStepUI(1);
        });
    }
    
    if (backToStep2Btn) {
        backToStep2Btn.addEventListener('click', () => {
            updateState({ currentStep: 2 });
            changeStepUI(2);
        });
    }
}

// ========================================
// 글로벌 이벤트 리스너 설정
// ========================================
function setupGlobalEventListeners() {
    console.log('🌐 글로벌 이벤트 리스너 설정');
    
    // 페이지 언로드 시 정리
    window.addEventListener('beforeunload', () => {
        if (window.currentCropper) {
            window.currentCropper.destroy();
        }
        
        // 생성된 Object URL 정리
        const processedImages = window.FacilityImageMaster.state.processedImages || [];
        processedImages.forEach(blob => {
            if (blob && blob instanceof Blob) {
                URL.revokeObjectURL(blob);
            }
        });
    });
    
    // 키보드 단축키
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    // 이전 이미지로
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    // 다음 이미지로
                    break;
                case 'Enter':
                    e.preventDefault();
                    // 크롭 완료
                    break;
            }
        }
    });
}

// ========================================
// 기존 이미지 로드 (편집 모드)
// ========================================
function loadExistingImages() {
    console.log('📂 기존 이미지 로드 확인');
    
    const facilityId = window.FacilityImageMaster.state.facilityId;
    if (!facilityId) return;
    
    // API 호출하여 기존 이미지 정보 가져오기
    fetch(`/facility/facility-images/${facilityId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.images && data.images.length > 0) {
                console.log('📷 기존 이미지 발견:', data.images.length, '개');
                updateState({ uploadedImages: data.images });
                
                // 편집 모드 UI 표시
                showEditModeUI();
            }
        })
        .catch(error => {
            console.log('ℹ️ 기존 이미지 없음 (새 업로드 모드)');
        });
}

function showEditModeUI() {
    const editModeIndicator = document.getElementById('editModeIndicator');
    if (editModeIndicator) {
        editModeIndicator.style.display = 'block';
        editModeIndicator.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                기존 이미지를 수정하는 모드입니다. 새 이미지를 업로드하면 기존 이미지가 교체됩니다.
            </div>
        `;
    }
}

// ========================================
// 추가 유틸리티 함수들
// ========================================
function updateCropperUI() {
    // 크롭퍼 UI 업데이트
    const cropperContainer = document.querySelector('.cropper-container');
    if (cropperContainer) {
        cropperContainer.style.maxHeight = '500px';
    }
}

function updateCropInfo(detail) {
    const cropInfo = document.getElementById('cropInfo');
    if (cropInfo) {
        cropInfo.innerHTML = `
            <small class="text-muted">
                크롭 영역: ${Math.round(detail.width)} × ${Math.round(detail.height)}
            </small>
        `;
    }
}

function updateCurrentImageInfo(file, index) {
    const imageInfo = document.getElementById('currentImageInfo');
    if (imageInfo) {
        imageInfo.innerHTML = `
            <h6>${file.name}</h6>
            <small class="text-muted">
                ${formatFileSize(file.size)} | ${index + 1}번째 이미지
            </small>
        `;
    }
}

function skipCurrentCrop() {
    const currentIndex = window.FacilityImageMaster.state.currentImageIndex || 0;
    const files = window.FacilityImageMaster.state.selectedFiles;
    
    if (currentIndex < files.length - 1) {
        saveCropAndMove(currentIndex + 1);
    } else {
        completeCropping();
    }
}

// 전역 함수로 노출
window.editImage = function(index) {
    console.log('✏️ 이미지 편집:', index);
    // 해당 이미지를 2단계로 다시 불러와서 편집
    updateState({ currentStep: 2, currentImageIndex: index });
    changeStepUI(2);
    loadImageForCropping(index);
};

window.removeImage = function(index) {
    console.log('🗑️ 이미지 제거:', index);
    const processedImages = [...window.FacilityImageMaster.state.processedImages];
    processedImages.splice(index, 1);
    updateState({ processedImages });
    setupImageManagement();
};

window.setMainImage = function(index) {
    console.log('⭐ 메인 이미지 설정:', index);
    updateState({ mainImageIndex: index });
    
    // 다른 체크박스 해제
    document.querySelectorAll('[id^="mainImage"]').forEach((checkbox, i) => {
        checkbox.checked = i === index;
    });
};