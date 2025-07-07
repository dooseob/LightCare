/**
 * 시설 이미지 업로드 1단계 순수 JavaScript (타임리프 충돌 방지)
 * 이미지 선택 -> 미리보기 테이블 -> 클릭으로 순서 지정 -> 2단계 진행
 * 모든 기존 기능 유지하면서 타임리프 인라인 문제 해결
 */

console.log('🎯 시설 이미지 1단계 순수 JavaScript 로드됨 (타임리프 충돌 방지)');

// 전역 네임스페이스 (충돌 방지)
window.FacilityImageStep1Pure = {
    // 상태 관리
    state: {
        selectedFiles: [],
        imageOrder: [],
        maxImages: 5,
        facilityId: null,
        isProcessing: false
    },
    
    // DOM 요소 캐시
    elements: {},
    
    // 이벤트 리스너 관리
    listeners: []
};

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 시설 이미지 1단계 순수 초기화 시작');
    
    // 시설 ID 추출
    extractFacilityId();
    
    // DOM 요소 초기화
    initializeElements();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 기존 이미지 로드
    loadExistingImages();
    
    console.log('✅ 시설 이미지 1단계 순수 초기화 완료');
});

/**
 * 시설 ID 추출 (여러 방법 시도)
 */
function extractFacilityId() {
    try {
        // 1. URL에서 추출
        const pathParts = window.location.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        if (!isNaN(lastPart) && lastPart !== '') {
            window.FacilityImageStep1Pure.state.facilityId = parseInt(lastPart);
        }
        
        // 2. 메타 태그에서 추출
        if (!window.FacilityImageStep1Pure.state.facilityId) {
            const metaTag = document.querySelector('meta[name="facility-id"]');
            if (metaTag) {
                window.FacilityImageStep1Pure.state.facilityId = parseInt(metaTag.getAttribute('content'));
            }
        }
        
        console.log('🏢 추출된 시설 ID:', window.FacilityImageStep1Pure.state.facilityId);
        
    } catch (error) {
        console.error('❌ 시설 ID 추출 오류:', error);
    }
}

/**
 * DOM 요소 초기화
 */
function initializeElements() {
    const elements = window.FacilityImageStep1Pure.elements;
    
    // 기본 요소들
    elements.imageLoadBtn = document.getElementById('imageLoadBtn');
    elements.fileSelectOption = document.getElementById('fileSelectOption');
    elements.folderSelectOption = document.getElementById('folderSelectOption');
    elements.imageInput = document.getElementById('imageInput');
    elements.folderInput = document.getElementById('folderInput');
    elements.uploadArea = document.getElementById('uploadArea');
    
    // 미리보기 관련
    elements.selectedImagesPreview = document.getElementById('selectedImagesPreview');
    elements.imageOrderList = document.getElementById('imageOrderList');
    elements.selectedCount = document.getElementById('selectedCount');
    elements.proceedToCropBtn = document.getElementById('proceedToCropBtn');
    
    console.log('📋 DOM 요소 초기화 완료:', {
        imageLoadBtn: !!elements.imageLoadBtn,
        imageInput: !!elements.imageInput,
        uploadArea: !!elements.uploadArea,
        selectedImagesPreview: !!elements.selectedImagesPreview
    });
}

/**
 * 기존 이벤트 리스너 제거
 */
function removeExistingListeners() {
    const listeners = window.FacilityImageStep1Pure.listeners;
    
    listeners.forEach(listener => {
        if (listener.element) {
            listener.element.removeEventListener(listener.event, listener.handler);
        }
    });
    
    // 리스너 배열 초기화
    window.FacilityImageStep1Pure.listeners = [];
    console.log('🧹 기존 이벤트 리스너 제거 완료');
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 기존 리스너 제거 (중복 방지)
    removeExistingListeners();
    
    const elements = window.FacilityImageStep1Pure.elements;
    
    // 이미지 불러오기 버튼 (메인)
    if (elements.imageLoadBtn) {
        const listener1 = () => {
            console.log('🎯 메인 이미지 불러오기 버튼 클릭');
            if (elements.imageInput) {
                elements.imageInput.click();
            }
        };
        elements.imageLoadBtn.addEventListener('click', listener1);
        window.FacilityImageStep1Pure.listeners.push({element: elements.imageLoadBtn, event: 'click', handler: listener1});
    }
    
    // 파일 선택 드롭다운
    if (elements.fileSelectOption) {
        const listener2 = (e) => {
            e.preventDefault();
            console.log('📁 파일 선택 옵션 클릭');
            if (elements.imageInput) {
                elements.imageInput.click();
            }
        };
        elements.fileSelectOption.addEventListener('click', listener2);
        window.FacilityImageStep1Pure.listeners.push({element: elements.fileSelectOption, event: 'click', handler: listener2});
    }
    
    // 폴더 선택 드롭다운
    if (elements.folderSelectOption) {
        const listener3 = (e) => {
            e.preventDefault();
            console.log('📂 폴더 선택 옵션 클릭');
            if (elements.folderInput) {
                elements.folderInput.click();
            }
        };
        elements.folderSelectOption.addEventListener('click', listener3);
        window.FacilityImageStep1Pure.listeners.push({element: elements.folderSelectOption, event: 'click', handler: listener3});
    }
    
    // 파일 입력 변경 이벤트 (핵심)
    if (elements.imageInput) {
        const listener4 = (e) => {
            console.log('📁 파일 입력 변경 이벤트:', e.target.files.length, '개 파일');
            handleFileSelection(e.target.files, 'file');
        };
        elements.imageInput.addEventListener('change', listener4);
        window.FacilityImageStep1Pure.listeners.push({element: elements.imageInput, event: 'change', handler: listener4});
    }
    
    // 폴더 입력 변경 이벤트
    if (elements.folderInput) {
        const listener5 = (e) => {
            console.log('📂 폴더 입력 변경 이벤트:', e.target.files.length, '개 파일');
            handleFileSelection(e.target.files, 'folder');
        };
        elements.folderInput.addEventListener('change', listener5);
        window.FacilityImageStep1Pure.listeners.push({element: elements.folderInput, event: 'change', handler: listener5});
    }
    
    // 드래그 앤 드롭
    if (elements.uploadArea) {
        setupDragAndDrop();
    }
    
    // 이미지 더 추가 버튼
    const addMoreImagesBtn = document.getElementById('addMoreImagesBtn');
    if (addMoreImagesBtn) {
        addMoreImagesBtn.style.display = 'none';
        
        const listener6 = () => {
            console.log('➕ 이미지 더 추가 버튼 클릭');
            if (elements.imageInput) {
                elements.imageInput.click();
            }
        };
        addMoreImagesBtn.addEventListener('click', listener6);
        window.FacilityImageStep1Pure.listeners.push({element: addMoreImagesBtn, event: 'click', handler: listener6});
    }
    
    // 크롭 진행 버튼 (초기에는 숨김)
    if (elements.proceedToCropBtn) {
        elements.proceedToCropBtn.style.display = 'none';
        
        const listener7 = () => {
            console.log('🎨 크롭 단계로 진행');
            proceedToStep2();
        };
        elements.proceedToCropBtn.addEventListener('click', listener7);
        window.FacilityImageStep1Pure.listeners.push({element: elements.proceedToCropBtn, event: 'click', handler: listener7});
    }
    
    console.log('🔗 이벤트 리스너 설정 완료:', window.FacilityImageStep1Pure.listeners.length, '개');
}

/**
 * 파일 선택 처리 (핵심 함수)
 */
function handleFileSelection(files, source) {
    console.log(`📁 파일 선택 처리 시작 - ${source}:`, files.length, '개');
    
    const state = window.FacilityImageStep1Pure.state;
    
    if (state.isProcessing) {
        console.warn('⚠️ 이미 처리 중입니다');
        return;
    }
    
    state.isProcessing = true;
    
    try {
        // 1. 이미지 파일만 필터링
        const imageFiles = Array.from(files).filter(file => 
            file.type.startsWith('image/')
        );
        
        console.log('🖼️ 이미지 파일 필터링:', imageFiles.length, '개');
        
        if (imageFiles.length === 0) {
            showNotification('이미지 파일을 선택해주세요.', 'warning');
            return;
        }
        
        // 2. 최대 개수 체크
        if (imageFiles.length > state.maxImages) {
            showNotification(`최대 ${state.maxImages}장까지만 선택할 수 있습니다. 처음 ${state.maxImages}장을 선택합니다.`, 'info');
            imageFiles.splice(state.maxImages);
        }
        
        // 3. 상태 업데이트 (기존 파일에 추가)
        const currentCount = state.selectedFiles.length;
        const newFiles = imageFiles.slice(0, state.maxImages - currentCount);
        
        if (newFiles.length < imageFiles.length) {
            showNotification(`최대 ${state.maxImages}장까지만 추가할 수 있습니다. ${newFiles.length}장을 추가합니다.`, 'info');
        }
        
        // 기존 파일 목록에 새 파일 추가
        state.selectedFiles = [...state.selectedFiles, ...newFiles];
        
        // 기존 순서는 유지하고 새 파일의 인덱스만 추가
        // (새 파일은 순서가 지정되지 않은 상태로 추가됨)
        
        // 4. 미리보기 테이블 생성 (전체 파일 목록 사용)
        generateImagePreviewTable(state.selectedFiles);
        
        console.log('✅ 파일 선택 처리 완료:', newFiles.length, '개 추가됨, 총', state.selectedFiles.length, '개');
        
    } catch (error) {
        console.error('❌ 파일 선택 처리 오류:', error);
        showNotification('파일 처리 중 오류가 발생했습니다: ' + error.message, 'error');
    } finally {
        state.isProcessing = false;
    }
}

/**
 * 이미지 미리보기 테이블 생성 (신규 구현)
 */
function generateImagePreviewTable(files) {
    console.log('🖼️ 이미지 미리보기 테이블 생성:', files.length, '개');
    
    const elements = window.FacilityImageStep1Pure.elements;
    
    if (!elements.selectedImagesPreview || !elements.imageOrderList) {
        console.error('❌ 미리보기 요소를 찾을 수 없습니다');
        return;
    }
    
    // 미리보기 영역 표시
    elements.selectedImagesPreview.style.display = 'block';
    
    // 선택된 이미지 수 업데이트
    if (elements.selectedCount) {
        elements.selectedCount.textContent = files.length;
    }
    
    // 기존 내용 초기화
    elements.imageOrderList.innerHTML = '';
    
    // 안내 메시지 추가
    const instructionDiv = document.createElement('div');
    instructionDiv.className = 'alert alert-info mb-3';
    instructionDiv.innerHTML = `
        <h6><i class="fas fa-hand-pointer me-2"></i>이미지 순서 지정 방법</h6>
        <ol class="mb-0">
            <li>원하는 순서대로 이미지를 클릭하세요 (최대 ${window.FacilityImageStep1Pure.state.maxImages}장)</li>
            <li>이미 선택한 이미지를 다시 클릭하면 순서에서 제거됩니다</li>
            <li>모든 이미지의 순서를 지정하면 다음 단계로 진행할 수 있습니다</li>
        </ol>
    `;
    elements.imageOrderList.appendChild(instructionDiv);
    
    // 각 파일에 대해 미리보기 카드 생성
    files.forEach((file, index) => {
        createImagePreviewCard(file, index);
    });
    
    console.log('✅ 이미지 미리보기 테이블 생성 완료');
}

/**
 * 개별 이미지 미리보기 카드 생성
 */
function createImagePreviewCard(file, index) {
    const elements = window.FacilityImageStep1Pure.elements;
    
    // 카드 컨테이너 생성
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-4 col-sm-6 mb-3';
    colDiv.dataset.index = index;
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card border-secondary h-100 image-order-item';
    cardDiv.style.cursor = 'pointer';
    cardDiv.style.transition = 'all 0.3s ease';
    
    // 클릭 이벤트 (순서 지정)
    const clickHandler = () => handleImageOrderClick(index);
    cardDiv.addEventListener('click', clickHandler);
    
    // 마우스 호버 효과
    cardDiv.addEventListener('mouseenter', () => {
        cardDiv.style.transform = 'translateY(-2px)';
        cardDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
    
    cardDiv.addEventListener('mouseleave', () => {
        cardDiv.style.transform = 'translateY(0)';
        cardDiv.style.boxShadow = '';
    });
    
    // 기존 이미지인지 새 파일인지 구분하여 처리
    if (file.isExisting) {
        // 기존 이미지: 서버의 이미지 URL 사용
        const imageUrl = file.imagePath;
        const fileName = file.altText || file.name;
        const fileSize = file.size > 0 ? formatFileSize(file.size) : '서버 이미지';
        
        cardDiv.innerHTML = `
            <div class="card-img-top position-relative" style="height: 150px; overflow: hidden;">
                <img src="${imageUrl}" alt="${fileName}" 
                     class="img-fluid h-100 w-100" style="object-fit: cover;">
                <div class="position-absolute top-0 start-0 m-2">
                    <span class="badge bg-info">
                        <i class="fas fa-database me-1"></i>기존
                    </span>
                </div>
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
                <h6 class="card-title mb-1 text-truncate" title="${fileName}">
                    ${fileName}
                </h6>
                <p class="card-text small text-muted mb-2">
                    ${fileSize}
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
    } else {
        // 새 파일: FileReader로 읽기
        const reader = new FileReader();
        reader.onload = function(e) {
            cardDiv.innerHTML = `
                <div class="card-img-top position-relative" style="height: 150px; overflow: hidden;">
                    <img src="${e.target.result}" alt="미리보기 ${index + 1}" 
                         class="img-fluid h-100 w-100" style="object-fit: cover;">
                    <div class="position-absolute top-0 start-0 m-2">
                        <span class="badge bg-success">
                            <i class="fas fa-plus me-1"></i>새로운
                        </span>
                    </div>
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
        };
        
        reader.readAsDataURL(file);
    }
    
    colDiv.appendChild(cardDiv);
    elements.imageOrderList.appendChild(colDiv);
}

/**
 * 이미지 순서 클릭 처리 (핵심 기능)
 */
function handleImageOrderClick(index) {
    console.log('🎯 이미지 순서 클릭:', index);
    
    const state = window.FacilityImageStep1Pure.state;
    const orderIndex = state.imageOrder.indexOf(index);
    
    if (orderIndex !== -1) {
        // 이미 선택된 이미지 → 순서에서 제거
        state.imageOrder.splice(orderIndex, 1);
        console.log(`🔄 이미지 ${index} 순서 제거 (기존 ${orderIndex + 1}번)`);
        showOrderChangeAnimation(index, 'removed');
        
    } else {
        // 새로운 이미지 → 순서에 추가
        state.imageOrder.push(index);
        console.log(`➕ 이미지 ${index} 순서 추가 (${state.imageOrder.length}번)`);
        showOrderChangeAnimation(index, 'added', state.imageOrder.length);
    }
    
    // UI 업데이트
    updateOrderUI();
    checkOrderCompletion();
}

/**
 * 순서 UI 업데이트
 */
function updateOrderUI() {
    const state = window.FacilityImageStep1Pure.state;
    
    state.selectedFiles.forEach((file, index) => {
        const orderBadge = document.getElementById(`orderBadge_${index}`);
        const orderStatus = document.getElementById(`orderStatus_${index}`);
        const cardElement = document.querySelector(`[data-index="${index}"] .card`);
        
        if (orderBadge && orderStatus && cardElement) {
            const orderIndex = state.imageOrder.indexOf(index);
            
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

/**
 * 순서 지정 완료 확인
 */
function checkOrderCompletion() {
    const state = window.FacilityImageStep1Pure.state;
    const elements = window.FacilityImageStep1Pure.elements;
    const addMoreImagesBtn = document.getElementById('addMoreImagesBtn');
    
    if (state.imageOrder.length === state.selectedFiles.length && state.selectedFiles.length > 0) {
        // 모든 이미지에 순서가 지정됨
        if (elements.proceedToCropBtn) {
            elements.proceedToCropBtn.style.display = 'inline-block';
            elements.proceedToCropBtn.classList.add('btn-success');
            elements.proceedToCropBtn.classList.remove('btn-secondary');
            elements.proceedToCropBtn.innerHTML = '<i class="fas fa-crop-alt me-2"></i>크롭 시작 (순서 완료)';
        }
        
        // 최대 개수에 도달하지 않았으면 "이미지 더 추가" 버튼 표시
        if (addMoreImagesBtn && state.selectedFiles.length < state.maxImages) {
            addMoreImagesBtn.style.display = 'inline-block';
        }
        
        showNotification('모든 이미지의 순서가 지정되었습니다! 크롭을 시작하거나 이미지를 더 추가할 수 있습니다.', 'success');
    } else {
        if (elements.proceedToCropBtn) {
            elements.proceedToCropBtn.style.display = 'none';
        }
        
        // 이미지가 있지만 순서가 완료되지 않은 경우에도 "이미지 더 추가" 버튼 표시
        if (addMoreImagesBtn && state.selectedFiles.length > 0 && state.selectedFiles.length < state.maxImages) {
            addMoreImagesBtn.style.display = 'inline-block';
        } else if (addMoreImagesBtn) {
            addMoreImagesBtn.style.display = 'none';
        }
    }
}

/**
 * 2단계로 진행
 */
function proceedToStep2() {
    console.log('🎨 2단계로 진행 - 크롭 및 편집');
    
    const state = window.FacilityImageStep1Pure.state;
    
    // 순서 확인
    if (state.imageOrder.length !== state.selectedFiles.length) {
        showNotification(`모든 이미지의 순서를 지정해주세요. (${state.imageOrder.length}/${state.selectedFiles.length})`, 'warning');
        return;
    }
    
    // 순서에 따라 파일 재정렬
    const orderedFiles = state.imageOrder.map(originalIndex => state.selectedFiles[originalIndex]);
    
    // 기존 시스템과 호환을 위한 전역 상태 설정
    if (typeof window.facilityImageCropper !== 'undefined') {
        // 크롭퍼 시스템에 파일 전달
        window.facilityImageCropper.setFiles(orderedFiles);
        window.facilityImageCropper.moveToStep(2);
    } else if (typeof window.FacilityImageUploader !== 'undefined') {
        // 업로더 시스템에 파일 전달
        const uploader = new window.FacilityImageUploader('uploadSection');
        uploader.setSelectedFiles(orderedFiles);
        uploader.moveToStep(2);
    } else {
        // 기본 DOM 조작으로 2단계 진행
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('cropSection').style.display = 'block';
        
        // 단계 표시기 업데이트
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step2').classList.add('active');
        
        // 크롭 시스템에 파일 정보 전달
        if (typeof window.initializeCropSystem === 'function') {
            window.initializeCropSystem(orderedFiles);
        }
    }
    
    console.log('✅ 2단계 진행 완료 - 정렬된 파일:', orderedFiles.length, '개');
}

/**
 * 드래그 앤 드롭 설정
 */
function setupDragAndDrop() {
    const elements = window.FacilityImageStep1Pure.elements;
    
    if (!elements.uploadArea) return;
    
    console.log('🎯 드래그 앤 드롭 설정');
    
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('dragover');
    });
    
    elements.uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('dragover');
    });
    
    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            console.log('📂 드롭된 파일:', files.length, '개');
            handleFileSelection(files, 'drag-drop');
        }
    });
}

/**
 * 유틸리티 함수들
 */
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
    const existingAlert = document.querySelector('.step1-notification');
    if (existingAlert) existingAlert.remove();
    
    // 새 알림 생성
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClass} alert-dismissible fade show step1-notification position-fixed`;
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

/**
 * 전역 함수로 노출 (기존 기능 호환)
 */
window.removeImageFromPreview = function(index) {
    console.log('🗑️ 이미지 제거:', index);
    
    const state = window.FacilityImageStep1Pure.state;
    
    // 파일 제거
    state.selectedFiles.splice(index, 1);
    
    // 순서 큐에서 해당 인덱스 제거 및 재조정
    const orderIndex = state.imageOrder.indexOf(index);
    if (orderIndex !== -1) {
        state.imageOrder.splice(orderIndex, 1);
    }
    
    // 제거된 인덱스보다 큰 모든 인덱스를 1씩 감소
    for (let i = 0; i < state.imageOrder.length; i++) {
        if (state.imageOrder[i] > index) {
            state.imageOrder[i]--;
        }
    }
    
    if (state.selectedFiles.length === 0) {
        const elements = window.FacilityImageStep1Pure.elements;
        if (elements.selectedImagesPreview) {
            elements.selectedImagesPreview.style.display = 'none';
        }
    } else {
        generateImagePreviewTable(state.selectedFiles);
    }
};

// CSS 스타일 추가 (애니메이션 효과)
const style = document.createElement('style');
style.textContent = `
    .order-added {
        animation: orderAdded 0.5s ease;
    }
    
    .order-removed {
        animation: orderRemoved 0.5s ease;
    }
    
    @keyframes orderAdded {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); background-color: #d4edda; }
        100% { transform: scale(1); }
    }
    
    @keyframes orderRemoved {
        0% { transform: scale(1); }
        50% { transform: scale(0.95); background-color: #f8d7da; }
        100% { transform: scale(1); }
    }
    
    .dragover {
        background-color: #e3f2fd !important;
        border: 2px dashed #2196f3 !important;
    }
`;
document.head.appendChild(style);

/**
 * 기존 데이터베이스 이미지 로드
 */
function loadExistingImages() {
    const state = window.FacilityImageStep1Pure.state;
    
    if (!state.facilityId) {
        console.warn('⚠️ 시설 ID가 없어 기존 이미지를 로드할 수 없습니다');
        return;
    }
    
    console.log('📋 기존 이미지 로드 시작 - facilityId:', state.facilityId);
    
    // API 호출
    fetch(`/facility/facility-images/${state.facilityId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.images && data.images.length > 0) {
                console.log('✅ 기존 이미지 로드 성공:', data.images.length, '개');
                
                // 기존 이미지들을 가상 파일 객체로 변환
                const existingImageFiles = data.images.map((image, index) => {
                    return createVirtualFileFromImage(image, index);
                });
                
                // 상태에 기존 이미지 추가
                state.selectedFiles = existingImageFiles;
                
                // 기존 이미지들의 순서 설정 (이미 DB에 저장된 순서대로)
                state.imageOrder = existingImageFiles.map((_, index) => index);
                
                // 미리보기 테이블 생성
                generateImagePreviewTable(state.selectedFiles);
                
                console.log('🔄 기존 이미지', existingImageFiles.length, '개가 1단계에 로드됨');
                
            } else {
                console.log('ℹ️ 기존 이미지가 없습니다');
            }
        })
        .catch(error => {
            console.error('❌ 기존 이미지 로드 오류:', error);
        });
}

/**
 * 이미지 DTO를 가상 파일 객체로 변환
 */
function createVirtualFileFromImage(imageDto, index) {
    // 가상 파일 객체 생성
    const virtualFile = {
        name: `기존이미지_${index + 1}.jpg`,
        size: 0, // 크기는 알 수 없음
        type: 'image/jpeg',
        lastModified: new Date(imageDto.uploadDate || Date.now()).getTime(),
        // 추가 속성들
        isExisting: true,
        imageId: imageDto.imageId,
        imagePath: imageDto.imagePath,
        altText: imageDto.imageAltText,
        isMainImage: imageDto.isMainImage,
        imageOrder: imageDto.imageOrder
    };
    
    return virtualFile;
}

console.log('✅ 시설 이미지 1단계 순수 JavaScript 완전 로드됨');