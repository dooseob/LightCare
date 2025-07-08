/**
 * 시설 이미지 업로드 모듈 (Upload Module)
 * 파일 업로드, 드래그앤드롭, 파일 검증 전용 모듈
 * 
 * 주요 기능:
 * - 다중 파일 업로드
 * - 드래그앤드롭 인터페이스
 * - 파일 형식 및 크기 검증
 * - 이미지 압축 및 최적화
 * - 파일 미리보기
 * - 프로그레스 표시
 * - 에러 핸들링
 * 
 * @version 1.0.0
 * @author LightCare Team
 * @requires FacilityImageCore
 */

(function() {
    'use strict';
    
    // Core 모듈 의존성 체크
    if (!window.FacilityImageCore) {
        throw new Error('FacilityImageCore 모듈이 필요합니다.');
    }
    
    const Core = window.FacilityImageCore;
    
    // ================================================
    // 모듈 네임스페이스 생성
    // ================================================
    
    if (!window.FacilityImageSystem.Upload) {
        window.FacilityImageSystem.Upload = {};
    }
    
    // ================================================
    // 상수 정의
    // ================================================
    
    const UPLOAD_CONSTANTS = {
        MODULE_NAME: 'FacilityImageUpload',
        VERSION: '1.0.0',
        
        // 파일 제한
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        MAX_FILES: 5,
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
        ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.avif'],
        
        // 드래그앤드롭 상태
        DRAG_STATES: {
            NONE: 'none',
            ENTER: 'enter',
            OVER: 'over',
            LEAVE: 'leave'
        },
        
        // 파일 상태
        FILE_STATUS: {
            PENDING: 'pending',
            VALIDATING: 'validating',
            VALID: 'valid',
            INVALID: 'invalid',
            UPLOADING: 'uploading',
            UPLOADED: 'uploaded',
            ERROR: 'error'
        },
        
        // 압축 설정
        COMPRESSION_OPTIONS: {
            quality: 0.8,
            maxWidth: 1920,
            maxHeight: 1200,
            format: 'image/jpeg',
            enableCompression: true
        },
        
        // 에러 메시지
        ERROR_MESSAGES: {
            INVALID_TYPE: '지원하지 않는 파일 형식입니다.',
            FILE_TOO_LARGE: '파일 크기가 너무 큽니다.',
            TOO_MANY_FILES: '최대 업로드 가능한 파일 수를 초과했습니다.',
            UPLOAD_FAILED: '업로드에 실패했습니다.',
            READ_ERROR: '파일을 읽을 수 없습니다.',
            COMPRESSION_ERROR: '이미지 압축에 실패했습니다.'
        }
    };
    
    // ================================================
    // 업로드 상태 관리
    // ================================================
    
    const uploadState = {
        // 파일 목록
        files: [],
        validatedFiles: [],
        compressedFiles: [],
        
        // 현재 상태
        isInitialized: false,
        isDragging: false,
        isUploading: false,
        isProcessing: false,
        
        // 진행률
        progress: {
            current: 0,
            total: 0,
            percentage: 0
        },
        
        // UI 요소
        elements: {
            dropZone: null,
            fileInput: null,
            selectButton: null,
            previewContainer: null,
            progressBar: null,
            statusMessage: null
        },
        
        // 설정
        settings: {
            maxFileSize: UPLOAD_CONSTANTS.MAX_FILE_SIZE,
            maxFiles: UPLOAD_CONSTANTS.MAX_FILES,
            allowedTypes: UPLOAD_CONSTANTS.ALLOWED_TYPES,
            enableCompression: UPLOAD_CONSTANTS.COMPRESSION_OPTIONS.enableCompression,
            compressionQuality: UPLOAD_CONSTANTS.COMPRESSION_OPTIONS.quality
        },
        
        // 콜백 함수
        callbacks: {
            onFileSelect: null,
            onFileValidate: null,
            onFileCompress: null,
            onUploadProgress: null,
            onUploadComplete: null,
            onError: null
        }
    };
    
    // ================================================
    // DOM 요소 관리
    // ================================================
    
    const domManager = {
        /**
         * DOM 요소 초기화
         * @returns {boolean} 초기화 성공 여부
         */
        initializeElements() {
            const elements = {
                dropZone: document.querySelector('.upload-area, .drop-zone, #uploadArea'),
                fileInput: document.querySelector('#imageInput, #facilityImageFile, input[type="file"]'),
                selectButton: document.querySelector('#selectFileBtn, .select-file-btn'),
                previewContainer: document.querySelector('.selected-images-preview, #selectedImagesPreview'),
                progressBar: document.querySelector('.progress-bar, #uploadProgress'),
                statusMessage: document.querySelector('.upload-status, #uploadStatus')
            };
            
            uploadState.elements = elements;
            
            // 동적 요소 생성
            this.createMissingElements();
            
            Core.logger.log('업로드 DOM 요소 초기화 완료', {
                hasDropZone: !!elements.dropZone,
                hasFileInput: !!elements.fileInput,
                hasSelectButton: !!elements.selectButton
            });
            
            return true;
        },
        
        /**
         * 누락된 요소 동적 생성
         */
        createMissingElements() {
            const elements = uploadState.elements;
            
            // 드롭존 생성
            if (!elements.dropZone) {
                elements.dropZone = this.createDropZone();
            }
            
            // 파일 입력 생성
            if (!elements.fileInput) {
                elements.fileInput = this.createFileInput();
            }
            
            // 선택 버튼 생성
            if (!elements.selectButton) {
                elements.selectButton = this.createSelectButton();
            }
            
            // 미리보기 컨테이너 생성
            if (!elements.previewContainer) {
                elements.previewContainer = this.createPreviewContainer();
            }
            
            // 진행률 표시기 생성
            if (!elements.progressBar) {
                elements.progressBar = this.createProgressBar();
            }
        },
        
        /**
         * 드롭존 생성
         * @returns {HTMLElement} 드롭존 요소
         */
        createDropZone() {
            const dropZone = document.createElement('div');
            dropZone.className = 'upload-area drop-zone';
            dropZone.innerHTML = `
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
                    </div>
                </div>
            `;
            
            dropZone.style.cssText = `
                border: 2px dashed #dee2e6;
                border-radius: 8px;
                padding: 3rem;
                text-align: center;
                background: #f8f9fa;
                transition: all 0.3s ease;
                cursor: pointer;
                min-height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            // 적절한 위치에 추가
            const container = document.querySelector('.upload-section, #uploadSection, main');
            if (container) {
                container.appendChild(dropZone);
            } else {
                document.body.appendChild(dropZone);
            }
            
            return dropZone;
        },
        
        /**
         * 파일 입력 생성
         * @returns {HTMLInputElement} 파일 입력 요소
         */
        createFileInput() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = UPLOAD_CONSTANTS.ALLOWED_TYPES.join(',');
            fileInput.multiple = true;
            fileInput.style.display = 'none';
            fileInput.id = 'facilityImageFile';
            
            document.body.appendChild(fileInput);
            return fileInput;
        },
        
        /**
         * 선택 버튼 생성
         * @returns {HTMLButtonElement} 선택 버튼 요소
         */
        createSelectButton() {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-primary btn-lg';
            button.innerHTML = '<i class="fas fa-folder-open me-2"></i>파일 선택';
            
            const dropZone = uploadState.elements.dropZone;
            if (dropZone) {
                dropZone.appendChild(button);
            }
            
            return button;
        },
        
        /**
         * 미리보기 컨테이너 생성
         * @returns {HTMLElement} 미리보기 컨테이너 요소
         */
        createPreviewContainer() {
            const container = document.createElement('div');
            container.className = 'selected-images-preview mt-4';
            container.innerHTML = `
                <h6 class="mb-3">
                    <i class="fas fa-images me-2"></i>선택된 이미지
                    <span class="badge bg-secondary ms-2" id="imageCount">0</span>
                </h6>
                <div class="row" id="previewGrid"></div>
            `;
            
            const dropZone = uploadState.elements.dropZone;
            if (dropZone && dropZone.parentElement) {
                dropZone.parentElement.appendChild(container);
            }
            
            return container;
        },
        
        /**
         * 진행률 표시기 생성
         * @returns {HTMLElement} 진행률 표시기 요소
         */
        createProgressBar() {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'upload-progress mt-3';
            progressContainer.style.display = 'none';
            progressContainer.innerHTML = `
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                </div>
                <div class="progress-text text-center mt-2">
                    <small class="text-muted">준비 중...</small>
                </div>
            `;
            
            const dropZone = uploadState.elements.dropZone;
            if (dropZone && dropZone.parentElement) {
                dropZone.parentElement.appendChild(progressContainer);
            }
            
            return progressContainer;
        }
    };
    
    // ================================================
    // 파일 검증 시스템
    // ================================================
    
    const fileValidator = {
        /**
         * 파일 검증
         * @param {File} file - 검증할 파일
         * @returns {Object} 검증 결과
         */
        validateFile(file) {
            const result = {
                isValid: true,
                errors: [],
                warnings: []
            };
            
            // 파일 타입 검증
            if (!this.validateFileType(file)) {
                result.isValid = false;
                result.errors.push(UPLOAD_CONSTANTS.ERROR_MESSAGES.INVALID_TYPE);
            }
            
            // 파일 크기 검증
            if (!this.validateFileSize(file)) {
                result.isValid = false;
                result.errors.push(UPLOAD_CONSTANTS.ERROR_MESSAGES.FILE_TOO_LARGE);
            }
            
            // 파일 이름 검증
            const nameValidation = this.validateFileName(file.name);
            if (!nameValidation.isValid) {
                result.warnings.push(...nameValidation.warnings);
            }
            
            return result;
        },
        
        /**
         * 파일 타입 검증
         * @param {File} file - 검증할 파일
         * @returns {boolean} 유효한 타입인지 여부
         */
        validateFileType(file) {
            const allowedTypes = uploadState.settings.allowedTypes;
            return allowedTypes.includes(file.type);
        },
        
        /**
         * 파일 크기 검증
         * @param {File} file - 검증할 파일
         * @returns {boolean} 유효한 크기인지 여부
         */
        validateFileSize(file) {
            return file.size <= uploadState.settings.maxFileSize;
        },
        
        /**
         * 파일 이름 검증
         * @param {string} fileName - 파일 이름
         * @returns {Object} 검증 결과
         */
        validateFileName(fileName) {
            const result = {
                isValid: true,
                warnings: []
            };
            
            // 한글 파일명 체크
            if (/[가-힣]/.test(fileName)) {
                result.warnings.push('한글 파일명은 SEO에 불리할 수 있습니다.');
            }
            
            // 특수문자 체크
            if (/[^a-zA-Z0-9.\-_]/.test(fileName)) {
                result.warnings.push('특수문자가 포함된 파일명입니다.');
            }
            
            return result;
        },
        
        /**
         * 다중 파일 검증
         * @param {FileList} fileList - 파일 목록
         * @returns {Object} 검증 결과
         */
        validateFiles(fileList) {
            const files = Array.from(fileList);
            const result = {
                validFiles: [],
                invalidFiles: [],
                errors: [],
                warnings: []
            };
            
            // 파일 개수 체크
            if (files.length > uploadState.settings.maxFiles) {
                result.errors.push(UPLOAD_CONSTANTS.ERROR_MESSAGES.TOO_MANY_FILES);
                return result;
            }
            
            // 각 파일 검증
            files.forEach((file, index) => {
                const validation = this.validateFile(file);
                
                if (validation.isValid) {
                    result.validFiles.push({
                        file: file,
                        index: index,
                        id: Core.utils.generateUniqueId(),
                        status: UPLOAD_CONSTANTS.FILE_STATUS.VALID
                    });
                } else {
                    result.invalidFiles.push({
                        file: file,
                        index: index,
                        errors: validation.errors
                    });
                }
                
                result.errors.push(...validation.errors);
                result.warnings.push(...validation.warnings);
            });
            
            return result;
        }
    };
    
    // ================================================
    // 파일 압축 시스템
    // ================================================
    
    const fileCompressor = {
        /**
         * 이미지 압축
         * @param {File} file - 압축할 파일
         * @param {Object} options - 압축 옵션
         * @returns {Promise<Blob>} 압축된 이미지 Blob
         */
        async compressImage(file, options = {}) {
            const defaultOptions = {
                ...UPLOAD_CONSTANTS.COMPRESSION_OPTIONS,
                ...options
            };
            
            if (!defaultOptions.enableCompression) {
                return file;
            }
            
            try {
                const canvas = await this.createCanvas(file, defaultOptions);
                const compressedBlob = await this.canvasToBlob(canvas, defaultOptions);
                
                Core.logger.log('이미지 압축 완료', {
                    originalSize: Core.utils.formatFileSize(file.size),
                    compressedSize: Core.utils.formatFileSize(compressedBlob.size),
                    compressionRatio: Math.round((1 - compressedBlob.size / file.size) * 100) + '%'
                });
                
                return compressedBlob;
                
            } catch (error) {
                Core.logger.error('이미지 압축 실패:', error);
                throw error;
            }
        },
        
        /**
         * 캔버스 생성
         * @param {File} file - 이미지 파일
         * @param {Object} options - 옵션
         * @returns {Promise<HTMLCanvasElement>} 캔버스
         */
        async createCanvas(file, options) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // 크기 계산
                    const { width, height } = this.calculateNewDimensions(
                        img.width, 
                        img.height, 
                        options.maxWidth, 
                        options.maxHeight
                    );
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // 이미지 그리기
                    ctx.fillStyle = options.fillColor || '#ffffff';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    resolve(canvas);
                };
                
                img.onerror = () => {
                    reject(new Error('이미지 로드 실패'));
                };
                
                img.src = URL.createObjectURL(file);
            });
        },
        
        /**
         * 캔버스를 Blob으로 변환
         * @param {HTMLCanvasElement} canvas - 캔버스
         * @param {Object} options - 옵션
         * @returns {Promise<Blob>} Blob
         */
        async canvasToBlob(canvas, options) {
            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Blob 생성 실패'));
                    }
                }, options.format, options.quality);
            });
        },
        
        /**
         * 새로운 크기 계산
         * @param {number} width - 원본 너비
         * @param {number} height - 원본 높이
         * @param {number} maxWidth - 최대 너비
         * @param {number} maxHeight - 최대 높이
         * @returns {Object} 새로운 크기
         */
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
    };
    
    // ================================================
    // 드래그앤드롭 시스템
    // ================================================
    
    const dragDropHandler = {
        /**
         * 드래그앤드롭 이벤트 설정
         */
        setupDragAndDrop() {
            const dropZone = uploadState.elements.dropZone;
            if (!dropZone) return;
            
            // 드래그 이벤트 리스너
            dropZone.addEventListener('dragenter', this.handleDragEnter.bind(this));
            dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
            dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
            dropZone.addEventListener('drop', this.handleDrop.bind(this));
            
            // 클릭 이벤트 리스너
            dropZone.addEventListener('click', this.handleClick.bind(this));
            
            // 전역 드래그 이벤트 방지
            document.addEventListener('dragover', (e) => e.preventDefault());
            document.addEventListener('drop', (e) => e.preventDefault());
            
            Core.logger.log('드래그앤드롭 이벤트 설정 완료');
        },
        
        /**
         * 드래그 진입 이벤트
         * @param {DragEvent} event - 드래그 이벤트
         */
        handleDragEnter(event) {
            event.preventDefault();
            event.stopPropagation();
            
            uploadState.isDragging = true;
            this.updateDropZoneStyle(UPLOAD_CONSTANTS.DRAG_STATES.ENTER);
        },
        
        /**
         * 드래그 오버 이벤트
         * @param {DragEvent} event - 드래그 이벤트
         */
        handleDragOver(event) {
            event.preventDefault();
            event.stopPropagation();
            
            this.updateDropZoneStyle(UPLOAD_CONSTANTS.DRAG_STATES.OVER);
        },
        
        /**
         * 드래그 떠남 이벤트
         * @param {DragEvent} event - 드래그 이벤트
         */
        handleDragLeave(event) {
            event.preventDefault();
            event.stopPropagation();
            
            if (!event.currentTarget.contains(event.relatedTarget)) {
                uploadState.isDragging = false;
                this.updateDropZoneStyle(UPLOAD_CONSTANTS.DRAG_STATES.LEAVE);
            }
        },
        
        /**
         * 드롭 이벤트
         * @param {DragEvent} event - 드래그 이벤트
         */
        handleDrop(event) {
            event.preventDefault();
            event.stopPropagation();
            
            uploadState.isDragging = false;
            this.updateDropZoneStyle(UPLOAD_CONSTANTS.DRAG_STATES.NONE);
            
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                this.handleFiles(files);
            }
        },
        
        /**
         * 클릭 이벤트
         * @param {Event} event - 클릭 이벤트
         */
        handleClick(event) {
            event.preventDefault();
            const fileInput = uploadState.elements.fileInput;
            if (fileInput) {
                fileInput.click();
            }
        },
        
        /**
         * 드롭존 스타일 업데이트
         * @param {string} state - 드래그 상태
         */
        updateDropZoneStyle(state) {
            const dropZone = uploadState.elements.dropZone;
            if (!dropZone) return;
            
            // 기존 클래스 제거
            dropZone.classList.remove('drag-enter', 'drag-over', 'drag-leave');
            
            switch (state) {
                case UPLOAD_CONSTANTS.DRAG_STATES.ENTER:
                    dropZone.classList.add('drag-enter');
                    dropZone.style.borderColor = '#007bff';
                    dropZone.style.backgroundColor = '#e3f2fd';
                    break;
                case UPLOAD_CONSTANTS.DRAG_STATES.OVER:
                    dropZone.classList.add('drag-over');
                    dropZone.style.borderColor = '#0056b3';
                    dropZone.style.backgroundColor = '#bbdefb';
                    break;
                case UPLOAD_CONSTANTS.DRAG_STATES.LEAVE:
                case UPLOAD_CONSTANTS.DRAG_STATES.NONE:
                    dropZone.classList.add('drag-leave');
                    dropZone.style.borderColor = '#dee2e6';
                    dropZone.style.backgroundColor = '#f8f9fa';
                    break;
            }
        },
        
        /**
         * 파일 처리
         * @param {FileList} files - 파일 목록
         */
        async handleFiles(files) {
            Core.logger.log('파일 처리 시작', { count: files.length });
            
            try {
                // 파일 검증
                const validation = fileValidator.validateFiles(files);
                
                if (validation.errors.length > 0) {
                    this.showErrors(validation.errors);
                    return;
                }
                
                if (validation.warnings.length > 0) {
                    this.showWarnings(validation.warnings);
                }
                
                // 유효한 파일들 처리
                if (validation.validFiles.length > 0) {
                    uploadState.files = validation.validFiles;
                    await this.processFiles(validation.validFiles);
                }
                
            } catch (error) {
                Core.logger.error('파일 처리 중 오류:', error);
                this.showError('파일 처리 중 오류가 발생했습니다.');
            }
        },
        
        /**
         * 파일 처리 (압축 및 미리보기)
         * @param {Array} files - 파일 배열
         */
        async processFiles(files) {
            uploadState.isProcessing = true;
            this.showProgress(0, files.length);
            
            try {
                for (let i = 0; i < files.length; i++) {
                    const fileData = files[i];
                    
                    // 압축 처리
                    if (uploadState.settings.enableCompression) {
                        const compressedBlob = await fileCompressor.compressImage(fileData.file);
                        fileData.compressedBlob = compressedBlob;
                    }
                    
                    // 미리보기 생성
                    await this.createPreview(fileData);
                    
                    // 진행률 업데이트
                    this.updateProgress(i + 1, files.length);
                }
                
                // 완료 처리
                uploadState.validatedFiles = files;
                this.hideProgress();
                
                // 콜백 호출
                if (uploadState.callbacks.onFileSelect) {
                    uploadState.callbacks.onFileSelect(files);
                }
                
                Core.emit(Core.CONSTANTS.EVENTS.IMAGE_ADDED, {
                    files: files,
                    count: files.length
                });
                
            } catch (error) {
                Core.logger.error('파일 처리 실패:', error);
                this.showError('파일 처리에 실패했습니다.');
            } finally {
                uploadState.isProcessing = false;
            }
        },
        
        /**
         * 미리보기 생성
         * @param {Object} fileData - 파일 데이터
         */
        async createPreview(fileData) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const previewHtml = this.createPreviewHtml(fileData, e.target.result);
                    this.addPreviewToContainer(previewHtml);
                    resolve();
                };
                
                reader.onerror = () => {
                    Core.logger.error('미리보기 생성 실패:', fileData.file.name);
                    resolve();
                };
                
                reader.readAsDataURL(fileData.file);
            });
        },
        
        /**
         * 미리보기 HTML 생성
         * @param {Object} fileData - 파일 데이터
         * @param {string} dataUrl - 데이터 URL
         * @returns {string} 미리보기 HTML
         */
        createPreviewHtml(fileData, dataUrl) {
            return `
                <div class="col-md-3 mb-3" data-file-id="${fileData.id}">
                    <div class="card">
                        <div class="card-img-top" style="height: 150px; overflow: hidden;">
                            <img src="${dataUrl}" alt="${fileData.file.name}" 
                                 style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div class="card-body p-2">
                            <h6 class="card-title small mb-1">${fileData.file.name}</h6>
                            <p class="card-text small text-muted mb-1">
                                ${Core.utils.formatFileSize(fileData.file.size)}
                            </p>
                            <button type="button" class="btn btn-sm btn-outline-danger" 
                                    onclick="FacilityImageUpload.removeFile('${fileData.id}')">
                                <i class="fas fa-times"></i> 제거
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },
        
        /**
         * 미리보기 컨테이너에 추가
         * @param {string} html - 미리보기 HTML
         */
        addPreviewToContainer(html) {
            const container = uploadState.elements.previewContainer;
            if (!container) return;
            
            const grid = container.querySelector('#previewGrid, .row');
            if (grid) {
                grid.insertAdjacentHTML('beforeend', html);
            }
            
            // 카운터 업데이트
            const counter = container.querySelector('#imageCount');
            if (counter) {
                counter.textContent = uploadState.files.length;
            }
            
            // 컨테이너 표시
            container.style.display = 'block';
        },
        
        /**
         * 진행률 표시
         * @param {number} current - 현재 진행
         * @param {number} total - 전체 개수
         */
        showProgress(current, total) {
            const progressBar = uploadState.elements.progressBar;
            if (!progressBar) return;
            
            const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
            const progressElement = progressBar.querySelector('.progress-bar');
            const textElement = progressBar.querySelector('.progress-text small');
            
            if (progressElement) {
                progressElement.style.width = percentage + '%';
                progressElement.setAttribute('aria-valuenow', percentage);
            }
            
            if (textElement) {
                textElement.textContent = `처리 중... ${current}/${total} (${percentage}%)`;
            }
            
            progressBar.style.display = 'block';
        },
        
        /**
         * 진행률 업데이트
         * @param {number} current - 현재 진행
         * @param {number} total - 전체 개수
         */
        updateProgress(current, total) {
            uploadState.progress = {
                current,
                total,
                percentage: Math.round((current / total) * 100)
            };
            
            this.showProgress(current, total);
        },
        
        /**
         * 진행률 숨김
         */
        hideProgress() {
            const progressBar = uploadState.elements.progressBar;
            if (progressBar) {
                progressBar.style.display = 'none';
            }
        },
        
        /**
         * 에러 표시
         * @param {Array} errors - 에러 배열
         */
        showErrors(errors) {
            errors.forEach(error => {
                this.showError(error);
            });
        },
        
        /**
         * 경고 표시
         * @param {Array} warnings - 경고 배열
         */
        showWarnings(warnings) {
            warnings.forEach(warning => {
                this.showWarning(warning);
            });
        },
        
        /**
         * 에러 메시지 표시
         * @param {string} message - 에러 메시지
         */
        showError(message) {
            Core.logger.error(message);
            // 토스트 또는 알림 표시
            this.showNotification(message, 'error');
        },
        
        /**
         * 경고 메시지 표시
         * @param {string} message - 경고 메시지
         */
        showWarning(message) {
            Core.logger.warn(message);
            this.showNotification(message, 'warning');
        },
        
        /**
         * 알림 표시
         * @param {string} message - 메시지
         * @param {string} type - 타입 (error, warning, info)
         */
        showNotification(message, type = 'info') {
            // 간단한 알림 구현
            const notification = document.createElement('div');
            notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'info'} alert-dismissible fade show`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1050;
                max-width: 400px;
            `;
            
            notification.innerHTML = `
                <strong>${type === 'error' ? '오류' : type === 'warning' ? '경고' : '정보'}:</strong> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            document.body.appendChild(notification);
            
            // 5초 후 자동 제거
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 5000);
        }
    };
    
    // ================================================
    // 메인 업로드 객체
    // ================================================
    
    const uploader = {
        /**
         * 업로드 모듈 초기화
         * @param {Object} options - 초기화 옵션
         * @returns {Promise<boolean>} 초기화 성공 여부
         */
        async initialize(options = {}) {
            if (uploadState.isInitialized) {
                Core.logger.warn('업로드 모듈이 이미 초기화됨');
                return true;
            }
            
            Core.logger.log('업로드 모듈 초기화 시작');
            
            try {
                // 설정 병합
                if (options.settings) {
                    Object.assign(uploadState.settings, options.settings);
                }
                
                // 콜백 설정
                if (options.callbacks) {
                    Object.assign(uploadState.callbacks, options.callbacks);
                }
                
                // DOM 요소 초기화
                domManager.initializeElements();
                
                // 드래그앤드롭 설정
                dragDropHandler.setupDragAndDrop();
                
                // 파일 입력 이벤트 설정
                this.setupFileInputEvents();
                
                uploadState.isInitialized = true;
                Core.logger.success('업로드 모듈 초기화 완료');
                
                return true;
                
            } catch (error) {
                Core.logger.error('업로드 모듈 초기화 실패:', error);
                return false;
            }
        },
        
        /**
         * 파일 입력 이벤트 설정
         */
        setupFileInputEvents() {
            const fileInput = uploadState.elements.fileInput;
            if (!fileInput) return;
            
            fileInput.addEventListener('change', async (event) => {
                const files = event.target.files;
                if (files.length > 0) {
                    await dragDropHandler.handleFiles(files);
                }
            });
        },
        
        /**
         * 파일 제거
         * @param {string} fileId - 파일 ID
         */
        removeFile(fileId) {
            // 파일 목록에서 제거
            uploadState.files = uploadState.files.filter(file => file.id !== fileId);
            uploadState.validatedFiles = uploadState.validatedFiles.filter(file => file.id !== fileId);
            
            // DOM에서 제거
            const previewElement = document.querySelector(`[data-file-id="${fileId}"]`);
            if (previewElement) {
                previewElement.remove();
            }
            
            // 카운터 업데이트
            const counter = document.querySelector('#imageCount');
            if (counter) {
                counter.textContent = uploadState.files.length;
            }
            
            // 이벤트 발생
            Core.emit(Core.CONSTANTS.EVENTS.IMAGE_REMOVED, {
                fileId: fileId,
                remainingCount: uploadState.files.length
            });
            
            Core.logger.log('파일 제거 완료:', fileId);
        },
        
        /**
         * 모든 파일 제거
         */
        clearAllFiles() {
            uploadState.files = [];
            uploadState.validatedFiles = [];
            uploadState.compressedFiles = [];
            
            // DOM 정리
            const previewContainer = uploadState.elements.previewContainer;
            if (previewContainer) {
                const grid = previewContainer.querySelector('#previewGrid, .row');
                if (grid) {
                    grid.innerHTML = '';
                }
                
                const counter = previewContainer.querySelector('#imageCount');
                if (counter) {
                    counter.textContent = '0';
                }
                
                previewContainer.style.display = 'none';
            }
            
            Core.logger.log('모든 파일 제거 완료');
        },
        
        /**
         * 현재 선택된 파일 반환
         * @returns {Array} 파일 배열
         */
        getFiles() {
            return uploadState.validatedFiles;
        },
        
        /**
         * 압축된 파일 반환
         * @returns {Array} 압축된 파일 배열
         */
        getCompressedFiles() {
            return uploadState.validatedFiles.filter(file => file.compressedBlob);
        },
        
        /**
         * 업로드 상태 반환
         * @returns {Object} 업로드 상태
         */
        getUploadState() {
            return {
                isInitialized: uploadState.isInitialized,
                isUploading: uploadState.isUploading,
                isProcessing: uploadState.isProcessing,
                fileCount: uploadState.files.length,
                validFileCount: uploadState.validatedFiles.length,
                progress: uploadState.progress
            };
        },
        
        /**
         * 업로드 모듈 제거
         */
        destroy() {
            this.clearAllFiles();
            
            // 이벤트 리스너 제거
            const dropZone = uploadState.elements.dropZone;
            if (dropZone) {
                dropZone.removeEventListener('dragenter', dragDropHandler.handleDragEnter);
                dropZone.removeEventListener('dragover', dragDropHandler.handleDragOver);
                dropZone.removeEventListener('dragleave', dragDropHandler.handleDragLeave);
                dropZone.removeEventListener('drop', dragDropHandler.handleDrop);
                dropZone.removeEventListener('click', dragDropHandler.handleClick);
            }
            
            // 상태 초기화
            uploadState.isInitialized = false;
            uploadState.isDragging = false;
            uploadState.isUploading = false;
            uploadState.isProcessing = false;
            
            Core.logger.log('업로드 모듈 제거 완료');
        },
        
        /**
         * 모듈 정보 반환
         * @returns {Object} 모듈 정보
         */
        getInfo() {
            return {
                name: UPLOAD_CONSTANTS.MODULE_NAME,
                version: UPLOAD_CONSTANTS.VERSION,
                isInitialized: uploadState.isInitialized,
                fileCount: uploadState.files.length,
                settings: uploadState.settings
            };
        }
    };
    
    // ================================================
    // 모듈 노출
    // ================================================
    
    // Upload 모듈 API 노출
    window.FacilityImageSystem.Upload = {
        // 상수
        CONSTANTS: UPLOAD_CONSTANTS,
        
        // 메인 객체
        uploader,
        
        // 내부 객체 (고급 사용자용)
        fileValidator,
        fileCompressor,
        dragDropHandler,
        domManager,
        
        // 상태 (읽기 전용)
        getState: () => ({ ...uploadState }),
        
        // 편의 함수
        initialize: uploader.initialize.bind(uploader),
        removeFile: uploader.removeFile.bind(uploader),
        clearAllFiles: uploader.clearAllFiles.bind(uploader),
        getFiles: uploader.getFiles.bind(uploader),
        getCompressedFiles: uploader.getCompressedFiles.bind(uploader),
        getUploadState: uploader.getUploadState.bind(uploader),
        destroy: uploader.destroy.bind(uploader)
    };
    
    // 전역 접근을 위한 단축 참조
    window.FacilityImageUpload = window.FacilityImageSystem.Upload;
    
    Core.logger.log('업로드 모듈 로드 완료');
    
})(); 