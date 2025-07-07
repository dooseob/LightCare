/**
 * 시설 이미지 폴더 선택 전용 JavaScript
 * facility-image-cropper.js와 충돌 방지를 위해 분리
 */

console.log('📂 시설 폴더 선택 스크립트 로드됨');

// 네임스페이스로 전역 변수 관리
window.facilityFolderSelection = window.facilityFolderSelection || {
    selectedImages: [],
    maxImages: 5,
    folderModal: null,
    isProcessing: false
};

// 초기화 (회원삭제 패턴 적용)
document.addEventListener('DOMContentLoaded', function() {
    console.log('📂 폴더 선택 모듈 초기화 시작');
    
    // DOM 요소 확인 후 초기화
    const elements = {
        folderSelectBtn: document.getElementById('folderSelectBtn'),
        folderInput: document.getElementById('folderInput'),
        imageSelectionModal: document.getElementById('imageSelectionModal'),
        modalImageGrid: document.getElementById('modalImageGrid'),
        confirmImageSelection: document.getElementById('confirmImageSelection')
    };
    
    console.log('📂 폴더 선택 DOM 요소 확인:', {
        folderSelectBtn: !!elements.folderSelectBtn,
        folderInput: !!elements.folderInput,
        imageSelectionModal: !!elements.imageSelectionModal,
        modalImageGrid: !!elements.modalImageGrid,
        confirmImageSelection: !!elements.confirmImageSelection
    });
    
    if (elements.folderSelectBtn) {
        initializeFolderSelection(elements);
        setupFolderModal(elements);
        console.log('✅ 폴더 선택 모듈 초기화 완료');
    } else {
        console.warn('⚠️ 폴더 선택 버튼이 없어서 초기화하지 않음');
    }
});

// 폴더 선택 기능 초기화 (안전한 이벤트 처리)
function initializeFolderSelection(elements) {
    console.log('🔧 폴더 선택 기능 초기화');
    
    if (!elements.folderSelectBtn) {
        console.error('❌ 폴더 선택 버튼을 찾을 수 없음');
        return;
    }
    
    // 안전한 이벤트 리스너 등록 (충돌 방지)
    try {
        // 기존 이벤트 리스너 제거를 위해 버튼 복제
        const newBtn = elements.folderSelectBtn.cloneNode(true);
        elements.folderSelectBtn.parentNode.replaceChild(newBtn, elements.folderSelectBtn);
        elements.folderSelectBtn = newBtn; // 참조 업데이트
        
        elements.folderSelectBtn.addEventListener('click', function(event) {
            console.log('📂 폴더 선택 버튼 클릭됨 - 안전한 처리');
            event.preventDefault();
            event.stopPropagation();
            
            try {
                handleFolderSelection(elements);
            } catch (error) {
                console.error('❌ 폴더 선택 처리 오류:', error);
                alert('폴더 선택에 오류가 발생했습니다: ' + error.message);
            }
        });
        
        console.log('✅ 폴더 선택 버튼 이벤트 등록 성공');
    } catch (error) {
        console.error('❌ 폴더 선택 버튼 이벤트 등록 실패:', error);
    }
    
    console.log('✅ 폴더 선택 기능 초기화 완료');
}

// 폴더 모달 설정 (요소 전달 방식)
function setupFolderModal(elements) {
    console.log('🔧 폴더 모달 설정');
    
    if (!elements.imageSelectionModal) {
        console.error('❌ 이미지 선택 모달을 찾을 수 없음');
        return;
    }
    
    // Bootstrap 모달 인스턴스 생성
    if (typeof bootstrap !== 'undefined') {
        window.facilityFolderSelection.folderModal = new bootstrap.Modal(elements.imageSelectionModal);
    }
    
    // 모달 내 이벤트 처리
    setupModalEvents(elements);
    
    console.log('✅ 폴더 모달 설정 완료');
}

// 모달 내 이벤트 설정 (안전한 요소 접근)
function setupModalEvents(elements) {
    console.log('🎯 모달 이벤트 설정');
    
    // 이미지 선택 확인 버튼
    if (elements.confirmImageSelection) {
        elements.confirmImageSelection.addEventListener('click', function() {
            console.log('✅ 이미지 선택 확인');
            confirmImageSelection();
        });
    } else {
        console.warn('⚠️ 확인 버튼을 찾을 수 없음');
    }
    
    // 모달 이미지 클릭 이벤트 (이벤트 위임)
    const modalBody = elements.imageSelectionModal ? 
        elements.imageSelectionModal.querySelector('.modal-body') : null;
    
    if (modalBody) {
        modalBody.addEventListener('click', function(event) {
            const imageCard = event.target.closest('.image-selection-card');
            if (imageCard) {
                toggleImageSelection(imageCard);
            }
        });
    } else {
        console.warn('⚠️ 모달 바디를 찾을 수 없음');
    }
    
    console.log('✅ 모달 이벤트 설정 완료');
}

// 폴더 선택 처리 (안전한 요소 접근)
function handleFolderSelection(elements) {
    console.log('📂 폴더 선택 처리 시작');
    
    if (window.facilityFolderSelection.isProcessing) {
        console.log('⚠️ 이미 처리 중입니다');
        return;
    }
    
    if (!elements.folderInput) {
        console.error('❌ 폴더 입력 요소를 찾을 수 없음');
        return;
    }
    
    // 폴더 선택 속성 확실히 설정
    elements.folderInput.webkitdirectory = true;
    elements.folderInput.multiple = true;
    elements.folderInput.accept = 'image/*';
    
    console.log('📂 폴더 입력 속성 확인:', {
        webkitdirectory: elements.folderInput.webkitdirectory,
        multiple: elements.folderInput.multiple,
        accept: elements.folderInput.accept
    });
    
    // 폴더 선택 트리거
    elements.folderInput.click();
    
    // 폴더 선택 완료 이벤트 (안전한 방식)
    try {
        if (!elements.folderInput || !elements.folderInput.parentNode) {
            console.error('❌ 폴더 입력 요소나 부모 노드가 없음');
            alert('폴더 선택 기능에 오류가 있습니다. 페이지를 새로고침해주세요.');
            return;
        }
        
        // 기존 이벤트 리스너 제거를 위해 요소 복제
        const newFolderInput = elements.folderInput.cloneNode(true);
        elements.folderInput.parentNode.replaceChild(newFolderInput, elements.folderInput);
        elements.folderInput = newFolderInput; // 참조 업데이트
        
        newFolderInput.addEventListener('change', function(event) {
            console.log('📂 폴더 선택 완료, 파일 수:', event.target.files.length);
            
            try {
                if (event.target.files.length === 0) {
                    console.warn('⚠️ 선택된 파일이 없습니다');
                    alert('폴더에 이미지 파일이 없거나 폴더 선택이 취소되었습니다.');
                    return;
                }
                
                processFolderFiles(event.target.files);
            } catch (error) {
                console.error('❌ 폴더 파일 처리 오류:', error);
                alert('폴더 파일 처리 중 오류가 발생했습니다: ' + error.message);
            }
        });
        
        console.log('✅ 폴더 입력 이벤트 등록 성공');
        
    } catch (error) {
        console.error('❌ 폴더 입력 이벤트 설정 실패:', error);
        alert('폴더 선택 기능 설정에 실패했습니다: ' + error.message);
        return;
    }
}

// 폴더 파일 처리
function processFolderFiles(files) {
    console.log('📁 폴더 파일 처리 시작:', files.length + '개 파일');
    
    window.facilityFolderSelection.isProcessing = true;
    
    // 이미지 파일만 필터링
    const imageFiles = Array.from(files).filter(file => {
        return file.type.startsWith('image/') && 
               ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
    });
    
    console.log('🖼️ 이미지 파일:', imageFiles.length + '개');
    
    if (imageFiles.length === 0) {
        console.warn('⚠️ 선택한 폴더에 이미지가 없음');
        showModalEmptyState();
        window.facilityFolderSelection.isProcessing = false;
        return;
    }
    
    // 메인 화면에 표시 (모달 대신)
    showImageSelectionInMainScreen(imageFiles);
}

// 이미지를 메인 화면에 표시 (모달 대신)
function showImageSelectionInMainScreen(imageFiles) {
    console.log('🖼️ 메인 화면에 이미지 표시:', imageFiles.length + '개 이미지');
    
    // 메인 화면의 이미지 리스트 섹션 가져오기
    const imageListSection = document.getElementById('imageListSection');
    const imageList = document.getElementById('imageList');
    const imageCount = document.getElementById('imageCount');
    const nextToCropBtn = document.getElementById('nextToCropBtn');
    
    if (!imageListSection || !imageList) {
        console.error('❌ 메인 화면 이미지 리스트 요소를 찾을 수 없음');
        window.facilityFolderSelection.isProcessing = false;
        return;
    }
    
    // 기존 이미지 목록 초기화
    imageList.innerHTML = '';
    window.facilityFolderSelection.selectedImages = [];
    
    // 이미지 리스트 섹션 표시
    imageListSection.style.display = 'block';
    
    // 폴더 선택 안내 메시지 추가
    const folderInfo = document.createElement('div');
    folderInfo.className = 'alert alert-info mb-3';
    folderInfo.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-folder-open me-2"></i>
            <div class="flex-grow-1">
                <strong>폴더에서 선택:</strong> ${imageFiles.length}개 이미지를 찾았습니다. 
                원하는 이미지를 클릭하여 선택하세요 (최대 5장)
            </div>
            <button type="button" class="btn btn-sm btn-outline-secondary" id="reselectFolderBtn">
                <i class="fas fa-redo me-1"></i>다시 선택
            </button>
        </div>
    `;
    imageList.appendChild(folderInfo);
    
    // 다시 선택 버튼 이벤트
    const reselectBtn = folderInfo.querySelector('#reselectFolderBtn');
    reselectBtn.addEventListener('click', function() {
        imageListSection.style.display = 'none';
        window.facilityFolderSelection.selectedImages = [];
        window.facilityFolderSelection.isProcessing = false;
    });
    
    // 이미지 그리드 생성
    createMainScreenImageGrid(imageFiles, imageList);
    
    // 카운트 업데이트
    updateImageCount();
    
    window.facilityFolderSelection.isProcessing = false;
}

// 모달 로딩 상태 표시
function showModalLoadingState() {
    const loadingState = document.getElementById('modalLoadingState');
    const imageGrid = document.getElementById('modalImageGrid');
    const emptyState = document.getElementById('modalEmptyState');
    
    if (loadingState) loadingState.style.display = 'block';
    if (imageGrid) imageGrid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
}

// 모달 빈 상태 표시
function showModalEmptyState() {
    const loadingState = document.getElementById('modalLoadingState');
    const imageGrid = document.getElementById('modalImageGrid');
    const emptyState = document.getElementById('modalEmptyState');
    
    if (loadingState) loadingState.style.display = 'none';
    if (imageGrid) imageGrid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    
    // 모달 열기
    if (window.facilityFolderSelection.folderModal) {
        window.facilityFolderSelection.folderModal.show();
    }
}

// 이미지 그리드 생성
function createImageGrid(imageFiles) {
    console.log('🔧 이미지 그리드 생성:', imageFiles.length + '개');
    
    const imageGrid = document.getElementById('modalImageGrid');
    if (!imageGrid) {
        console.error('❌ 이미지 그리드를 찾을 수 없음');
        return;
    }
    
    // 기존 내용 초기화
    imageGrid.innerHTML = '';
    window.facilityFolderSelection.selectedImages = [];
    
    let processedCount = 0;
    
    imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const imageCard = createImageCard(file, e.target.result, index);
            imageGrid.appendChild(imageCard);
            
            processedCount++;
            
            // 모든 이미지 처리 완료
            if (processedCount === imageFiles.length) {
                showImageGrid();
                updateSelectionCount();
                window.facilityFolderSelection.isProcessing = false;
            }
        };
        
        reader.onerror = function() {
            console.error('❌ 이미지 읽기 실패:', file.name);
            processedCount++;
            
            if (processedCount === imageFiles.length) {
                showImageGrid();
                updateSelectionCount();
                window.facilityFolderSelection.isProcessing = false;
            }
        };
        
        reader.readAsDataURL(file);
    });
}

// 메인 화면용 이미지 그리드 생성
function createMainScreenImageGrid(imageFiles, container) {
    console.log('🔧 메인 화면 이미지 그리드 생성:', imageFiles.length + '개');
    
    let processedCount = 0;
    
    imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const imageCard = createMainScreenImageCard(file, e.target.result, index);
            container.appendChild(imageCard);
            
            processedCount++;
            
            // 모든 이미지 처리 완료
            if (processedCount === imageFiles.length) {
                updateImageCount();
                updateNextButton();
                console.log('✅ 메인 화면 이미지 그리드 생성 완료');
            }
        };
        
        reader.onerror = function() {
            console.error('❌ 이미지 읽기 실패:', file.name);
            processedCount++;
            
            if (processedCount === imageFiles.length) {
                updateImageCount();
                updateNextButton();
            }
        };
        
        reader.readAsDataURL(file);
    });
}

// 메인 화면용 이미지 카드 생성
function createMainScreenImageCard(file, dataUrl, index) {
    const col = document.createElement('div');
    col.className = 'col-lg-2 col-md-3 col-sm-4 col-6 mb-3';
    
    col.innerHTML = `
        <div class="card folder-image-card h-100" data-file-index="${index}" style="cursor: pointer; transition: all 0.3s ease;">
            <div class="position-relative">
                <img src="${dataUrl}" class="card-img-top" alt="${file.name}" 
                     style="height: 120px; object-fit: cover;">
                <div class="selection-overlay position-absolute top-0 end-0 p-1" style="display: none;">
                    <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" 
                         style="width: 20px; height: 20px; font-size: 10px;">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
                <div class="selection-number position-absolute top-0 start-0 p-1" style="display: none;">
                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                         style="width: 20px; height: 20px; font-size: 10px; font-weight: bold;">
                        <span class="selection-num">1</span>
                    </div>
                </div>
            </div>
            <div class="card-body p-2">
                <h6 class="card-title text-truncate mb-1" style="font-size: 0.75rem;">${file.name}</h6>
                <small class="text-muted">${formatFileSize(file.size)}</small>
            </div>
        </div>
    `;
    
    // 파일 정보 저장
    const card = col.querySelector('.folder-image-card');
    card._fileData = {
        file: file,
        dataUrl: dataUrl,
        index: index
    };
    
    // 클릭 이벤트 추가
    card.addEventListener('click', function() {
        toggleMainScreenImageSelection(this);
    });
    
    return col;
}

// 메인 화면 이미지 선택 토글
function toggleMainScreenImageSelection(imageCard) {
    const isSelected = imageCard.classList.contains('selected');
    const fileData = imageCard._fileData;
    
    if (!fileData) {
        console.error('❌ 파일 데이터를 찾을 수 없음');
        return;
    }
    
    if (isSelected) {
        // 선택 해제
        imageCard.classList.remove('selected');
        imageCard.style.borderColor = '';
        imageCard.style.transform = '';
        const overlay = imageCard.querySelector('.selection-overlay');
        const numberOverlay = imageCard.querySelector('.selection-number');
        if (overlay) overlay.style.display = 'none';
        if (numberOverlay) numberOverlay.style.display = 'none';
        
        // 선택된 이미지 목록에서 제거
        const selectedIndex = window.facilityFolderSelection.selectedImages.findIndex(
            item => item.index === fileData.index
        );
        if (selectedIndex > -1) {
            window.facilityFolderSelection.selectedImages.splice(selectedIndex, 1);
        }
        
        console.log('➖ 이미지 선택 해제:', fileData.file.name);
    } else {
        // 최대 선택 수 확인
        if (window.facilityFolderSelection.selectedImages.length >= window.facilityFolderSelection.maxImages) {
            alert(`최대 ${window.facilityFolderSelection.maxImages}장까지만 선택할 수 있습니다.`);
            return;
        }
        
        // 선택
        imageCard.classList.add('selected');
        imageCard.style.borderColor = '#007bff';
        imageCard.style.transform = 'scale(0.95)';
        const overlay = imageCard.querySelector('.selection-overlay');
        const numberOverlay = imageCard.querySelector('.selection-number');
        if (overlay) overlay.style.display = 'block';
        if (numberOverlay) {
            numberOverlay.style.display = 'block';
            const numSpan = numberOverlay.querySelector('.selection-num');
            if (numSpan) numSpan.textContent = window.facilityFolderSelection.selectedImages.length + 1;
        }
        
        // 선택된 이미지 목록에 추가
        window.facilityFolderSelection.selectedImages.push(fileData);
        
        console.log('➕ 이미지 선택:', fileData.file.name);
    }
    
    updateImageCount();
    updateNextButton();
}

// 이미지 카운트 업데이트
function updateImageCount() {
    const countElement = document.getElementById('imageCount');
    if (countElement) {
        const count = window.facilityFolderSelection.selectedImages.length;
        const max = window.facilityFolderSelection.maxImages;
        countElement.textContent = count;
        
        // 색상 변경
        if (count > 0) {
            countElement.className = 'badge bg-primary ms-2';
        } else {
            countElement.className = 'badge bg-secondary ms-2';
        }
    }
}

// 다음 버튼 업데이트
function updateNextButton() {
    const nextBtn = document.getElementById('nextToCropBtn');
    if (nextBtn) {
        const hasSelection = window.facilityFolderSelection.selectedImages.length > 0;
        if (hasSelection) {
            nextBtn.style.display = 'block';
            nextBtn.innerHTML = `<i class="fas fa-crop-alt me-2"></i>크롭 시작 (${window.facilityFolderSelection.selectedImages.length}장)`;
            
            // 기존 이벤트 제거 후 새로 추가
            const newBtn = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newBtn, nextBtn);
            
            newBtn.addEventListener('click', function() {
                proceedToCropWithSelectedImages();
            });
        } else {
            nextBtn.style.display = 'none';
        }
    }
}

// 선택된 이미지로 크롭 단계 진행
function proceedToCropWithSelectedImages() {
    console.log('✅ 선택된 이미지로 크롭 단계 진행:', window.facilityFolderSelection.selectedImages.length + '장');
    
    const selectedImages = window.facilityFolderSelection.selectedImages;
    
    if (selectedImages.length === 0) {
        alert('선택된 이미지가 없습니다.');
        return;
    }
    
    // 메인 크롭퍼로 전달
    if (typeof window.handleSelectedImages === 'function') {
        window.handleSelectedImages(selectedImages);
    } else if (typeof handleFolderImages === 'function') {
        handleFolderImages(selectedImages);
    } else {
        console.error('❌ 이미지 처리 함수를 찾을 수 없음');
        alert('이미지 처리 함수를 찾을 수 없습니다.');
    }
    
    // 상태 초기화
    window.facilityFolderSelection.selectedImages = [];
    window.facilityFolderSelection.isProcessing = false;
}

// 이미지 카드 생성 (기존 모달용)
function createImageCard(file, dataUrl, index) {
    const col = document.createElement('div');
    col.className = 'col-md-3 col-sm-4 col-6';
    
    col.innerHTML = `
        <div class="card image-selection-card" data-file-index="${index}">
            <div class="position-relative">
                <img src="${dataUrl}" class="card-img-top" alt="${file.name}" 
                     style="height: 150px; object-fit: cover;">
                <div class="selection-overlay position-absolute top-0 end-0 p-2" style="display: none;">
                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                         style="width: 24px; height: 24px; font-size: 12px;">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
            </div>
            <div class="card-body p-2">
                <h6 class="card-title text-truncate mb-1" style="font-size: 0.875rem;">${file.name}</h6>
                <small class="text-muted">${formatFileSize(file.size)}</small>
            </div>
        </div>
    `;
    
    // 파일 정보 저장
    const card = col.querySelector('.image-selection-card');
    card._fileData = {
        file: file,
        dataUrl: dataUrl,
        index: index
    };
    
    return col;
}

// 이미지 그리드 표시
function showImageGrid() {
    const loadingState = document.getElementById('modalLoadingState');
    const imageGrid = document.getElementById('modalImageGrid');
    const emptyState = document.getElementById('modalEmptyState');
    
    if (loadingState) loadingState.style.display = 'none';
    if (imageGrid) imageGrid.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    
    console.log('✅ 이미지 그리드 표시 완료');
}

// 이미지 선택 토글
function toggleImageSelection(imageCard) {
    const isSelected = imageCard.classList.contains('selected');
    const fileData = imageCard._fileData;
    
    if (!fileData) {
        console.error('❌ 파일 데이터를 찾을 수 없음');
        return;
    }
    
    if (isSelected) {
        // 선택 해제
        imageCard.classList.remove('selected');
        const overlay = imageCard.querySelector('.selection-overlay');
        if (overlay) overlay.style.display = 'none';
        
        // 선택된 이미지 목록에서 제거
        const selectedIndex = window.facilityFolderSelection.selectedImages.findIndex(
            item => item.index === fileData.index
        );
        if (selectedIndex > -1) {
            window.facilityFolderSelection.selectedImages.splice(selectedIndex, 1);
        }
        
        console.log('➖ 이미지 선택 해제:', fileData.file.name);
    } else {
        // 최대 선택 수 확인
        if (window.facilityFolderSelection.selectedImages.length >= window.facilityFolderSelection.maxImages) {
            alert(`최대 ${window.facilityFolderSelection.maxImages}장까지만 선택할 수 있습니다.`);
            return;
        }
        
        // 선택
        imageCard.classList.add('selected');
        const overlay = imageCard.querySelector('.selection-overlay');
        if (overlay) overlay.style.display = 'block';
        
        // 선택된 이미지 목록에 추가
        window.facilityFolderSelection.selectedImages.push(fileData);
        
        console.log('➕ 이미지 선택:', fileData.file.name);
    }
    
    updateSelectionCount();
    updateConfirmButton();
}

// 선택 카운트 업데이트
function updateSelectionCount() {
    const countElement = document.getElementById('selectedImageCount');
    if (countElement) {
        const count = window.facilityFolderSelection.selectedImages.length;
        const max = window.facilityFolderSelection.maxImages;
        countElement.textContent = `${count}/${max} 선택됨`;
        
        // 색상 변경
        countElement.className = 'badge fs-6 ' + (count > 0 ? 'bg-primary' : 'bg-secondary');
    }
}

// 확인 버튼 업데이트
function updateConfirmButton() {
    const confirmBtn = document.getElementById('confirmImageSelection');
    if (confirmBtn) {
        const hasSelection = window.facilityFolderSelection.selectedImages.length > 0;
        confirmBtn.disabled = !hasSelection;
        
        if (hasSelection) {
            confirmBtn.innerHTML = `<i class="fas fa-check me-2"></i>선택 완료 (${window.facilityFolderSelection.selectedImages.length}장)`;
        } else {
            confirmBtn.innerHTML = `<i class="fas fa-check me-2"></i>선택 완료`;
        }
    }
}

// 이미지 선택 확인
function confirmImageSelection() {
    console.log('✅ 이미지 선택 확인:', window.facilityFolderSelection.selectedImages.length + '장');
    
    const selectedImages = window.facilityFolderSelection.selectedImages;
    
    if (selectedImages.length === 0) {
        alert('선택된 이미지가 없습니다.');
        return;
    }
    
    // 모달 닫기
    if (window.facilityFolderSelection.folderModal) {
        window.facilityFolderSelection.folderModal.hide();
    }
    
    // 선택된 이미지를 메인 크롭퍼로 전달
    if (typeof window.handleSelectedImages === 'function') {
        window.handleSelectedImages(selectedImages);
    } else if (typeof handleFolderImages === 'function') {
        handleFolderImages(selectedImages);
    } else {
        console.error('❌ 이미지 처리 함수를 찾을 수 없음');
        alert('이미지 처리 함수를 찾을 수 없습니다.');
    }
    
    // 상태 초기화
    window.facilityFolderSelection.selectedImages = [];
    window.facilityFolderSelection.isProcessing = false;
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 디버깅 함수들
window.folderSelectionDebug = {
    getState: () => window.facilityFolderSelection,
    testFolderSelection: () => {
        console.log('🧪 폴더 선택 테스트');
        handleFolderSelection();
    },
    checkModal: () => {
        const modal = document.getElementById('imageSelectionModal');
        console.log('🔍 모달 상태:', {
            modal: !!modal,
            modalInstance: !!window.facilityFolderSelection.folderModal,
            selectedImages: window.facilityFolderSelection.selectedImages.length
        });
    }
};

console.log('✅ 시설 폴더 선택 스크립트 로드 완료');
console.log('🧪 디버깅: window.folderSelectionDebug 객체 사용 가능');