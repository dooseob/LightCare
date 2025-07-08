/**
 * 시설 이미지 크롭 모듈 (Cropper Module)
 * 이미지 크롭 기능에 특화된 모듈
 * 
 * 주요 기능:
 * - Cropper.js 기반 이미지 크롭
 * - 16:9 비율 자동 크롭
 * - 실시간 미리보기
 * - 줌 컨트롤 및 스마트 스크롤
 * - 키보드 단축키 지원
 * - 크롭 데이터 검증 및 저장
 * - 이미지 품질 최적화
 * 
 * @version 1.0.0
 * @author LightCare Team
 * @requires FacilityImageCore
 * @requires Cropper.js
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
    
    if (!window.FacilityImageSystem.Cropper) {
        window.FacilityImageSystem.Cropper = {};
    }
    
    // ================================================
    // 상수 정의
    // ================================================
    
    const CROPPER_CONSTANTS = {
        MODULE_NAME: 'FacilityImageCropper',
        VERSION: '1.0.0',
        
        // 크롭 설정
        ASPECT_RATIO: 16/9,
        VIEW_MODE: 1,
        CROP_BOX_MOVABLE: true,
        CROP_BOX_RESIZABLE: true,
        TOGGLEABLE: false,
        ZOOMABLE: true,
        SCALABLE: true,
        ROTATABLE: false,
        
        // 줌 설정
        MIN_ZOOM: 0.1,
        MAX_ZOOM: 3.0,
        ZOOM_STEP: 0.1,
        ZOOM_THRESHOLD_MIN: 0.2,
        ZOOM_THRESHOLD_MAX: 2.8,
        
        // 키보드 단축키
        KEYBOARD_SHORTCUTS: {
            ZOOM_IN: 'Equal',        // + 키
            ZOOM_OUT: 'Minus',       // - 키
            RESET: 'KeyR',           // R 키
            MOVE_LEFT: 'ArrowLeft',  // ← 키
            MOVE_RIGHT: 'ArrowRight',// → 키
            MOVE_UP: 'ArrowUp',      // ↑ 키
            MOVE_DOWN: 'ArrowDown',  // ↓ 키
            SAVE: 'KeyS',            // S 키 (Ctrl+S)
            NEXT: 'KeyN'             // N 키 (다음 이미지)
        },
        
        // 크롭 품질 설정
        OUTPUT_OPTIONS: {
            format: 'image/jpeg',
            quality: 0.85,
            maxWidth: 1920,
            maxHeight: 1080,
            fillColor: '#ffffff'
        }
    };
    
    // ================================================
    // 크롭퍼 상태 관리
    // ================================================
    
    const cropperState = {
        // 크롭퍼 인스턴스
        instance: null,
        
        // 현재 이미지 정보
        currentImage: null,
        currentImageIndex: 0,
        
        // 크롭 데이터
        cropData: null,
        
        // UI 요소
        elements: {
            container: null,
            image: null,
            canvas: null,
            zoomIndicator: null,
            zoomLevel: null,
            controls: {}
        },
        
        // 상태 플래그
        isInitialized: false,
        isCropping: false,
        isProcessing: false,
        
        // 스마트 스크롤 유틸리티
        smartScroll: null,
        
        // 설정
        settings: {
            aspectRatio: CROPPER_CONSTANTS.ASPECT_RATIO,
            viewMode: CROPPER_CONSTANTS.VIEW_MODE,
            ...CROPPER_CONSTANTS.OUTPUT_OPTIONS
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
                container: document.querySelector('.crop-image-container, #cropImageContainer'),
                image: document.querySelector('#cropImage'),
                canvas: document.querySelector('#previewCanvas'),
                zoomIndicator: document.querySelector('#zoomIndicator'),
                zoomLevel: document.querySelector('#zoomLevel'),
                controls: {
                    zoomIn: document.querySelector('#zoomInBtn, .zoom-in-btn'),
                    zoomOut: document.querySelector('#zoomOutBtn, .zoom-out-btn'),
                    reset: document.querySelector('#resetZoomBtn, .reset-btn'),
                    save: document.querySelector('#saveCurrentAndGoNext, .save-btn'),
                    next: document.querySelector('#nextImageBtn, .next-btn'),
                    prev: document.querySelector('#prevImageBtn, .prev-btn')
                }
            };
            
            cropperState.elements = elements;
            
            // 필수 요소 체크
            if (!elements.image) {
                Core.logger.error('크롭 이미지 요소를 찾을 수 없습니다.');
                return false;
            }
            
            // 동적 요소 생성
            this.createMissingElements();
            
            Core.logger.log('DOM 요소 초기화 완료', {
                hasContainer: !!elements.container,
                hasImage: !!elements.image,
                hasCanvas: !!elements.canvas
            });
            
            return true;
        },
        
        /**
         * 누락된 요소 동적 생성
         */
        createMissingElements() {
            const elements = cropperState.elements;
            
            // 줌 표시기 생성
            if (!elements.zoomIndicator) {
                elements.zoomIndicator = this.createZoomIndicator();
            }
            
            // 미리보기 캔버스 생성
            if (!elements.canvas) {
                elements.canvas = this.createPreviewCanvas();
            }
            
            // 컨트롤 버튼 생성
            this.createMissingControls();
        },
        
        /**
         * 줌 표시기 생성
         * @returns {HTMLElement} 줌 표시기 요소
         */
        createZoomIndicator() {
            const indicator = document.createElement('div');
            indicator.id = 'zoomIndicator';
            indicator.className = 'zoom-indicator position-fixed';
            indicator.style.cssText = `
                top: 20px; 
                right: 20px; 
                z-index: 1000; 
                background: rgba(0,0,0,0.8); 
                color: white; 
                padding: 8px 12px; 
                border-radius: 6px; 
                font-size: 12px;
                display: none;
                transition: opacity 0.3s ease;
            `;
            
            indicator.innerHTML = `
                <i class="fas fa-search me-1"></i>
                <span id="zoomLevel">100%</span>
                <span id="zoomStatus" class="ms-2"></span>
            `;
            
            document.body.appendChild(indicator);
            cropperState.elements.zoomLevel = indicator.querySelector('#zoomLevel');
            
            return indicator;
        },
        
        /**
         * 미리보기 캔버스 생성
         * @returns {HTMLCanvasElement} 캔버스 요소
         */
        createPreviewCanvas() {
            const canvas = document.createElement('canvas');
            canvas.id = 'previewCanvas';
            canvas.width = 320;
            canvas.height = 180;
            canvas.style.cssText = `
                width: 100%; 
                height: 100%; 
                border: 1px solid #dee2e6; 
                border-radius: 4px;
                background: #f8f9fa;
            `;
            
            // 미리보기 컨테이너 찾기
            const previewContainer = document.querySelector('.crop-preview-panel, .preview-container');
            if (previewContainer) {
                previewContainer.appendChild(canvas);
            }
            
            return canvas;
        },
        
        /**
         * 누락된 컨트롤 버튼 생성
         */
        createMissingControls() {
            const controls = cropperState.elements.controls;
            
            // 줌 컨트롤이 없는 경우 생성
            if (!controls.zoomIn || !controls.zoomOut || !controls.reset) {
                this.createZoomControls();
            }
        },
        
        /**
         * 줌 컨트롤 생성
         */
        createZoomControls() {
            const controlsHtml = `
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
            `;
            
            const container = cropperState.elements.container;
            if (container) {
                container.insertAdjacentHTML('beforeend', controlsHtml);
                
                // 참조 업데이트
                const controls = cropperState.elements.controls;
                controls.zoomIn = document.getElementById('zoomInBtn');
                controls.zoomOut = document.getElementById('zoomOutBtn');
                controls.reset = document.getElementById('resetZoomBtn');
            }
        }
    };
    
    // ================================================
    // 크롭퍼 인스턴스 관리
    // ================================================
    
    const cropperInstance = {
        /**
         * 크롭퍼 인스턴스 생성
         * @param {HTMLImageElement} imageElement - 이미지 요소
         * @param {Object} options - 크롭퍼 옵션
         * @returns {Object} 크롭퍼 인스턴스
         */
        create(imageElement, options = {}) {
            if (!imageElement) {
                throw new Error('이미지 요소가 필요합니다.');
            }
            
            const defaultOptions = {
                aspectRatio: cropperState.settings.aspectRatio,
                viewMode: CROPPER_CONSTANTS.VIEW_MODE,
                dragMode: 'move',
                cropBoxMovable: CROPPER_CONSTANTS.CROP_BOX_MOVABLE,
                cropBoxResizable: CROPPER_CONSTANTS.CROP_BOX_RESIZABLE,
                toggleDragModeOnDblclick: false,
                zoomable: CROPPER_CONSTANTS.ZOOMABLE,
                scalable: CROPPER_CONSTANTS.SCALABLE,
                rotatable: CROPPER_CONSTANTS.ROTATABLE,
                checkOrientation: false,
                modal: true,
                guides: true,
                center: true,
                highlight: true,
                background: true,
                autoCrop: true,
                autoCropArea: 0.8,
                movable: true,
                responsive: true,
                restore: true,
                checkCrossOrigin: true,
                minContainerWidth: 320,
                minContainerHeight: 180,
                minCanvasWidth: 0,
                minCanvasHeight: 0,
                minCropBoxWidth: 0,
                minCropBoxHeight: 0,
                
                // 이벤트 핸들러
                ready: this.onReady.bind(this),
                cropstart: this.onCropStart.bind(this),
                cropmove: this.onCropMove.bind(this),
                cropend: this.onCropEnd.bind(this),
                crop: this.onCrop.bind(this),
                zoom: this.onZoom.bind(this)
            };
            
            const cropperOptions = { ...defaultOptions, ...options };
            
            try {
                // 기존 인스턴스 제거
                this.destroy();
                
                // 새 인스턴스 생성
                cropperState.instance = new Cropper(imageElement, cropperOptions);
                
                Core.logger.log('크롭퍼 인스턴스 생성 완료');
                return cropperState.instance;
                
            } catch (error) {
                Core.logger.error('크롭퍼 인스턴스 생성 실패:', error);
                throw error;
            }
        },
        
        /**
         * 크롭퍼 인스턴스 제거
         */
        destroy() {
            if (cropperState.instance) {
                cropperState.instance.destroy();
                cropperState.instance = null;
                Core.logger.log('크롭퍼 인스턴스 제거 완료');
            }
        },
        
        /**
         * 크롭퍼 준비 완료 이벤트
         */
        onReady() {
            cropperState.isInitialized = true;
            
            // 스마트 스크롤 초기화
            if (window.SmartScrollUtility) {
                cropperState.smartScroll = new SmartScrollUtility(cropperState.instance);
            }
            
            // 미리보기 업데이트
            this.updatePreview();
            
            Core.emit(Core.CONSTANTS.EVENTS.SUCCESS, {
                type: 'cropper_ready',
                message: '크롭퍼 준비 완료'
            });
            
            Core.logger.success('크롭퍼 준비 완료');
        },
        
        /**
         * 크롭 시작 이벤트
         */
        onCropStart() {
            cropperState.isCropping = true;
            this.showZoomIndicator();
        },
        
        /**
         * 크롭 이동 이벤트
         */
        onCropMove() {
            this.updatePreview();
        },
        
        /**
         * 크롭 종료 이벤트
         */
        onCropEnd() {
            cropperState.isCropping = false;
            this.hideZoomIndicator();
            this.updatePreview();
        },
        
        /**
         * 크롭 데이터 변경 이벤트
         * @param {Object} event - 크롭 이벤트
         */
        onCrop(event) {
            cropperState.cropData = event.detail;
            this.updatePreview();
        },
        
        /**
         * 줌 변경 이벤트
         * @param {Object} event - 줌 이벤트
         */
        onZoom(event) {
            const ratio = event.detail.ratio;
            this.updateZoomIndicator(ratio);
            this.updatePreview();
        },
        
        /**
         * 줌 표시기 업데이트
         * @param {number} ratio - 줌 비율
         */
        updateZoomIndicator(ratio) {
            const zoomLevel = cropperState.elements.zoomLevel;
            if (zoomLevel) {
                zoomLevel.textContent = Math.round(ratio * 100) + '%';
            }
            
            this.showZoomIndicator();
        },
        
        /**
         * 줌 표시기 표시
         */
        showZoomIndicator() {
            const indicator = cropperState.elements.zoomIndicator;
            if (indicator) {
                indicator.style.display = 'block';
                indicator.style.opacity = '1';
                
                // 3초 후 자동 숨김
                clearTimeout(this.zoomIndicatorTimeout);
                this.zoomIndicatorTimeout = setTimeout(() => {
                    this.hideZoomIndicator();
                }, 3000);
            }
        },
        
        /**
         * 줌 표시기 숨김
         */
        hideZoomIndicator() {
            const indicator = cropperState.elements.zoomIndicator;
            if (indicator) {
                indicator.style.opacity = '0';
                setTimeout(() => {
                    indicator.style.display = 'none';
                }, 300);
            }
        },
        
        /**
         * 미리보기 업데이트
         */
        updatePreview() {
            if (!cropperState.instance || !cropperState.elements.canvas) return;
            
            try {
                const canvas = cropperState.elements.canvas;
                const croppedCanvas = cropperState.instance.getCroppedCanvas({
                    width: canvas.width,
                    height: canvas.height,
                    fillColor: cropperState.settings.fillColor
                });
                
                if (croppedCanvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(croppedCanvas, 0, 0, canvas.width, canvas.height);
                }
                
            } catch (error) {
                Core.logger.error('미리보기 업데이트 실패:', error);
            }
        }
    };
    
    // ================================================
    // 크롭 컨트롤 관리
    // ================================================
    
    const cropperControls = {
        /**
         * 컨트롤 이벤트 설정
         */
        setupControls() {
            const controls = cropperState.elements.controls;
            
            // 줌 컨트롤
            if (controls.zoomIn) {
                controls.zoomIn.addEventListener('click', () => this.zoomIn());
            }
            if (controls.zoomOut) {
                controls.zoomOut.addEventListener('click', () => this.zoomOut());
            }
            if (controls.reset) {
                controls.reset.addEventListener('click', () => this.reset());
            }
            
            // 네비게이션 컨트롤
            if (controls.next) {
                controls.next.addEventListener('click', () => this.nextImage());
            }
            if (controls.prev) {
                controls.prev.addEventListener('click', () => this.prevImage());
            }
            
            // 저장 컨트롤
            if (controls.save) {
                controls.save.addEventListener('click', () => this.saveCrop());
            }
            
            // 키보드 단축키
            this.setupKeyboardShortcuts();
            
            Core.logger.log('크롭 컨트롤 설정 완료');
        },
        
        /**
         * 키보드 단축키 설정
         */
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (event) => {
                if (!cropperState.isInitialized) return;
                
                // 텍스트 입력 중일 때는 무시
                if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                    return;
                }
                
                const shortcuts = CROPPER_CONSTANTS.KEYBOARD_SHORTCUTS;
                
                switch (event.code) {
                    case shortcuts.ZOOM_IN:
                        event.preventDefault();
                        this.zoomIn();
                        break;
                    case shortcuts.ZOOM_OUT:
                        event.preventDefault();
                        this.zoomOut();
                        break;
                    case shortcuts.RESET:
                        event.preventDefault();
                        this.reset();
                        break;
                    case shortcuts.MOVE_LEFT:
                        event.preventDefault();
                        this.moveLeft();
                        break;
                    case shortcuts.MOVE_RIGHT:
                        event.preventDefault();
                        this.moveRight();
                        break;
                    case shortcuts.MOVE_UP:
                        event.preventDefault();
                        this.moveUp();
                        break;
                    case shortcuts.MOVE_DOWN:
                        event.preventDefault();
                        this.moveDown();
                        break;
                    case shortcuts.SAVE:
                        if (event.ctrlKey) {
                            event.preventDefault();
                            this.saveCrop();
                        }
                        break;
                    case shortcuts.NEXT:
                        event.preventDefault();
                        this.nextImage();
                        break;
                }
            });
        },
        
        /**
         * 확대
         */
        zoomIn() {
            if (cropperState.instance) {
                cropperState.instance.zoom(CROPPER_CONSTANTS.ZOOM_STEP);
                Core.logger.log('이미지 확대');
            }
        },
        
        /**
         * 축소
         */
        zoomOut() {
            if (cropperState.instance) {
                cropperState.instance.zoom(-CROPPER_CONSTANTS.ZOOM_STEP);
                Core.logger.log('이미지 축소');
            }
        },
        
        /**
         * 초기화
         */
        reset() {
            if (cropperState.instance) {
                cropperState.instance.reset();
                Core.logger.log('크롭퍼 초기화');
            }
        },
        
        /**
         * 왼쪽 이동
         */
        moveLeft() {
            if (cropperState.instance) {
                cropperState.instance.move(-10, 0);
            }
        },
        
        /**
         * 오른쪽 이동
         */
        moveRight() {
            if (cropperState.instance) {
                cropperState.instance.move(10, 0);
            }
        },
        
        /**
         * 위쪽 이동
         */
        moveUp() {
            if (cropperState.instance) {
                cropperState.instance.move(0, -10);
            }
        },
        
        /**
         * 아래쪽 이동
         */
        moveDown() {
            if (cropperState.instance) {
                cropperState.instance.move(0, 10);
            }
        },
        
        /**
         * 다음 이미지
         */
        nextImage() {
            Core.emit('nextImage');
        },
        
        /**
         * 이전 이미지
         */
        prevImage() {
            Core.emit('prevImage');
        },
        
        /**
         * 크롭 저장
         */
        saveCrop() {
            if (!cropperState.instance) return;
            
            try {
                const croppedCanvas = cropperState.instance.getCroppedCanvas({
                    width: cropperState.settings.maxWidth,
                    height: cropperState.settings.maxHeight,
                    fillColor: cropperState.settings.fillColor
                });
                
                if (croppedCanvas) {
                    croppedCanvas.toBlob((blob) => {
                        Core.emit('imageCropped', {
                            blob: blob,
                            index: cropperState.currentImageIndex,
                            cropData: cropperState.cropData
                        });
                    }, cropperState.settings.format, cropperState.settings.quality);
                }
                
            } catch (error) {
                Core.logger.error('크롭 저장 실패:', error);
            }
        }
    };
    
    // ================================================
    // 메인 크롭퍼 객체
    // ================================================
    
    const cropper = {
        /**
         * 크롭퍼 모듈 초기화
         * @param {Object} options - 초기화 옵션
         * @returns {Promise<boolean>} 초기화 성공 여부
         */
        async initialize(options = {}) {
            if (cropperState.isInitialized) {
                Core.logger.warn('크롭퍼 모듈이 이미 초기화됨');
                return true;
            }
            
            Core.logger.log('크롭퍼 모듈 초기화 시작');
            
            try {
                // 설정 병합
                if (options.settings) {
                    Object.assign(cropperState.settings, options.settings);
                }
                
                // DOM 요소 초기화
                if (!domManager.initializeElements()) {
                    throw new Error('DOM 요소 초기화 실패');
                }
                
                // 컨트롤 설정
                cropperControls.setupControls();
                
                Core.logger.success('크롭퍼 모듈 초기화 완료');
                return true;
                
            } catch (error) {
                Core.logger.error('크롭퍼 모듈 초기화 실패:', error);
                return false;
            }
        },
        
        /**
         * 이미지 로드
         * @param {string|File} image - 이미지 URL 또는 파일
         * @param {number} index - 이미지 인덱스
         * @returns {Promise<boolean>} 로드 성공 여부
         */
        async loadImage(image, index = 0) {
            if (!cropperState.elements.image) {
                throw new Error('이미지 요소가 없습니다.');
            }
            
            Core.logger.log(`이미지 로드 시작: ${index}`);
            
            try {
                cropperState.currentImageIndex = index;
                cropperState.isProcessing = true;
                
                // 이미지 소스 설정
                if (typeof image === 'string') {
                    cropperState.elements.image.src = image;
                } else if (image instanceof File) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        cropperState.elements.image.src = e.target.result;
                    };
                    reader.readAsDataURL(image);
                } else {
                    throw new Error('지원하지 않는 이미지 형식입니다.');
                }
                
                // 이미지 로드 완료 대기
                await new Promise((resolve, reject) => {
                    cropperState.elements.image.onload = () => {
                        // 크롭퍼 인스턴스 생성
                        cropperInstance.create(cropperState.elements.image);
                        cropperState.currentImage = image;
                        cropperState.isProcessing = false;
                        resolve();
                    };
                    
                    cropperState.elements.image.onerror = () => {
                        cropperState.isProcessing = false;
                        reject(new Error('이미지 로드 실패'));
                    };
                });
                
                Core.logger.success(`이미지 로드 완료: ${index}`);
                return true;
                
            } catch (error) {
                cropperState.isProcessing = false;
                Core.logger.error('이미지 로드 실패:', error);
                throw error;
            }
        },
        
        /**
         * 크롭 데이터 가져오기
         * @returns {Object} 크롭 데이터
         */
        getCropData() {
            if (!cropperState.instance) {
                return null;
            }
            
            return {
                cropBoxData: cropperState.instance.getCropBoxData(),
                canvasData: cropperState.instance.getCanvasData(),
                imageData: cropperState.instance.getImageData()
            };
        },
        
        /**
         * 크롭된 캔버스 가져오기
         * @param {Object} options - 캔버스 옵션
         * @returns {HTMLCanvasElement} 크롭된 캔버스
         */
        getCroppedCanvas(options = {}) {
            if (!cropperState.instance) {
                return null;
            }
            
            const defaultOptions = {
                width: cropperState.settings.maxWidth,
                height: cropperState.settings.maxHeight,
                fillColor: cropperState.settings.fillColor
            };
            
            return cropperState.instance.getCroppedCanvas({ ...defaultOptions, ...options });
        },
        
        /**
         * 크롭된 이미지 Blob 가져오기
         * @param {Object} options - 이미지 옵션
         * @returns {Promise<Blob>} 크롭된 이미지 Blob
         */
        async getCroppedBlob(options = {}) {
            const canvas = this.getCroppedCanvas(options);
            if (!canvas) {
                throw new Error('크롭된 캔버스를 가져올 수 없습니다.');
            }
            
            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Blob 생성 실패'));
                    }
                }, cropperState.settings.format, cropperState.settings.quality);
            });
        },
        
        /**
         * 크롭퍼 제거
         */
        destroy() {
            cropperInstance.destroy();
            
            if (cropperState.smartScroll) {
                cropperState.smartScroll.destroy();
                cropperState.smartScroll = null;
            }
            
            // 상태 초기화
            cropperState.isInitialized = false;
            cropperState.currentImage = null;
            cropperState.currentImageIndex = 0;
            cropperState.cropData = null;
            cropperState.isCropping = false;
            cropperState.isProcessing = false;
            
            Core.logger.log('크롭퍼 모듈 제거 완료');
        },
        
        /**
         * 모듈 정보 반환
         * @returns {Object} 모듈 정보
         */
        getInfo() {
            return {
                name: CROPPER_CONSTANTS.MODULE_NAME,
                version: CROPPER_CONSTANTS.VERSION,
                isInitialized: cropperState.isInitialized,
                currentImageIndex: cropperState.currentImageIndex,
                isProcessing: cropperState.isProcessing,
                settings: cropperState.settings
            };
        }
    };
    
    // ================================================
    // 모듈 노출
    // ================================================
    
    // Cropper 모듈 API 노출
    window.FacilityImageSystem.Cropper = {
        // 상수
        CONSTANTS: CROPPER_CONSTANTS,
        
        // 메인 객체
        cropper,
        
        // 내부 객체 (고급 사용자용)
        cropperInstance,
        cropperControls,
        domManager,
        
        // 상태 (읽기 전용)
        getState: () => ({ ...cropperState }),
        
        // 편의 함수
        initialize: cropper.initialize.bind(cropper),
        loadImage: cropper.loadImage.bind(cropper),
        getCropData: cropper.getCropData.bind(cropper),
        getCroppedCanvas: cropper.getCroppedCanvas.bind(cropper),
        getCroppedBlob: cropper.getCroppedBlob.bind(cropper),
        destroy: cropper.destroy.bind(cropper)
    };
    
    // 전역 접근을 위한 단축 참조
    window.FacilityImageCropper = window.FacilityImageSystem.Cropper;
    
    Core.logger.log('크롭퍼 모듈 로드 완료');
    
})(); 