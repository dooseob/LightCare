/**
 * 고급 이미지 크롭 + 압축 통합 컴포넌트
 * 프로필 이미지(3:4), 시설 이미지(16:10) 등 다양한 비율 지원
 * Cropper.js + Canvas 압축 기능 통합
 */
class AdvancedImageCropper {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            // 기본 설정
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
            quality: 0.8,
            enableAltText: true,
            
            // 크롭 설정 (기본값: 프로필 이미지)
            aspectRatio: 3/4, // 기본 프로필 비율 (3:4)
            cropWidth: 300,
            cropHeight: 400,
            
            // UI 설정
            title: '이미지 업로드',
            previewStyle: 'profile', // 'profile' | 'facility' | 'custom'
            showSteps: true,
            
            // 콜백 함수
            onCropComplete: null,
            onError: null,
            
            ...options
        };
        
        this.currentFile = null;
        this.cropper = null;
        this.currentStep = 1; // 1: 업로드, 2: 크롭, 3: 완료
        this.croppedImageData = null;
        this.compressedFile = null;
        
        this.init();
    }

    init() {
        // Cropper.js가 로드될 때까지 대기
        this.waitForCropper().then(() => {
            this.createUI();
            this.attachEvents();
            this.updateStepIndicator(1);
        });
    }

    // Cropper.js 로드 대기
    waitForCropper() {
        return new Promise((resolve) => {
            if (typeof Cropper !== 'undefined') {
                resolve();
            } else {
                // 최대 5초 대기
                let attempts = 0;
                const checkCropper = () => {
                    if (typeof Cropper !== 'undefined') {
                        resolve();
                    } else if (attempts < 50) {
                        attempts++;
                        setTimeout(checkCropper, 100);
                    } else {
                        console.error('Cropper.js를 로드할 수 없습니다.');
                        resolve(); // 에러가 있어도 UI는 표시
                    }
                };
                checkCropper();
            }
        });
    }

    createUI() {
        const previewTemplate = this.getPreviewTemplate();
        
        const html = `
            <div class="advanced-image-cropper">
                ${this.options.showSteps ? this.getStepsIndicator() : ''}
                
                <!-- 1단계: 업로드 -->
                <div class="upload-section" id="uploadSection">
                    <div class="upload-area" id="uploadArea">
                        <div class="upload-content">
                            <div class="upload-icon">
                                <i class="fas fa-cloud-upload-alt fa-3x text-primary"></i>
                            </div>
                            <h5 class="upload-title">${this.options.title}</h5>
                            <p class="upload-description text-muted">
                                이미지를 드래그하여 업로드하거나 클릭하여 선택하세요
                            </p>
                            <div class="upload-format-info">
                                <small class="text-muted">
                                    <i class="fas fa-info-circle me-1"></i>
                                    JPG, PNG, WEBP 파일만 지원 (최대 10MB)
                                </small>
                                <br>
                                <small class="text-info">
                                    <i class="fas fa-crop-alt me-1"></i>
                                    업로드 후 최적 비율로 자동 크롭 및 압축됩니다
                                </small>
                            </div>
                            <button type="button" class="btn btn-primary btn-lg mt-3" id="selectFileBtn">
                                <i class="fas fa-folder-open me-2"></i>파일 선택
                            </button>
                        </div>
                        <input type="file" id="imageFileInput" accept="image/*" style="display: none;">
                    </div>
                </div>

                <!-- 2단계: 크롭 -->
                <div class="crop-section" id="cropSection" style="display: none;">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="crop-container">
                                <h6 class="mb-3">
                                    <i class="fas fa-crop-alt me-2"></i>이미지 크롭 및 조정
                                    <small class="text-muted ms-2">(비율: ${this.getRatioText()})</small>
                                </h6>
                                <div class="crop-image-container">
                                    <img id="cropImage" alt="크롭할 이미지" style="max-width: 100%; max-height: 400px;">
                                </div>
                                <div class="crop-controls mt-3">
                                    <div class="btn-group" role="group">
                                        <button type="button" class="btn btn-outline-secondary btn-sm" id="zoomInBtn">
                                            <i class="fas fa-search-plus me-1"></i>확대
                                        </button>
                                        <button type="button" class="btn btn-outline-secondary btn-sm" id="zoomOutBtn">
                                            <i class="fas fa-search-minus me-1"></i>축소
                                        </button>
                                        <button type="button" class="btn btn-outline-secondary btn-sm" id="resetZoomBtn">
                                            <i class="fas fa-undo me-1"></i>초기화
                                        </button>
                                        <button type="button" class="btn btn-outline-info btn-sm" id="rotateLeftBtn">
                                            <i class="fas fa-undo-alt me-1"></i>좌회전
                                        </button>
                                        <button type="button" class="btn btn-outline-info btn-sm" id="rotateRightBtn">
                                            <i class="fas fa-redo-alt me-1"></i>우회전
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="crop-preview-panel">
                                <h6 class="mb-3">
                                    <i class="fas fa-eye me-2"></i>미리보기
                                </h6>
                                
                                ${previewTemplate}

                                <!-- 줌 표시기 -->
                                <div class="zoom-indicator" id="zoomIndicator" style="display: none;">
                                    <small class="text-muted">
                                        <i class="fas fa-search me-1"></i>
                                        줌: <span id="zoomLevel">100%</span>
                                        <span id="zoomStatus" class="ms-1"></span>
                                    </small>
                                </div>

                                <!-- 이미지 정보 -->
                                <div class="image-info-panel mt-3">
                                    <small class="text-muted">
                                        <div class="mb-1">
                                            <i class="fas fa-file-image me-1"></i>
                                            크기: <span id="imageSize">-</span>
                                        </div>
                                        <div class="mb-1">
                                            <i class="fas fa-arrows-alt me-1"></i>
                                            해상도: <span id="imageDimensions">-</span>
                                        </div>
                                        <div class="mb-1">
                                            <i class="fas fa-crop-alt me-1"></i>
                                            최종: ${this.options.cropWidth} × ${this.options.cropHeight}px
                                        </div>
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="crop-actions mt-4">
                        <div class="d-flex justify-content-between">
                            <button type="button" class="btn btn-outline-secondary" id="backToUploadBtn">
                                <i class="fas fa-arrow-left me-1"></i>다른 이미지 선택
                            </button>
                            <button type="button" class="btn btn-primary" id="cropConfirmBtn">
                                <i class="fas fa-crop-alt me-1"></i>크롭 완료
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 3단계: 최종 미리보기 & 압축 -->
                <div class="final-section" id="finalSection" style="display: none;">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="final-preview">
                                <h6 class="mb-3">
                                    <i class="fas fa-check-circle text-success me-2"></i>최종 결과
                                </h6>
                                <div class="final-image-container">
                                    <img id="finalPreviewImage" alt="최종 미리보기" class="final-image">
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <!-- 압축 설정 -->
                            <div class="compression-settings">
                                <h6 class="mb-3">
                                    <i class="fas fa-compress-alt me-2"></i>최적화 설정
                                </h6>
                                
                                <div class="compression-info mb-3">
                                    <div class="compression-savings text-success fw-bold" id="compressionSavings">
                                        계산 중...
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label small">품질 (<span id="qualityLabel">80</span>%)</label>
                                    <input type="range" class="form-range" id="qualitySlider" 
                                           min="0.1" max="1" step="0.1" value="${this.options.quality}">
                                    <div class="d-flex justify-content-between">
                                        <small class="text-muted">낮음 (용량↓)</small>
                                        <small class="text-muted">높음 (화질↑)</small>
                                    </div>
                                </div>
                                
                                <button type="button" class="btn btn-sm btn-outline-primary" id="recompressBtn">
                                    <i class="fas fa-redo me-1"></i>다시 최적화
                                </button>
                            </div>

                            ${this.options.enableAltText ? this.getAltTextSection() : ''}
                        </div>
                    </div>
                    
                    <div class="final-actions mt-4">
                        <div class="d-flex justify-content-between">
                            <button type="button" class="btn btn-outline-secondary" id="backToCropBtn">
                                <i class="fas fa-arrow-left me-1"></i>크롭 다시하기
                            </button>
                            <div>
                                <button type="button" class="btn btn-outline-danger me-2" id="removeImageBtn">
                                    <i class="fas fa-trash me-1"></i>이미지 제거
                                </button>
                                <button type="button" class="btn btn-success" id="saveImageBtn">
                                    <i class="fas fa-save me-1"></i>완료
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 진행률 표시 -->
                <div class="progress-area" id="progressArea" style="display: none;">
                    <div class="progress mb-2">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" 
                             id="progressBar" style="width: 0%"></div>
                    </div>
                    <div class="progress-text text-center">
                        <small id="progressText">처리 중...</small>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    }

    getStepsIndicator() {
        return `
            <div class="steps-indicator mb-4">
                <div class="step-item" id="step1">
                    <div class="step-circle"><i class="fas fa-upload"></i></div>
                    <div class="step-label">이미지 선택</div>
                </div>
                <div class="step-connector"></div>
                <div class="step-item" id="step2">
                    <div class="step-circle"><i class="fas fa-crop-alt"></i></div>
                    <div class="step-label">크롭 & 조정</div>
                </div>
                <div class="step-connector"></div>
                <div class="step-item" id="step3">
                    <div class="step-circle"><i class="fas fa-check"></i></div>
                    <div class="step-label">완료</div>
                </div>
            </div>
        `;
    }

    getPreviewTemplate() {
        if (this.options.previewStyle === 'profile') {
            return `
                <div class="profile-preview mb-3">
                    <div class="profile-card text-center p-3 bg-light rounded">
                        <canvas id="previewCanvas" width="90" height="120" 
                                style="border-radius: 8px; border: 2px solid #dee2e6;"></canvas>
                        <div class="mt-2">
                            <small class="text-muted">프로필 미리보기</small>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.options.previewStyle === 'facility') {
            return `
                <div class="facility-card-preview mb-3">
                    <div class="card shadow-sm">
                        <div class="card-img-container" style="height: 150px; overflow: hidden;">
                            <canvas id="previewCanvas" width="240" height="150" 
                                    style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px 8px 0 0;"></canvas>
                        </div>
                        <div class="card-body p-2">
                            <h6 class="card-title mb-1">시설명 예시</h6>
                            <p class="card-text small text-muted">카드 미리보기</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="custom-preview mb-3">
                    <canvas id="previewCanvas" width="200" height="200" 
                            style="width: 100%; max-width: 200px; border-radius: 8px; border: 1px solid #dee2e6;"></canvas>
                </div>
            `;
        }
    }

    getAltTextSection() {
        return `
            <div class="alt-text-section mt-4">
                <label class="form-label">
                    <i class="fas fa-tag me-1"></i>SEO 최적화 - 이미지 설명
                </label>
                <div class="input-group">
                    <input type="text" class="form-control" id="altTextInput" 
                           placeholder="이미지에 대한 설명을 입력하세요">
                    <button type="button" class="btn btn-outline-secondary" id="autoGenerateAltBtn">
                        <i class="fas fa-magic me-1"></i>자동 생성
                    </button>
                </div>
                <small class="form-text text-muted">
                    검색엔진 최적화를 위해 이미지를 설명하는 텍스트를 입력하세요
                </small>
            </div>
        `;
    }

    getRatioText() {
        const ratio = this.options.aspectRatio;
        if (ratio === 3/4) return '3:4 (프로필)';
        if (ratio === 16/10) return '16:10 (시설 카드)';
        if (ratio === 1) return '1:1 (정사각형)';
        if (ratio === 16/9) return '16:9 (와이드)';
        return `${Math.round(ratio * 100)/100}:1`;
    }

    attachEvents() {
        // 파일 선택 관련
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('imageFileInput');
        const selectFileBtn = document.getElementById('selectFileBtn');

        selectFileBtn?.addEventListener('click', () => fileInput?.click());
        fileInput?.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));

        // 드래그 앤 드롭
        uploadArea?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea?.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });

        uploadArea?.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        uploadArea?.addEventListener('click', (e) => {
            if (!e.target.closest('#selectFileBtn')) {
                fileInput?.click();
            }
        });

        // 크롭 관련 버튼
        document.getElementById('zoomInBtn')?.addEventListener('click', () => this.cropper?.zoom(0.1));
        document.getElementById('zoomOutBtn')?.addEventListener('click', () => this.cropper?.zoom(-0.1));
        document.getElementById('resetZoomBtn')?.addEventListener('click', () => this.cropper?.reset());
        document.getElementById('rotateLeftBtn')?.addEventListener('click', () => this.cropper?.rotate(-90));
        document.getElementById('rotateRightBtn')?.addEventListener('click', () => this.cropper?.rotate(90));

        // 네비게이션 버튼
        document.getElementById('backToUploadBtn')?.addEventListener('click', () => this.goToStep(1));
        document.getElementById('backToCropBtn')?.addEventListener('click', () => this.goToStep(2));
        document.getElementById('cropConfirmBtn')?.addEventListener('click', () => this.confirmCrop());

        // 최종 단계 버튼
        document.getElementById('removeImageBtn')?.addEventListener('click', () => this.removeImage());
        document.getElementById('saveImageBtn')?.addEventListener('click', () => this.saveImage());

        // 압축 설정
        document.getElementById('qualitySlider')?.addEventListener('input', (e) => {
            document.getElementById('qualityLabel').textContent = Math.round(e.target.value * 100);
            this.updateCompression();
        });
        document.getElementById('recompressBtn')?.addEventListener('click', () => this.updateCompression());

        // Alt 텍스트 자동 생성
        document.getElementById('autoGenerateAltBtn')?.addEventListener('click', () => this.generateAltText());
    }

    async handleFileSelect(file) {
        if (!this.validateFile(file)) return;

        this.currentFile = file;
        this.showProgress(20, '이미지 로딩 중...');

        try {
            await this.loadImageToCropper(file);
            this.updateImageInfo(file);
            this.goToStep(2);
            this.hideProgress();
        } catch (error) {
            this.hideProgress();
            this.showError('이미지 로딩 중 오류가 발생했습니다.');
            console.error(error);
        }
    }

    validateFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showError('이미지 파일만 업로드 가능합니다.');
            return false;
        }

        if (file.size > this.options.maxFileSize) {
            this.showError(`파일 크기가 너무 큽니다. 최대 ${this.formatFileSize(this.options.maxFileSize)}까지 가능합니다.`);
            return false;
        }

        if (!this.options.allowedTypes.includes(file.type)) {
            this.showError('JPG, PNG, WEBP 파일만 업로드 가능합니다.');
            return false;
        }

        return true;
    }

    loadImageToCropper(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const cropImage = document.getElementById('cropImage');
                cropImage.src = e.target.result;
                cropImage.onload = () => {
                    this.initializeCropper();
                    resolve();
                };
                cropImage.onerror = reject;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    initializeCropper() {
        if (this.cropper) {
            this.cropper.destroy();
        }

        const cropImage = document.getElementById('cropImage');
        
        // Cropper.js 사용 가능 여부 확인
        if (typeof Cropper === 'undefined') {
            console.error('Cropper.js가 로드되지 않았습니다.');
            this.handleError('이미지 크롭 라이브러리를 로드할 수 없습니다.');
            return;
        }
        
        try {
            this.cropper = new Cropper(cropImage, {
            aspectRatio: this.options.aspectRatio,
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
            scalable: true, // 이미지 스케일링 가능
            zoomable: true, // 이미지 줌 가능
            zoomOnTouch: true, // 터치 줌 가능
            zoomOnWheel: true, // 휠 줌 가능
            wheelZoomRatio: 0.1, // 휠 줌 비율
            checkCrossOrigin: false, // CORS 체크 비활성화
            checkOrientation: false, // EXIF 방향 체크 비활성화
            modal: true, // 모달 오버레이 표시
            background: true, // 배경 격자 표시
            
            ready: () => {
                console.log('✅ Cropper 초기화 완료');
                console.log('📏 설정된 aspectRatio:', this.options.aspectRatio);
                console.log('🎯 목표 비율:', this.options.previewStyle);
                
                // 초기 크롭 데이터 확인
                const cropData = this.cropper.getData();
                const currentRatio = cropData.width / cropData.height;
                console.log('📊 초기 크롭 영역:', Math.round(cropData.width), 'x', Math.round(cropData.height));
                console.log('📊 초기 실제 비율:', currentRatio.toFixed(3), '목표:', this.options.aspectRatio.toFixed(3));
                
                this.updatePreview();
                this.setupSmartScroll(); // 스마트 스크롤 설정
            },
            
            crop: (event) => {
                const data = event.detail;
                const currentRatio = data.width / data.height;
                const targetRatio = this.options.aspectRatio;
                
                // 비율 차이 허용 오차 (1%) - 더 엄격하게
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
                    this.cropper.setData({
                        x: newX,
                        y: newY,
                        width: newWidth,
                        height: newHeight
                    });
                    
                    console.log('✅ 대각선 비율 조정 완료:', newWidth.toFixed(1), 'x', newHeight.toFixed(1));
                } else {
                    // 정상 범위 내 비율
                    if (Math.abs(currentRatio - targetRatio) > 0.002) {
                        console.log('📏 비율 체크 (정상):', currentRatio.toFixed(3), '목표:', targetRatio.toFixed(3));
                    }
                }
                
                this.updatePreview();
            }
        });

        this.setupSmartScroll();
        } catch (error) {
            console.error('Cropper 초기화 오류:', error);
            this.handleError('이미지 크롭 도구 초기화에 실패했습니다.');
        }
    }

    setupSmartScroll() {
        if (!this.cropper) return;

        const cropContainer = document.querySelector('.crop-image-container');
        if (!cropContainer) return;
        
        // 최대/최소 줌 레벨 설정
        const MIN_ZOOM = 0.1;  // 최소 줌 (10%)
        const MAX_ZOOM = 3.0;  // 최대 줌 (300%)
        
        console.log('🖱️ 스마트 스크롤 기능 활성화');

        cropContainer.addEventListener('wheel', (event) => {
            if (!this.cropper) return;
            
            // 현재 줌 레벨 확인 (더 정확한 방식)
            const canvasData = this.cropper.getCanvasData();
            const currentZoom = canvasData.naturalWidth > 0 ? canvasData.width / canvasData.naturalWidth : 1;
            
            const isZoomingIn = event.deltaY < 0;  // 휠을 위로 올리면 확대
            const isZoomingOut = event.deltaY > 0; // 휠을 아래로 내리면 축소
            
            console.log('🔍 현재 줌:', currentZoom.toFixed(2), '방향:', isZoomingIn ? '확대' : '축소');
            
            // 더 관대한 임계값 설정
            const maxThreshold = 2.8;  // 조금 더 낮은 최대값
            const minThreshold = 0.2;  // 조금 더 높은 최소값
            
            // 확대 시: 최대 줌 근처에서 페이지 스크롤 허용
            if (isZoomingIn && currentZoom >= maxThreshold) {
                this.updateZoomIndicator(currentZoom, '최대 확대');
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
                this.updateZoomIndicator(currentZoom, '최소 축소');
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
            this.cropper.zoom(zoomDelta);
            
            // 줌 표시기 업데이트
            const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + zoomDelta));
            this.updateZoomIndicator(newZoom, isZoomingIn ? '확대' : '축소');
            
        }, { passive: false }); // passive: false로 설정해야 preventDefault 작동
    }
    
    // 줌 표시기 업데이트
    updateZoomIndicator(zoomLevel, status) {
        const zoomIndicator = document.getElementById('zoomIndicator');
        const zoomLevel_element = document.getElementById('zoomLevel');
        const zoomStatus = document.getElementById('zoomStatus');
        
        if (!zoomIndicator || !zoomLevel_element || !zoomStatus) return;
        
        // 줌 레벨을 퍼센트로 표시
        const zoomPercent = Math.round(zoomLevel * 100);
        zoomLevel_element.textContent = zoomPercent + '%';
        
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
        
        zoomStatus.textContent = statusMessage;
        zoomStatus.className = `ms-2 ${statusClass}`;
        
        // 줌 표시기 보이기
        zoomIndicator.style.display = 'block';
        
        // 3초 후 자동 숨김
        clearTimeout(this.zoomIndicatorTimeout);
        this.zoomIndicatorTimeout = setTimeout(() => {
            if (zoomIndicator) {
                zoomIndicator.style.display = 'none';
            }
        }, 3000);
    }

    updateZoomIndicator(zoomLevel, status) {
        const indicator = document.getElementById('zoomIndicator');
        const levelSpan = document.getElementById('zoomLevel');
        const statusSpan = document.getElementById('zoomStatus');
        
        if (!indicator || !levelSpan) return;
        
        // 줌 레벨을 퍼센트로 표시
        const zoomPercent = Math.round(zoomLevel * 100);
        levelSpan.textContent = zoomPercent + '%';
        
        // 상태 메시지 업데이트 (statusSpan이 있는 경우에만)
        if (statusSpan && status) {
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
            
            statusSpan.textContent = statusMessage;
            statusSpan.className = `ms-2 ${statusClass}`;
        }
        
        // 줌 표시기 보이기
        indicator.style.display = 'block';
        
        // 3초 후 자동 숨김
        clearTimeout(this.zoomIndicatorTimeout);
        this.zoomIndicatorTimeout = setTimeout(() => {
            if (indicator) {
                indicator.style.display = 'none';
            }
        }, 3000);
    }

    updatePreview() {
        if (!this.cropper) return;

        const canvas = this.cropper.getCroppedCanvas({
            width: this.options.previewStyle === 'profile' ? 90 : 240,
            height: this.options.previewStyle === 'profile' ? 120 : 150,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        if (canvas) {
            const previewCanvas = document.getElementById('previewCanvas');
            if (previewCanvas) {
                const ctx = previewCanvas.getContext('2d');
                ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
                ctx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);
            }
        }
    }

    async confirmCrop() {
        if (!this.cropper) return;

        this.showProgress(50, '크롭 처리 중...');

        try {
            const canvas = this.cropper.getCroppedCanvas({
                width: this.options.cropWidth,
                height: this.options.cropHeight,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            this.croppedImageData = canvas.toDataURL('image/jpeg', this.options.quality);
            
            // 최종 미리보기 설정
            const finalPreview = document.getElementById('finalPreviewImage');
            if (finalPreview) {
                finalPreview.src = this.croppedImageData;
            }

            await this.updateCompression();
            this.generateAltText();
            
            this.goToStep(3);
            this.hideProgress();
            
        } catch (error) {
            this.hideProgress();
            this.showError('크롭 처리 중 오류가 발생했습니다.');
            console.error(error);
        }
    }

    async updateCompression() {
        if (!this.croppedImageData) return;

        const quality = parseFloat(document.getElementById('qualitySlider')?.value || this.options.quality);
        
        // Canvas에서 다시 압축
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = this.options.cropWidth;
            canvas.height = this.options.cropHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const compressedData = canvas.toDataURL('image/jpeg', quality);
            
            // 압축 정보 업데이트
            this.updateCompressionInfo(compressedData);
            
            // 최종 미리보기 업데이트
            const finalPreview = document.getElementById('finalPreviewImage');
            if (finalPreview) {
                finalPreview.src = compressedData;
            }
            
            this.croppedImageData = compressedData;
        };
        img.src = this.croppedImageData;
    }

    updateCompressionInfo(compressedData) {
        if (!this.currentFile) return;

        const originalSize = this.currentFile.size;
        const compressedSize = this.dataURLtoBlob(compressedData).size;
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        const savingsElement = document.getElementById('compressionSavings');
        if (savingsElement) {
            savingsElement.textContent = 
                `${savings}% 절약 (${this.formatFileSize(compressedSize)})`;
        }
    }

    generateAltText() {
        if (!this.options.enableAltText) return;
        
        const altInput = document.getElementById('altTextInput');
        if (!altInput) return;
        
        // 기본 Alt 텍스트 생성
        let altText = '';
        
        if (this.options.previewStyle === 'profile') {
            altText = '사용자 프로필 사진';
        } else if (this.options.previewStyle === 'facility') {
            altText = '시설 대표 이미지';
        } else {
            altText = '업로드된 이미지';
        }
        
        // 파일명에서 추가 정보 추출
        if (this.currentFile && this.currentFile.name) {
            const fileName = this.currentFile.name.replace(/\.[^/.]+$/, ''); // 확장자 제거
            if (fileName.length > 0 && fileName !== 'image') {
                altText += ` - ${fileName}`;
            }
        }
        
        altInput.value = altText;
        console.log('Alt 텍스트 자동 생성:', altText);
    }

    dataURLtoBlob(dataurl) {
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

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateImageInfo(file) {
        const sizeElement = document.getElementById('imageSize');
        const dimensionsElement = document.getElementById('imageDimensions');
        
        if (sizeElement) {
            sizeElement.textContent = this.formatFileSize(file.size);
        }
        
        if (dimensionsElement) {
            const img = new Image();
            img.onload = () => {
                dimensionsElement.textContent = `${img.width} × ${img.height}px`;
            };
            img.src = URL.createObjectURL(file);
        }
    }

    goToStep(step) {
        this.currentStep = step;
        this.updateStepIndicator(step);
        
        // 모든 섹션 숨기기
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('cropSection').style.display = 'none';
        document.getElementById('finalSection').style.display = 'none';
        
        // 선택된 섹션 표시
        if (step === 1) {
            document.getElementById('uploadSection').style.display = 'block';
        } else if (step === 2) {
            document.getElementById('cropSection').style.display = 'block';
        } else if (step === 3) {
            document.getElementById('finalSection').style.display = 'block';
        }
    }

    updateStepIndicator(step) {
        for (let i = 1; i <= 3; i++) {
            const stepElement = document.getElementById(`step${i}`);
            if (stepElement) {
                stepElement.classList.remove('active', 'completed');
                if (i === step) {
                    stepElement.classList.add('active');
                } else if (i < step) {
                    stepElement.classList.add('completed');
                }
            }
        }
    }

    showProgress(percentage, message) {
        const progressArea = document.getElementById('progressArea');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (progressArea) progressArea.style.display = 'block';
        if (progressBar) progressBar.style.width = percentage + '%';
        if (progressText) progressText.textContent = message;
    }

    hideProgress() {
        const progressArea = document.getElementById('progressArea');
        if (progressArea) progressArea.style.display = 'none';
    }

    showError(message) {
        if (this.options.onError) {
            this.options.onError(message);
        } else {
            console.error(message);
            alert(message);
        }
    }

    removeImage() {
        this.currentFile = null;
        this.croppedImageData = null;
        this.compressedFile = null;
        
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
        
        const fileInput = document.getElementById('imageFileInput');
        if (fileInput) fileInput.value = '';
        
        this.goToStep(1);
    }

    async saveImage() {
        if (!this.croppedImageData) {
            this.showError('저장할 이미지가 없습니다.');
            return;
        }
        
        const altText = document.getElementById('altTextInput')?.value || '';
        
        this.showProgress(80, '이미지 저장 중...');
        
        try {
            const result = {
                imageData: this.croppedImageData,
                altText: altText,
                originalFile: this.currentFile,
                compressedSize: this.dataURLtoBlob(this.croppedImageData).size
            };
            
            if (this.options.onCropComplete) {
                await this.options.onCropComplete(result);
            }
            
            this.hideProgress();
            
        } catch (error) {
            this.hideProgress();
            this.showError('이미지 저장 중 오류가 발생했습니다.');
            console.error(error);
        }
    }

    handleError(message) {
        this.showError(message);
    }

    dataURLtoBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    generateAltText() {
        if (!this.currentFile) return;

        const fileName = this.currentFile.name.toLowerCase();
        let altText = '';

        const keywords = {
            '프로필': '프로필 사진',
            '시설': '시설 이미지',
            '요양원': '요양원 시설',
            '병원': '요양병원 시설',
            '외관': '시설 외관',
            '내부': '시설 내부',
            'profile': '프로필 사진',
            'facility': '시설 이미지'
        };

        for (const [keyword, description] of Object.entries(keywords)) {
            if (fileName.includes(keyword)) {
                altText = description;
                break;
            }
        }

        if (!altText) {
            altText = this.options.previewStyle === 'profile' ? '프로필 사진' : '시설 이미지';
        }

        const altInput = document.getElementById('altTextInput');
        if (altInput) {
            altInput.value = altText;
        }
    }

    updateImageInfo(file) {
        const sizeElement = document.getElementById('imageSize');
        const dimensionsElement = document.getElementById('imageDimensions');
        
        if (sizeElement) {
            sizeElement.textContent = this.formatFileSize(file.size);
        }
        
        // 이미지 크기는 로드 후 업데이트
        const img = new Image();
        img.onload = () => {
            if (dimensionsElement) {
                dimensionsElement.textContent = `${img.width} × ${img.height}`;
            }
        };
        img.src = URL.createObjectURL(file);
    }

    goToStep(step) {
        const sections = ['uploadSection', 'cropSection', 'finalSection'];
        
        sections.forEach((sectionId, index) => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = (index + 1) === step ? 'block' : 'none';
            }
        });
        
        this.currentStep = step;
        this.updateStepIndicator(step);
        
        if (step === 1) {
            this.resetCropper();
        }
    }

    updateStepIndicator(currentStep) {
        if (!this.options.showSteps) return;

        for (let i = 1; i <= 3; i++) {
            const step = document.getElementById(`step${i}`);
            if (step) {
                step.classList.remove('active', 'completed');
                if (i === currentStep) {
                    step.classList.add('active');
                } else if (i < currentStep) {
                    step.classList.add('completed');
                }
            }
        }
    }

    resetCropper() {
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
        this.currentFile = null;
        this.croppedImageData = null;
        
        const fileInput = document.getElementById('imageFileInput');
        if (fileInput) {
            fileInput.value = '';
        }
    }

    removeImage() {
        this.resetCropper();
        this.goToStep(1);
    }

    saveImage() {
        if (!this.croppedImageData) {
            this.showError('크롭된 이미지가 없습니다.');
            return;
        }

        const altTextValue = document.getElementById('altTextInput')?.value || 
                            (this.options.previewStyle === 'profile' ? '프로필 사진' : '시설 이미지');
        
        console.log('Alt 텍스트 디버그:', altTextValue);
        
        const result = {
            imageData: this.croppedImageData,
            altText: altTextValue,
            originalFile: this.currentFile,
            compressedBlob: this.dataURLtoBlob(this.croppedImageData)
        };

        if (this.options.onCropComplete) {
            this.options.onCropComplete(result);
        } else {
            console.log('크롭 완료:', result);
        }
    }

    showProgress(percent, text) {
        const progressArea = document.getElementById('progressArea');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        if (progressArea) progressArea.style.display = 'block';
        if (progressBar) progressBar.style.width = percent + '%';
        if (progressText) progressText.textContent = text;
    }

    hideProgress() {
        const progressArea = document.getElementById('progressArea');
        if (progressArea) progressArea.style.display = 'none';
    }

    showError(message) {
        const existing = this.container.querySelector('.error-message');
        if (existing) existing.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger error-message mt-2';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>${message}`;
        this.container.appendChild(errorDiv);

        setTimeout(() => errorDiv.remove(), 5000);

        if (this.options.onError) {
            this.options.onError(message);
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 외부에서 접근 가능한 메소드들
    getCroppedImageData() {
        return this.croppedImageData;
    }

    getAltText() {
        return document.getElementById('altTextInput')?.value || '';
    }

    getCompressedBlob() {
        return this.croppedImageData ? this.dataURLtoBlob(this.croppedImageData) : null;
    }
}

// 전역에서 사용할 수 있도록 윈도우 객체에 추가
window.AdvancedImageCropper = AdvancedImageCropper;