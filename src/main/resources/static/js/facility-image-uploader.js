/**
 * 시설 이미지 업로드 컴포넌트
 * 드래그&드롭, 고급 크롭, 미리보기, 압축 기능 포함
 * 시설 상세보기 카드 비율(16:10) 최적화
 */
class FacilityImageUploader {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
            maxWidth: 1920,
            maxHeight: 1200,
            quality: 0.8,
            showPreview: true,
            enableAltText: true,
            aspectRatio: 16/10, // 시설 카드 비율 (1.6:1)
            cropWidth: 800,     // 최종 크롭 가로 크기
            cropHeight: 500,    // 최종 크롭 세로 크기 (16:10 비율)
            enableCrop: true,   // 고급 크롭 기능 활성화
            ...options
        };
        
        this.currentFile = null;
        this.compressedFile = null;
        this.cropper = null;
        this.currentStep = 1; // 1: 업로드, 2: 크롭, 3: 완료
        this.init();
    }

    init() {
        this.createUploadUI();
        this.attachEvents();
    }

    createUploadUI() {
        const html = `
            <div class="facility-image-uploader">
                <!-- 단계 표시기 -->
                <div class="steps-indicator mb-4">
                    <div class="step-item" id="step1">
                        <div class="step-circle">
                            <i class="fas fa-upload"></i>
                        </div>
                        <div class="step-label">이미지 선택</div>
                    </div>
                    <div class="step-connector"></div>
                    <div class="step-item" id="step2">
                        <div class="step-circle">
                            <i class="fas fa-crop-alt"></i>
                        </div>
                        <div class="step-label">크롭 & 조정</div>
                    </div>
                    <div class="step-connector"></div>
                    <div class="step-item" id="step3">
                        <div class="step-circle">
                            <i class="fas fa-check"></i>
                        </div>
                        <div class="step-label">완료</div>
                    </div>
                </div>

                <!-- 1단계: 업로드 영역 -->
                <div class="upload-section" id="uploadSection">
                    <div class="upload-area" id="uploadArea">
                        <div class="upload-content">
                            <div class="upload-icon">
                                <i class="fas fa-cloud-upload-alt fa-3x text-primary"></i>
                            </div>
                            <h5 class="upload-title">시설 이미지 업로드</h5>
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
                                    업로드 후 시설 카드에 최적화된 비율로 자동 크롭됩니다
                                </small>
                            </div>
                            <button type="button" class="btn btn-primary btn-lg mt-3" id="selectFileBtn">
                                <i class="fas fa-folder-open me-2"></i>파일 선택
                            </button>
                        </div>
                        <input type="file" id="facilityImageFile" name="facilityImageFile" 
                               accept="image/*" style="display: none;">
                    </div>
                </div>

                <!-- 2단계: 크롭 영역 -->
                <div class="crop-section" id="cropSection" style="display: none;">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="crop-container">
                                <h6 class="mb-3">
                                    <i class="fas fa-crop-alt me-2"></i>이미지 크롭 및 조정
                                    <small class="text-muted ms-2">(시설 카드 최적 비율: 16:10)</small>
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
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="crop-preview-panel">
                                <h6 class="mb-3">
                                    <i class="fas fa-eye me-2"></i>미리보기
                                </h6>
                                
                                <!-- 시설 카드 스타일 미리보기 -->
                                <div class="facility-card-preview mb-3">
                                    <div class="card shadow-sm">
                                        <div class="card-img-container" style="height: 150px; overflow: hidden;">
                                            <canvas id="previewCanvas" width="240" height="150" 
                                                    style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px 8px 0 0;"></canvas>
                                        </div>
                                        <div class="card-body p-2">
                                            <h6 class="card-title mb-1">시설명 예시</h6>
                                            <p class="card-text small text-muted">이런 모습으로 표시됩니다</p>
                                        </div>
                                    </div>
                                </div>

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

                <!-- 3단계: 최종 미리보기 & 압축 설정 -->
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
                                           min="0.1" max="1" step="0.1" value="0.8">
                                    <div class="d-flex justify-content-between">
                                        <small class="text-muted">낮음 (용량↓)</small>
                                        <small class="text-muted">높음 (화질↑)</small>
                                    </div>
                                </div>
                                
                                <button type="button" class="btn btn-sm btn-outline-primary" id="recompressBtn">
                                    <i class="fas fa-redo me-1"></i>다시 최적화
                                </button>
                            </div>

                            <!-- SEO Alt 텍스트 -->
                            <div class="alt-text-section mt-4">
                                <label class="form-label">
                                    <i class="fas fa-tag me-1"></i>SEO 최적화 - 이미지 설명
                                </label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="altTextInput" 
                                           placeholder="시설 이미지에 대한 설명을 입력하세요">
                                    <button type="button" class="btn btn-outline-secondary" id="autoGenerateAltBtn">
                                        <i class="fas fa-magic me-1"></i>자동 생성
                                    </button>
                                </div>
                                <small class="form-text text-muted">
                                    검색엔진 최적화를 위해 이미지를 설명하는 텍스트를 입력하세요
                                </small>
                            </div>
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
                                    <i class="fas fa-save me-1"></i>이미지 저장
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
        this.updateStepIndicator(1);
    }

    attachEvents() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('facilityImageFile');
        const selectFileBtn = document.getElementById('selectFileBtn');
        const removeImageBtn = document.getElementById('removeImageBtn');
        const qualitySlider = document.getElementById('qualitySlider');
        const maxWidthInput = document.getElementById('maxWidthInput');
        const recompressBtn = document.getElementById('recompressBtn');
        const autoGenerateAltBtn = document.getElementById('autoGenerateAltBtn');

        // 파일 선택 버튼 클릭
        selectFileBtn.addEventListener('click', () => fileInput.click());

        // 드래그 앤 드롭 이벤트
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // 파일 선택 이벤트
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // 이미지 제거
        removeImageBtn.addEventListener('click', () => {
            this.removeImage();
        });

        // 압축 설정 변경
        qualitySlider.addEventListener('input', () => {
            this.updateQualityLabel();
        });

        maxWidthInput.addEventListener('change', () => {
            if (this.currentFile) {
                this.compressImage();
            }
        });

        recompressBtn.addEventListener('click', () => {
            if (this.currentFile) {
                this.compressImage();
            }
        });

        // Alt 텍스트 자동 생성
        autoGenerateAltBtn.addEventListener('click', () => {
            this.generateAltText();
        });
    }

    async handleFileSelect(file) {
        // 파일 유효성 검사
        if (!this.validateFile(file)) {
            return;
        }

        this.currentFile = file;
        this.showProgress();

        try {
            // 이미지 미리보기
            await this.showPreview(file);
            
            // 이미지 압축
            await this.compressImage();
            
            // Alt 텍스트 자동 생성
            this.generateAltText();
            
            this.hideProgress();
            this.showPreviewArea();
            
        } catch (error) {
            console.error('파일 처리 중 오류:', error);
            this.showError('파일 처리 중 오류가 발생했습니다.');
            this.hideProgress();
        }
    }

    validateFile(file) {
        // 파일 크기 검사
        if (file.size > this.options.maxFileSize) {
            this.showError(`파일 크기가 너무 큽니다. 최대 ${this.formatFileSize(this.options.maxFileSize)}까지 가능합니다.`);
            return false;
        }

        // 파일 타입 검사
        if (!this.options.allowedTypes.includes(file.type)) {
            this.showError('지원하지 않는 파일 형식입니다. JPG, PNG, WEBP 파일만 업로드 가능합니다.');
            return false;
        }

        return true;
    }

    async showPreview(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewImage = document.getElementById('previewImage');
                previewImage.src = e.target.result;
                
                // 이미지 정보 표시
                previewImage.onload = () => {
                    document.getElementById('imageSize').textContent = this.formatFileSize(file.size);
                    document.getElementById('imageDimensions').textContent = 
                        `${previewImage.naturalWidth} × ${previewImage.naturalHeight}`;
                    resolve();
                };
            };
            reader.readAsDataURL(file);
        });
    }

    async compressImage() {
        if (!this.currentFile) return;

        this.updateProgress(20, '이미지 압축 중...');

        const quality = parseFloat(document.getElementById('qualitySlider').value);
        const maxWidth = parseInt(document.getElementById('maxWidthInput').value);

        try {
            const compressedFile = await this.compressFileWithCanvas(this.currentFile, {
                quality: quality,
                maxWidth: maxWidth,
                maxHeight: this.options.maxHeight
            });

            this.compressedFile = compressedFile;
            this.updateCompressionInfo();
            this.updateProgress(100, '압축 완료');

        } catch (error) {
            console.error('압축 오류:', error);
            this.showError('이미지 압축 중 오류가 발생했습니다.');
        }
    }

    compressFileWithCanvas(file, options) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // 리사이즈 계산
                let { width, height } = this.calculateNewDimensions(
                    img.width, img.height, options.maxWidth, options.maxHeight
                );

                canvas.width = width;
                canvas.height = height;

                // 이미지 그리기
                ctx.drawImage(img, 0, 0, width, height);

                // Blob으로 변환
                canvas.toBlob((blob) => {
                    // File 객체 생성
                    const compressedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    });
                    resolve(compressedFile);
                }, file.type, options.quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }

    calculateNewDimensions(width, height, maxWidth, maxHeight) {
        if (width <= maxWidth && height <= maxHeight) {
            return { width, height };
        }

        const ratio = Math.min(maxWidth / width, maxHeight / height);
        return {
            width: Math.round(width * ratio),
            height: Math.round(height * ratio)
        };
    }

    updateCompressionInfo() {
        if (!this.currentFile || !this.compressedFile) return;

        const originalSize = this.currentFile.size;
        const compressedSize = this.compressedFile.size;
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        document.getElementById('compressionSavings').textContent = 
            `${savings}% 절약 (${this.formatFileSize(compressedSize)})`;
    }

    generateAltText() {
        // 파일명 기반 Alt 텍스트 자동 생성
        if (!this.currentFile) return;

        const fileName = this.currentFile.name.toLowerCase();
        let altText = '';

        // 시설 관련 키워드 매핑
        const keywords = {
            '요양원': '요양원 시설',
            '병원': '요양병원 시설',
            '데이케어': '데이케어센터 시설',
            '외관': '시설 외관',
            '내부': '시설 내부',
            '로비': '시설 로비',
            '복도': '시설 복도',
            '방': '시설 객실',
            '식당': '시설 식당',
            '정원': '시설 정원',
            'facility': '시설',
            'building': '건물',
            'room': '객실',
            'lobby': '로비'
        };

        // 키워드 매칭
        for (const [keyword, description] of Object.entries(keywords)) {
            if (fileName.includes(keyword)) {
                altText = description;
                break;
            }
        }

        // 기본값
        if (!altText) {
            altText = '시설 이미지';
        }

        document.getElementById('altTextInput').value = altText;
    }

    removeImage() {
        this.currentFile = null;
        this.compressedFile = null;
        
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('previewArea').style.display = 'none';
        document.getElementById('facilityImageFile').value = '';
    }

    showPreviewArea() {
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('previewArea').style.display = 'block';
    }

    showProgress() {
        document.getElementById('progressArea').style.display = 'block';
    }

    hideProgress() {
        document.getElementById('progressArea').style.display = 'none';
    }

    updateProgress(percent, text) {
        document.getElementById('progressBar').style.width = percent + '%';
        document.getElementById('progressText').textContent = text;
    }

    updateQualityLabel() {
        const quality = document.getElementById('qualitySlider').value;
        const label = document.querySelector('label[class*="품질"]');
        if (label) {
            label.textContent = `품질 (${Math.round(quality * 100)}%)`;
        }
    }

    showError(message) {
        // 기존 에러 메시지 제거
        const existingError = this.container.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // 새 에러 메시지 표시
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger error-message mt-2';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>${message}`;
        this.container.appendChild(errorDiv);

        // 3초 후 자동 제거
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 외부에서 압축된 파일 가져오기
    getCompressedFile() {
        return this.compressedFile || this.currentFile;
    }

    // Alt 텍스트 가져오기
    getAltText() {
        return document.getElementById('altTextInput').value;
    }
}

// 전역에서 사용할 수 있도록 윈도우 객체에 추가
window.FacilityImageUploader = FacilityImageUploader;