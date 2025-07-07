/**
 * 시설 이미지 업로드 1단계 - 이미지 불러오기 및 오더 설정
 * 파일선택과 폴더선택 통합, 최대 5장 이미지 표시, 수동 오더 설정
 */

console.log('🎯 시설 이미지 1단계 로드 스크립트 로드됨');

// 전역 변수 (네임스페이스 사용으로 충돌 방지)
window.facilityImageStep1 = window.facilityImageStep1 || {
    selectedFiles: [],
    maxImages: 5,
    isProcessing: false,
    dragCounter: 0,
    orderQueue: [], // 클릭 순서로 오더를 지정하기 위한 큐
    isOrderingMode: false // 순서 지정 모드
};

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 시설 이미지 1단계 초기화 시작');
    
    // DOM 요소 확인
    const elements = {
        imageLoadBtn: document.getElementById('imageLoadBtn'),
        fileSelectOption: document.getElementById('fileSelectOption'),
        folderSelectOption: document.getElementById('folderSelectOption'),
        imageInput: document.getElementById('imageInput'),
        folderInput: document.getElementById('folderInput'),
        selectedImagesPreview: document.getElementById('selectedImagesPreview'),
        imageOrderList: document.getElementById('imageOrderList'),
        selectedCount: document.getElementById('selectedCount'),
        proceedToCropBtn: document.getElementById('proceedToCropBtn'),
        uploadArea: document.getElementById('uploadArea')
    };
    
    console.log('📋 1단계 DOM 요소 확인:', {
        imageLoadBtn: !!elements.imageLoadBtn,
        fileSelectOption: !!elements.fileSelectOption,
        folderSelectOption: !!elements.folderSelectOption,
        imageInput: !!elements.imageInput,
        folderInput: !!elements.folderInput,
        selectedImagesPreview: !!elements.selectedImagesPreview,
        imageOrderList: !!elements.imageOrderList,
        selectedCount: !!elements.selectedCount,
        proceedToCropBtn: !!elements.proceedToCropBtn,
        uploadArea: !!elements.uploadArea
    });
    
    // 1단계 이미지 로드 기능 초기화
    if (elements.imageLoadBtn || elements.uploadArea) {
        initializeStep1ImageLoad(elements);
        console.log('✅ 시설 이미지 1단계 초기화 완료');
    } else {
        console.log('ℹ️ 1단계 이미지 로드 섹션이 없어서 초기화 건너뜀');
    }
});

// 1단계 이미지 로드 기능 초기화
function initializeStep1ImageLoad(elements) {
    console.log('🔧 1단계 이미지 로드 기능 초기화');
    
    // 기본 이미지 불러오기 버튼 (파일 선택)
    if (elements.imageLoadBtn) {
        elements.imageLoadBtn.addEventListener('click', function() {
            console.log('📁 기본 이미지 불러오기 버튼 클릭');
            elements.imageInput.click();
        });
    }
    
    // 파일에서 선택 옵션
    if (elements.fileSelectOption) {
        elements.fileSelectOption.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📄 파일에서 선택 옵션 클릭');
            elements.imageInput.click();
        });
    }
    
    // 폴더에서 선택 옵션
    if (elements.folderSelectOption) {
        elements.folderSelectOption.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📂 폴더에서 선택 옵션 클릭');
            elements.folderInput.click();
        });
    }
    
    // 파일 선택 이벤트 (개별 파일들)
    if (elements.imageInput) {
        elements.imageInput.addEventListener('change', function(e) {
            console.log('📁 파일 선택됨:', e.target.files.length, '개');
            handleFileSelection(e.target.files, '파일 선택');
        });
    }
    
    // 폴더 선택 이벤트 (폴더 내 모든 파일)
    if (elements.folderInput) {
        elements.folderInput.addEventListener('change', function(e) {
            console.log('📂 폴더 선택됨:', e.target.files.length, '개 파일');
            handleFileSelection(e.target.files, '폴더 선택');
        });
    }
    
    // 드래그 앤 드롭 이벤트
    if (elements.uploadArea) {
        setupDragAndDrop(elements.uploadArea);
    }
    
    // 크롭 시작 버튼
    if (elements.proceedToCropBtn) {
        elements.proceedToCropBtn.addEventListener('click', function() {
            console.log('🎨 크롭 시작 버튼 클릭');
            proceedToCropStep();
        });
    }
    
    console.log('✅ 1단계 이미지 로드 기능 초기화 완료');
}

// 드래그 앤 드롭 설정
function setupDragAndDrop(uploadArea) {
    console.log('🎯 드래그 앤 드롭 설정');
    
    // 드래그 엔터
    uploadArea.addEventListener('dragenter', function(e) {
        e.preventDefault();
        window.facilityImageStep1.dragCounter++;
        uploadArea.classList.add('drag-over');
        console.log('🔄 드래그 엔터');
    });
    
    // 드래그 오버
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });
    
    // 드래그 리브
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        window.facilityImageStep1.dragCounter--;
        if (window.facilityImageStep1.dragCounter === 0) {
            uploadArea.classList.remove('drag-over');
            console.log('🔄 드래그 리브');
        }
    });
    
    // 드롭
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        window.facilityImageStep1.dragCounter = 0;
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        console.log('📦 드롭된 파일:', files.length, '개');
        
        if (files.length > 0) {
            handleFileSelection(files, '드래그 앤 드롭');
        }
    });
}

// 파일 선택 처리
function handleFileSelection(files, source) {
    console.log('📁 파일 선택 처리 시작:', source, files.length, '개');
    
    if (window.facilityImageStep1.isProcessing) {
        console.log('⚠️ 이미 처리 중입니다');
        return;
    }
    
    window.facilityImageStep1.isProcessing = true;
    
    // 이미지 파일만 필터링
    const imageFiles = Array.from(files).filter(file => {
        return file.type.startsWith('image/');
    });
    
    console.log('🖼️ 이미지 파일 필터링:', imageFiles.length, '개');
    
    if (imageFiles.length === 0) {
        showNotification('이미지 파일이 없습니다.', 'warning');
        window.facilityImageStep1.isProcessing = false;
        return;
    }
    
    // 최대 5장 제한
    if (imageFiles.length > window.facilityImageStep1.maxImages) {
        showNotification(`최대 ${window.facilityImageStep1.maxImages}장까지만 선택할 수 있습니다. 처음 ${window.facilityImageStep1.maxImages}장만 선택됩니다.`, 'info');
        imageFiles.splice(window.facilityImageStep1.maxImages);
    }
    
    // 파일 크기 검증 (10MB 제한)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const validFiles = imageFiles.filter(file => {
        if (file.size > maxFileSize) {
            console.log('⚠️ 파일 크기 초과:', file.name, formatFileSize(file.size));
            return false;
        }
        return true;
    });
    
    if (validFiles.length < imageFiles.length) {
        showNotification('일부 파일이 크기 제한(10MB)을 초과하여 제외되었습니다.', 'warning');
    }
    
    if (validFiles.length === 0) {
        showNotification('선택 가능한 이미지 파일이 없습니다.', 'error');
        window.facilityImageStep1.isProcessing = false;
        return;
    }
    
    // 선택된 파일들 저장
    window.facilityImageStep1.selectedFiles = validFiles;
    
    // 미리보기 생성
    generateImagePreview(validFiles);
    
    window.facilityImageStep1.isProcessing = false;
    
    console.log('✅ 파일 선택 처리 완료:', validFiles.length, '개 선택됨');
}

// 이미지 미리보기 생성
function generateImagePreview(files) {
    console.log('🖼️ 이미지 미리보기 생성 시작:', files.length, '개');
    
    const selectedImagesPreview = document.getElementById('selectedImagesPreview');
    const imageOrderList = document.getElementById('imageOrderList');
    const selectedCount = document.getElementById('selectedCount');
    const proceedToCropBtn = document.getElementById('proceedToCropBtn');
    
    if (!selectedImagesPreview || !imageOrderList || !selectedCount) {
        console.error('❌ 필수 DOM 요소를 찾을 수 없습니다');
        return;
    }
    
    // 카운트 업데이트
    selectedCount.textContent = files.length;
    
    // 미리보기 영역 표시
    selectedImagesPreview.style.display = 'block';
    
    // 이미지 리스트 초기화
    imageOrderList.innerHTML = '';
    
    // 각 파일에 대해 미리보기 생성
    files.forEach((file, index) => {
        const imageItem = createImagePreviewItem(file, index);
        imageOrderList.appendChild(imageItem);
    });
    
    // 크롭 시작 버튼은 순서 지정 완료 후에만 표시 (초기에는 숨김)
    if (proceedToCropBtn) {
        proceedToCropBtn.style.display = 'none';
    }
    
    // 순서 큐 초기화 (새로운 파일 선택 시)
    window.facilityImageStep1.orderQueue = [];
    
    console.log('✅ 이미지 미리보기 생성 완료');
}

// 개별 이미지 미리보기 아이템 생성
function createImagePreviewItem(file, index) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-4 col-sm-6';
    colDiv.dataset.index = index;
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card border-secondary h-100 image-order-item';
    cardDiv.style.cursor = 'pointer';
    cardDiv.style.transition = 'all 0.3s ease';
    
    // 클릭 이벤트 추가
    cardDiv.onclick = function() {
        handleImageOrderClick(index);
    };
    
    // 마우스 오버 효과
    cardDiv.onmouseenter = function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    };
    
    cardDiv.onmouseleave = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '';
    };
    
    // 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onload = function(e) {
        const orderBadgeClass = getOrderBadgeClass(index);
        const orderText = getOrderText(index);
        
        const imagePreview = `
            <div class="card-img-top position-relative" style="height: 150px; overflow: hidden;">
                <img src="${e.target.result}" alt="미리보기 ${index + 1}" 
                     class="img-fluid h-100 w-100" style="object-fit: cover;">
                <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge ${orderBadgeClass} order-badge" id="orderBadge_${index}">
                        <i class="fas fa-image me-1"></i>${orderText}
                    </span>
                </div>
                <div class="position-absolute bottom-0 start-0 end-0 p-2 bg-dark bg-opacity-75">
                    <small class="text-white">
                        <i class="fas fa-hand-pointer me-1"></i>클릭하여 순서 지정
                    </small>
                </div>
            </div>
        `;
        
        const cardBody = `
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
                            ${getOrderStatusText(index)}
                        </small>
                    </div>
                    <button type="button" class="btn btn-outline-danger btn-sm" 
                            onclick="removeImageFromList(${index})" 
                            title="이미지 제거"
                            style="z-index: 10;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        cardDiv.innerHTML = imagePreview + cardBody;
    };
    
    reader.readAsDataURL(file);
    
    colDiv.appendChild(cardDiv);
    return colDiv;
}

// 이미지 클릭 시 순서 지정 처리
function handleImageOrderClick(index) {
    console.log('🎯 이미지 순서 클릭:', index);
    
    if (window.facilityImageStep1.isProcessing) {
        console.log('⚠️ 이미 처리 중입니다');
        return;
    }
    
    const orderQueue = window.facilityImageStep1.orderQueue;
    const currentOrderIndex = orderQueue.indexOf(index);
    
    if (currentOrderIndex !== -1) {
        // 🔄 이미 순서가 지정된 이미지를 다시 클릭 → 순서 제거 및 재정렬
        console.log(`🔄 이미지 ${index} 순서 제거 (기존 ${currentOrderIndex + 1}번)`);
        
        // 해당 인덱스를 큐에서 제거
        orderQueue.splice(currentOrderIndex, 1);
        
        // 제거된 순서 이후의 모든 이미지 번호를 1씩 당김 (자동 재정렬)
        console.log('📊 순서 재정렬 완료:', orderQueue);
        
        // 시각적 피드백
        showOrderChangeAnimation(index, 'removed');
        
    } else {
        // ➕ 새로운 이미지 클릭 → 순서에 추가 (다음 번호 할당)
        const newOrderNumber = orderQueue.length + 1;
        console.log(`➕ 이미지 ${index} 순서 추가 (${newOrderNumber}번)`);
        
        orderQueue.push(index);
        
        // 시각적 피드백
        showOrderChangeAnimation(index, 'added', newOrderNumber);
    }
    
    console.log('🎯 현재 순서 큐:', orderQueue);
    
    // UI 업데이트
    updateOrderUI();
    
    // 모든 이미지에 순서가 지정되었는지 확인
    checkOrderCompletion();
}

// 순서 변경 애니메이션 표시
function showOrderChangeAnimation(index, action, orderNumber = null) {
    const cardElement = document.querySelector(`[data-index="${index}"] .card`);
    
    if (cardElement) {
        // 기존 애니메이션 클래스 제거
        cardElement.classList.remove('order-added', 'order-removed');
        
        if (action === 'added') {
            cardElement.classList.add('order-added');
            console.log(`✨ ${index}번 이미지에 ${orderNumber}번 순서 할당 애니메이션`);
        } else if (action === 'removed') {
            cardElement.classList.add('order-removed');
            console.log(`❌ ${index}번 이미지 순서 제거 애니메이션`);
        }
        
        // 0.5초 후 애니메이션 클래스 제거
        setTimeout(() => {
            cardElement.classList.remove('order-added', 'order-removed');
        }, 500);
    }
}

// 순서 지정 UI 업데이트
function updateOrderUI() {
    const files = window.facilityImageStep1.selectedFiles;
    const orderQueue = window.facilityImageStep1.orderQueue;
    
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
    
    console.log('🔄 순서 UI 업데이트 완료, 현재 큐:', orderQueue);
}

// 순서 지정 완료 확인
function checkOrderCompletion() {
    const files = window.facilityImageStep1.selectedFiles;
    const orderQueue = window.facilityImageStep1.orderQueue;
    const proceedToCropBtn = document.getElementById('proceedToCropBtn');
    
    if (orderQueue.length === files.length && files.length > 0) {
        // 모든 이미지에 순서가 지정됨
        if (proceedToCropBtn) {
            proceedToCropBtn.style.display = 'inline-block';
            proceedToCropBtn.classList.add('btn-success');
            proceedToCropBtn.classList.remove('btn-secondary');
            proceedToCropBtn.innerHTML = '<i class="fas fa-crop-alt me-2"></i>크롭 시작 (순서 완료)';
        }
        
        showNotification('모든 이미지의 순서가 지정되었습니다! 크롭을 시작할 수 있습니다.', 'success');
        console.log('✅ 모든 이미지 순서 지정 완료');
    } else {
        // 아직 순서 지정이 완료되지 않음
        if (proceedToCropBtn) {
            proceedToCropBtn.style.display = 'none';
        }
        
        const remainingCount = files.length - orderQueue.length;
        if (remainingCount > 0) {
            console.log(`⏳ ${remainingCount}개 이미지의 순서가 더 필요합니다`);
        }
    }
}

// 오더 배지 클래스 가져오기
function getOrderBadgeClass(index) {
    const orderQueue = window.facilityImageStep1.orderQueue;
    return orderQueue.indexOf(index) !== -1 ? 'bg-success' : 'bg-secondary';
}

// 오더 텍스트 가져오기
function getOrderText(index) {
    const orderQueue = window.facilityImageStep1.orderQueue;
    const orderIndex = orderQueue.indexOf(index);
    
    if (orderIndex !== -1) {
        return `${orderIndex + 1}번`;
    } else {
        return '대기';
    }
}

// 오더 상태 텍스트 가져오기
function getOrderStatusText(index) {
    const orderQueue = window.facilityImageStep1.orderQueue;
    const orderIndex = orderQueue.indexOf(index);
    
    if (orderIndex !== -1) {
        return `<i class="fas fa-check-circle me-1"></i>${orderIndex + 1}번째 선택`;
    } else {
        return '<i class="fas fa-hand-pointer me-1"></i>클릭하여 순서 지정';
    }
}

// 순서 옵션 생성 (레거시 - 더 이상 사용하지 않음)
function generateOrderOptions(totalCount, currentIndex) {
    let options = '';
    for (let i = 0; i < totalCount; i++) {
        const selected = i === currentIndex ? 'selected' : '';
        options += `<option value="${i}" ${selected}>${i + 1}번</option>`;
    }
    return options;
}

// 이미지 순서 이동 (위/아래 버튼)
function moveImageOrder(index, direction) {
    console.log('🔄 이미지 순서 이동:', index, direction);
    
    if (window.facilityImageStep1.isProcessing) {
        console.log('⚠️ 이미 처리 중입니다');
        return;
    }
    
    const files = window.facilityImageStep1.selectedFiles;
    let newIndex = index;
    
    if (direction === 'up' && index > 0) {
        newIndex = index - 1;
    } else if (direction === 'down' && index < files.length - 1) {
        newIndex = index + 1;
    } else {
        console.log('⚠️ 이동할 수 없는 위치입니다');
        return;
    }
    
    // 파일 위치 교환
    [files[index], files[newIndex]] = [files[newIndex], files[index]];
    
    // 미리보기 재생성
    generateImagePreview(files);
    
    console.log('✅ 이미지 순서 이동 완료:', index, '->', newIndex);
}

// 이미지 순서 직접 변경 (드롭다운)
function changeImageOrder(oldIndex, newIndex) {
    console.log('🔄 이미지 순서 직접 변경:', oldIndex, '->', newIndex);
    
    if (window.facilityImageStep1.isProcessing) {
        console.log('⚠️ 이미 처리 중입니다');
        return;
    }
    
    newIndex = parseInt(newIndex);
    
    if (oldIndex === newIndex) {
        console.log('ℹ️ 같은 순서로 변경 요청 - 무시');
        return;
    }
    
    const files = window.facilityImageStep1.selectedFiles;
    const fileToMove = files[oldIndex];
    
    // 파일 제거
    files.splice(oldIndex, 1);
    
    // 새 위치에 삽입
    files.splice(newIndex, 0, fileToMove);
    
    // 미리보기 재생성
    generateImagePreview(files);
    
    console.log('✅ 이미지 순서 직접 변경 완료');
}

// 이미지 리스트에서 제거
function removeImageFromList(index) {
    console.log('🗑️ 이미지 리스트에서 제거:', index);
    
    if (window.facilityImageStep1.isProcessing) {
        console.log('⚠️ 이미 처리 중입니다');
        return;
    }
    
    // 이벤트 전파 중지 (카드 클릭 이벤트와 충돌 방지)
    event.stopPropagation();
    
    const files = window.facilityImageStep1.selectedFiles;
    const orderQueue = window.facilityImageStep1.orderQueue;
    
    if (index < 0 || index >= files.length) {
        console.error('❌ 잘못된 인덱스:', index);
        return;
    }
    
    // 파일 제거
    files.splice(index, 1);
    
    // 순서 큐에서도 해당 인덱스 제거 및 재조정
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
    
    console.log('🔄 순서 큐 재조정 완료:', orderQueue);
    
    if (files.length === 0) {
        // 모든 파일이 제거된 경우
        const selectedImagesPreview = document.getElementById('selectedImagesPreview');
        const proceedToCropBtn = document.getElementById('proceedToCropBtn');
        
        if (selectedImagesPreview) {
            selectedImagesPreview.style.display = 'none';
        }
        if (proceedToCropBtn) {
            proceedToCropBtn.style.display = 'none';
        }
        
        // 순서 큐 초기화
        window.facilityImageStep1.orderQueue = [];
        
        console.log('ℹ️ 모든 이미지가 제거되어 미리보기 영역 숨김');
    } else {
        // 미리보기 재생성
        generateImagePreview(files);
    }
    
    console.log('✅ 이미지 제거 완료. 남은 파일:', files.length, '개');
}

// 크롭 단계로 진행
function proceedToCropStep() {
    console.log('🎨 크롭 단계로 진행');
    
    if (window.facilityImageStep1.selectedFiles.length === 0) {
        showNotification('선택된 이미지가 없습니다.', 'warning');
        return;
    }
    
    // 순서가 모두 지정되었는지 확인
    const orderQueue = window.facilityImageStep1.orderQueue;
    const files = window.facilityImageStep1.selectedFiles;
    
    if (orderQueue.length !== files.length) {
        showNotification(`모든 이미지의 순서를 지정해주세요. (${orderQueue.length}/${files.length})`, 'warning');
        return;
    }
    
    // 순서에 따라 파일 재정렬
    const orderedFiles = [];
    orderQueue.forEach(originalIndex => {
        orderedFiles.push(files[originalIndex]);
    });
    
    // 재정렬된 파일로 업데이트
    window.facilityImageStep1.selectedFiles = orderedFiles;
    
    console.log('📊 이미지 순서 재정렬 완료:', orderQueue);
    
    // 1단계 숨기기
    const uploadSection = document.getElementById('uploadSection');
    if (uploadSection) {
        uploadSection.style.display = 'none';
    }
    
    // 2단계 표시
    const cropSection = document.getElementById('cropSection');
    if (cropSection) {
        cropSection.style.display = 'block';
    }
    
    // 단계 표시기 업데이트
    updateStepIndicator(2);
    
    // 크롭 기능 초기화 (다른 스크립트에서 처리)
    if (typeof window.initializeCropStep === 'function') {
        window.initializeCropStep(window.facilityImageStep1.selectedFiles);
    }
    
    console.log('✅ 크롭 단계로 진행 완료 - 순서대로 정렬된 파일:', orderedFiles.length, '개');
}

// 단계 표시기 업데이트
function updateStepIndicator(currentStep) {
    console.log('📊 단계 표시기 업데이트:', currentStep);
    
    const steps = document.querySelectorAll('.step-item');
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        if (stepNum < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

// 알림 표시
function showNotification(message, type = 'info') {
    console.log('📢 알림:', type, message);
    
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
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // 새 알림 생성
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClass} alert-dismissible fade show step1-notification`;
    alertDiv.innerHTML = `
        <i class="${icon} me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // 컨테이너 찾기
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
    }
    
    // 5초 후 자동 제거
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 전역 함수로 노출 (HTML onclick 이벤트에서 사용)
window.moveImageOrder = moveImageOrder;
window.changeImageOrder = changeImageOrder;
window.removeImageFromList = removeImageFromList;

console.log('✅ 시설 이미지 1단계 스크립트 완전 로드됨');