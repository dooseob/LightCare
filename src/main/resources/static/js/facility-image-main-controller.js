/**
 * 시설 이미지 메인 컨트롤러 (Main Controller)
 * 모든 시설 이미지 모듈을 통합 관리하는 중앙 컨트롤러
 * 
 * @version 1.0.0
 * @author LightCare Team
 * @requires FacilityImageCore, FacilityImageCropper, FacilityImageUpload, FacilityImageUI, FacilityImageData, FacilityImageSEO, FacilityImageUtils
 */

(function() {
    'use strict';
    
    // ================================================
    // 의존성 체크
    // ================================================
    
    const requiredModules = [
        'FacilityImageCore',
        'FacilityImageCropper', 
        'FacilityImageUpload',
        'FacilityImageUI',
        'FacilityImageData',
        'FacilityImageSEO',
        'FacilityImageUtils'
    ];
    
    const missingModules = requiredModules.filter(module => !window[module]);
    if (missingModules.length > 0) {
        throw new Error(`필수 모듈이 없습니다: ${missingModules.join(', ')}`);
    }
    
    // 모듈 단축 참조
    const Core = window.FacilityImageCore;
    const Cropper = window.FacilityImageCropper;
    const Upload = window.FacilityImageUpload;
    const UI = window.FacilityImageUI;
    const Data = window.FacilityImageData;
    const SEO = window.FacilityImageSEO;
    const Utils = window.FacilityImageUtils;
    
    // ================================================
    // 메인 컨트롤러 네임스페이스
    // ================================================
    
    if (!window.FacilityImageSystem.Main) {
        window.FacilityImageSystem.Main = {};
    }
    
    // ================================================
    // 상수 정의
    // ================================================
    
    const MAIN_CONSTANTS = {
        MODULE_NAME: 'FacilityImageMainController',
        VERSION: '1.0.0',
        
        WORKFLOW_STEPS: {
            UPLOAD: 1,
            CROP: 2,
            MANAGE: 3
        },
        
        STATES: {
            INITIALIZING: 'initializing',
            READY: 'ready',
            UPLOADING: 'uploading',
            CROPPING: 'cropping',
            PROCESSING: 'processing',
            COMPLETE: 'complete',
            ERROR: 'error'
        }
    };
    
    // ================================================
    // 메인 컨트롤러 상태
    // ================================================
    
    const mainState = {
        isInitialized: false,
        currentState: MAIN_CONSTANTS.STATES.INITIALIZING,
        currentStep: MAIN_CONSTANTS.WORKFLOW_STEPS.UPLOAD,
        facilityId: null,
        facilityName: '',
        
        // 모듈 초기화 상태
        moduleStates: {
            core: false,
            cropper: false,
            upload: false,
            ui: false,
            data: false,
            seo: false,
            utils: false
        },
        
        // 작업 데이터
        selectedFiles: [],
        processedImages: [],
        currentImageIndex: 0,
        
        // 설정
        settings: {
            maxFiles: 5,
            enableSEO: true,
            enableCompression: true,
            autoAdvanceSteps: true
        }
    };
    
    // ================================================
    // 모듈 초기화 관리
    // ================================================
    
    const moduleInitializer = {
        async initializeAllModules(facilityId, facilityName, options = {}) {
            Core.logger.log('모든 모듈 초기화 시작');
            Core.logger.log('초기화 매개변수:', { facilityId, facilityName, options });
            
            // UI 모듈 상태 먼저 확인
            if (typeof UI.showProgress === 'function') {
                UI.showProgress('initialization', '모듈 초기화 중...');
            } else {
                Core.logger.warn('UI.showProgress를 사용할 수 없음');
            }
            
            try {
                // 1. Core 모듈 초기화 (이미 초기화됨)
                mainState.moduleStates.core = true;
                UI.updateProgress('initialization', 15, 'Core 모듈 준비됨');
                
                // 2. Utils 모듈 초기화
                mainState.moduleStates.utils = await Utils.initialize();
                UI.updateProgress('initialization', 25, 'Utils 모듈 초기화 완료');
                
                // 3. UI 모듈 초기화
                mainState.moduleStates.ui = await UI.initialize();
                UI.updateProgress('initialization', 40, 'UI 모듈 초기화 완료');
                
                // 4. Data 모듈 초기화
                mainState.moduleStates.data = await Data.initialize(facilityId);
                UI.updateProgress('initialization', 55, 'Data 모듈 초기화 완료');
                
                // 5. SEO 모듈 초기화
                mainState.moduleStates.seo = await SEO.initialize(facilityName);
                UI.updateProgress('initialization', 70, 'SEO 모듈 초기화 완료');
                
                // 6. Upload 모듈 초기화
                const uploadCallbacks = this.getUploadCallbacks();
                mainState.moduleStates.upload = await Upload.initialize({ callbacks: uploadCallbacks });
                UI.updateProgress('initialization', 85, 'Upload 모듈 초기화 완료');
                
                // 7. Cropper 모듈 초기화 (안전한 초기화)
                try {
                    mainState.moduleStates.cropper = await Cropper.initialize();
                    Core.logger.success('크롭퍼 모듈 초기화 완료');
                } catch (cropperError) {
                    Core.logger.error('크롭퍼 모듈 초기화 실패:', cropperError);
                    mainState.moduleStates.cropper = false;
                    // 크롭퍼 초기화 실패 시에도 시스템은 계속 작동
                    Core.logger.warn('크롭퍼 없이 시스템을 계속 진행합니다.');
                }
                UI.updateProgress('initialization', 100, '모든 모듈 초기화 완료');
                
                // 진행률 숨김
                setTimeout(() => {
                    UI.hideProgress('initialization');
                }, 1000);
                
                Core.logger.success('모든 모듈 초기화 완료');
                return true;
                
            } catch (error) {
                UI.hideProgress('initialization');
                UI.showNotification('모듈 초기화에 실패했습니다.', UI.CONSTANTS.NOTIFICATION_TYPES.ERROR);
                Core.logger.error('모듈 초기화 실패:', error);
                return false;
            }
        },
        
        getUploadCallbacks() {
            return {
                onFileSelect: this.handleFileSelect.bind(this),
                onFileValidate: this.handleFileValidate.bind(this),
                onUploadProgress: this.handleUploadProgress.bind(this),
                onUploadComplete: this.handleUploadComplete.bind(this),
                onError: this.handleUploadError.bind(this)
            };
        },
        
        handleFileSelect(files) {
            Core.logger.log('파일 선택됨:', files.length);
            
            // 1단계에서는 원본 File 객체만 사용 (압축 없이)
            const originalFiles = files.map(fileData => fileData.file || fileData);
            mainState.selectedFiles = originalFiles;
            
            // 메인 이미지 상태 초기화 (사용자가 직접 선택하도록 변경)
            mainState.mainImageIndex = -1; // 초기에는 메인 이미지 미선택
            
            // 이미지 순서 설정 UI 표시
            this.showImageOrderInterface(originalFiles);
        },
        
        handleFileValidate(validation) {
            if (validation.errors.length > 0) {
                UI.showNotification(
                    `파일 검증 오류: ${validation.errors.join(', ')}`,
                    UI.CONSTANTS.NOTIFICATION_TYPES.ERROR
                );
            }
        },
        
        handleUploadProgress(progress) {
            UI.updateProgress('upload', progress.percentage, progress.message);
        },
        
        handleUploadComplete(result) {
            UI.showNotification('업로드가 완료되었습니다.', UI.CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
            controller.moveToStep(MAIN_CONSTANTS.WORKFLOW_STEPS.MANAGE);
        },
        
        handleUploadError(error) {
            UI.showNotification(`업로드 오류: ${error.message}`, UI.CONSTANTS.NOTIFICATION_TYPES.ERROR);
        },
        
        // 이미지 순서 설정 UI 표시
        showImageOrderInterface(files) {
            try {
                // 더 유연한 DOM 요소 찾기
                let previewContainer = document.getElementById('selectedImagesPreview') || 
                                     document.querySelector('.selected-images-preview, .image-preview-container, .preview-area');
                
                let orderList = document.getElementById('imageOrderList') || 
                              document.querySelector('.image-order-list, .preview-grid, .image-list');
                
                // DOM 요소가 없으면 동적으로 생성
                if (!previewContainer) {
                    previewContainer = this.createPreviewContainer();
                    Core.logger.log('미리보기 컨테이너 동적 생성');
                }
                
                if (!orderList) {
                    orderList = this.createOrderList(previewContainer);
                    Core.logger.log('이미지 순서 목록 동적 생성');
                }
                
                const selectedCount = document.getElementById('selectedCount') || 
                                    document.querySelector('.selected-count, .file-count');
                const proceedBtn = document.getElementById('proceedToCropBtn') || 
                                 document.querySelector('.proceed-btn, .next-step-btn');
                const addMoreBtn = document.getElementById('addMoreImagesBtn') || 
                                 document.querySelector('.add-more-btn, .add-images-btn');
                
                if (!previewContainer || !orderList) {
                    Core.logger.warn('필요한 DOM 요소를 찾을 수 없습니다');
                    Core.logger.log('DOM 상태:', {
                        previewContainer: !!previewContainer,
                        orderList: !!orderList,
                        body: !!document.body
                    });
                    return;
                }
                
                // 선택된 파일 수 업데이트
                if (selectedCount) {
                    selectedCount.textContent = files.length;
                }
                
                // 이미지 목록 생성
                orderList.innerHTML = '';
                files.forEach((file, index) => {
                    try {
                        const imageItem = this.createImageOrderItem(file, index);
                        orderList.appendChild(imageItem);
                    } catch (itemError) {
                        Core.logger.error(`이미지 아이템 ${index} 생성 실패:`, itemError);
                        // 오류가 발생해도 계속 진행
                    }
                });
                
                // 버튼 활성화
                if (proceedBtn) {
                    proceedBtn.style.display = 'inline-block';
                    proceedBtn.onclick = () => {
                        controller.moveToStep(MAIN_CONSTANTS.WORKFLOW_STEPS.CROP);
                    };
                }
                
                // 중복 파일선택 버튼 제거 - 기본 mainFileSelectBtn만 사용
                if (addMoreBtn && files.length < 5) {
                    // 이미지 추가 버튼은 숨김 처리 (중복 파일선택 방지)
                    addMoreBtn.style.display = 'none';
                    Core.logger.log('중복 파일선택 버튼 숨김 처리');
                }
                
                // 메인 이미지 정보 표시
                this.updateMainImageInfo();
                
                // 미리보기 컨테이너 표시
                previewContainer.style.display = 'block';
                
            } catch (error) {
                Core.logger.error('이미지 순서 인터페이스 표시 실패:', error);
                UI.showNotification('이미지 목록 표시에 실패했습니다.', UI.CONSTANTS.NOTIFICATION_TYPES.ERROR);
            }
        },
        
        // 이미지 순서 아이템 생성
        createImageOrderItem(file, index) {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 image-order-item';
            
            // 이미지 미리보기 URL 생성 (1단계는 원본 파일만)
            let imageUrl;
            try {
                if (file instanceof File) {
                    imageUrl = URL.createObjectURL(file);
                } else {
                    throw new Error('File 객체가 아님');
                }
            } catch (error) {
                console.warn('이미지 URL 생성 실패:', error, file);
                imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2U8L3RleHQ+PC9zdmc+';
            }
            
            const isMainImage = mainState.mainImageIndex >= 0 && index === mainState.mainImageIndex;
            
            col.innerHTML = `
                <div class="card h-100 ${isMainImage ? 'border-warning border-3' : 'border-secondary'}" style="cursor: pointer; transition: all 0.3s ease;">
                    <div class="position-relative">
                        <img src="${imageUrl}" class="card-img-top" style="height: 150px; object-fit: cover;" alt="이미지 ${index + 1}">
                        
                        <!-- 메인 이미지 선택 버튼 -->
                        <div class="position-absolute top-0 start-0 p-2">
                            <button type="button" class="btn btn-sm ${isMainImage ? 'btn-warning' : 'btn-outline-warning'}" 
                                    onclick="event.stopPropagation(); selectMainImage(${index})" 
                                    title="${isMainImage ? '메인 이미지 해제' : '메인 이미지로 설정'}">
                                <i class="fas fa-star"></i>
                            </button>
                        </div>
                        
                        <!-- 순서 표시 -->
                        <div class="position-absolute top-0 end-0 p-2">
                            <span class="badge ${isMainImage ? 'bg-warning text-dark' : 'bg-primary'} order-badge">${index + 1}</span>
                            ${isMainImage ? '<small class="badge bg-warning text-dark mt-1 d-block">메인</small>' : ''}
                        </div>
                        
                        <!-- 삭제 버튼 -->
                        <div class="position-absolute bottom-0 end-0 p-2">
                            <button type="button" class="btn btn-sm btn-danger" onclick="event.stopPropagation(); removeImageFromOrder(${index})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body p-2">
                        <h6 class="card-title text-truncate mb-1" style="font-size: 0.875rem;">
                            ${file.name || `이미지 ${index + 1}`}
                        </h6>
                        <small class="text-muted d-block">${this.formatFileSize(file.size || 0)}</small>
                        <div class="mt-2">
                            <div class="btn-group w-100" role="group">
                                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="event.stopPropagation(); moveImageUp(${index})" ${index === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-chevron-up"></i>
                                </button>
                                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="event.stopPropagation(); moveImageDown(${index})" ${index === mainState.selectedFiles.length - 1 ? 'disabled' : ''}>
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            return col;
        },
        
        // 메인 이미지 정보 업데이트
        updateMainImageInfo() {
            const mainImageInfo = document.getElementById('mainImageInfo');
            const mainImageText = document.getElementById('mainImageText');
            
            if (mainImageInfo && mainImageText && mainState.selectedFiles.length > 0) {
                if (mainState.mainImageIndex >= 0 && mainState.mainImageIndex < mainState.selectedFiles.length) {
                    const mainFile = mainState.selectedFiles[mainState.mainImageIndex];
                    mainImageText.textContent = `메인 이미지: ${mainFile.name || `이미지 ${mainState.mainImageIndex + 1}`}`;
                    mainImageInfo.style.display = 'block';
                } else {
                    mainImageText.textContent = '메인 이미지: 선택하지 않음 (각 이미지에서 별 아이콘 클릭하여 선택)';
                    mainImageInfo.style.display = 'block';
                }
            }
        },
        
        // 파일 크기 포맷
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        
        // 미리보기 컨테이너 동적 생성
        createPreviewContainer() {
            const container = document.createElement('div');
            container.id = 'selectedImagesPreview';
            container.className = 'selected-images-preview mt-4';
            container.style.display = 'block';
            
            // 적절한 위치에 삽입
            const uploadSection = document.getElementById('uploadSection') || 
                                document.querySelector('.upload-section, .content-wrapper, main');
            if (uploadSection) {
                uploadSection.appendChild(container);
            } else {
                document.body.appendChild(container);
            }
            
            return container;
        },
        
        // 이미지 순서 목록 동적 생성
        createOrderList(parentContainer) {
            const orderListHtml = `
                <div class="row mb-3">
                    <div class="col-12">
                        <h5>선택된 이미지 <span id="selectedCount" class="badge bg-primary">0</span></h5>
                        <div id="mainImageInfo" class="alert alert-info" style="display: none;">
                            <i class="fas fa-star text-warning me-2"></i>
                            <span id="mainImageText">메인 이미지: </span>
                        </div>
                    </div>
                </div>
                <div id="imageOrderList" class="row g-3"></div>
                <div class="row mt-3">
                    <div class="col-12 text-center">
                        <button type="button" id="addMoreImagesBtn" class="btn btn-outline-primary me-2" style="display: none;">
                            <i class="fas fa-plus me-1"></i>이미지 추가
                        </button>
                        <button type="button" id="proceedToCropBtn" class="btn btn-success" style="display: none;">
                            <i class="fas fa-arrow-right me-1"></i>다음 단계
                        </button>
                    </div>
                </div>
            `;
            
            parentContainer.innerHTML = orderListHtml;
            
            return document.getElementById('imageOrderList');
        }
    };
    
    // ================================================
    // 워크플로우 관리
    // ================================================
    
    const workflowManager = {
        async moveToStep(step) {
            if (step === mainState.currentStep) return;
            
            Core.logger.log(`단계 이동: ${mainState.currentStep} → ${step}`);
            
            try {
                // 이전 단계 정리
                await this.cleanupCurrentStep();
                
                // 새 단계 설정
                mainState.currentStep = step;
                UI.updateStep(step);
                
                // 새 단계 초기화
                await this.initializeStep(step);
                
                Core.emit(Core.CONSTANTS.EVENTS.STEP_CHANGED, {
                    step: step,
                    previousStep: mainState.currentStep
                });
                
            } catch (error) {
                Core.logger.error('단계 이동 실패:', error);
                UI.showNotification('단계 이동에 실패했습니다.', UI.CONSTANTS.NOTIFICATION_TYPES.ERROR);
            }
        },
        
        async cleanupCurrentStep() {
            switch (mainState.currentStep) {
                case MAIN_CONSTANTS.WORKFLOW_STEPS.UPLOAD:
                    // 업로드 단계 정리
                    break;
                case MAIN_CONSTANTS.WORKFLOW_STEPS.CROP:
                    // 크롭 단계 정리
                    if (mainState.moduleStates.cropper) {
                        // 현재 크롭 저장
                        await this.savePendingCrops();
                    }
                    break;
                case MAIN_CONSTANTS.WORKFLOW_STEPS.MANAGE:
                    // 관리 단계 정리
                    break;
            }
        },
        
        async initializeStep(step) {
            switch (step) {
                case MAIN_CONSTANTS.WORKFLOW_STEPS.UPLOAD:
                    await this.initializeUploadStep();
                    break;
                case MAIN_CONSTANTS.WORKFLOW_STEPS.CROP:
                    await this.initializeCropStep();
                    break;
                case MAIN_CONSTANTS.WORKFLOW_STEPS.MANAGE:
                    await this.initializeManageStep();
                    break;
            }
        },
        
        async initializeUploadStep() {
            UI.show('#uploadSection');
            UI.hide('#cropSection');
            UI.hide('#manageSection');
            
            mainState.currentState = MAIN_CONSTANTS.STATES.READY;
        },
        
        async initializeCropStep() {
            if (mainState.selectedFiles.length === 0) {
                UI.showNotification('먼저 이미지를 선택해주세요.', UI.CONSTANTS.NOTIFICATION_TYPES.WARNING);
                await this.moveToStep(MAIN_CONSTANTS.WORKFLOW_STEPS.UPLOAD);
                return;
            }
            
            Core.logger.log('크롭 단계 초기화 시작');
            
            // 1. 단계별 UI 표시/숨김 (먼저 처리)
            const uploadSection = document.getElementById('uploadSection');
            const cropSection = document.getElementById('cropSection');
            const manageSection = document.getElementById('manageSection');
            
            if (uploadSection) {
                uploadSection.style.display = 'none';
                Core.logger.log('업로드 섹션 숨김');
            }
            if (cropSection) {
                cropSection.style.display = 'block';
                cropSection.style.visibility = 'visible';
                Core.logger.log('크롭 섹션 표시');
            } else {
                Core.logger.error('크롭 섹션을 찾을 수 없습니다.');
                // 크롭 섹션이 없으면 동적 생성
                this.createCropSection();
            }
            if (manageSection) {
                manageSection.style.display = 'none';
            }
            
            // 2. 크롭퍼 모듈 상태 확인 및 강제 초기화
            if (!mainState.moduleStates.cropper) {
                Core.logger.warn('크롭퍼 모듈이 초기화되지 않았습니다. 강제 초기화를 시도합니다.');
                try {
                    await Cropper.initialize();
                    mainState.moduleStates.cropper = true;
                    Core.logger.success('크롭퍼 모듈 강제 초기화 성공');
                } catch (error) {
                    Core.logger.error('크롭퍼 모듈 강제 초기화 실패:', error);
                    UI.showNotification('크롭 기능을 사용할 수 없어 최종 단계로 이동합니다.', UI.CONSTANTS.NOTIFICATION_TYPES.WARNING);
                    await this.moveToStep(MAIN_CONSTANTS.WORKFLOW_STEPS.MANAGE);
                    return;
                }
            }
            
            // 3. 파일 선택 이벤트 임시 차단 (2단계 진입 시 파일 선택창 방지)
            const fileInput = document.getElementById('imageInput');
            if (fileInput) {
                fileInput.style.pointerEvents = 'none';
                setTimeout(() => {
                    if (fileInput) fileInput.style.pointerEvents = 'auto';
                }, 1000); // 1초 후 다시 활성화
            }
            
            // 4. 첫 번째 이미지 로드 (500ms 지연으로 DOM 안정화 대기)
            setTimeout(async () => {
                if (mainState.selectedFiles.length > 0) {
                    await this.loadImageForCrop(0);
                }
            }, 500);
            
            mainState.currentState = MAIN_CONSTANTS.STATES.CROPPING;
            Core.logger.success('크롭 단계 초기화 완료');
        },
        
        // 크롭 섹션 동적 생성 (HTML에 없는 경우)
        createCropSection() {
            const mainContainer = document.querySelector('.upload-section') || document.querySelector('main .container');
            if (!mainContainer) {
                Core.logger.error('메인 컨테이너를 찾을 수 없습니다.');
                return;
            }
            
            const cropSection = document.createElement('div');
            cropSection.id = 'cropSection';
            cropSection.className = 'crop-section';
            cropSection.style.display = 'none';
            
            cropSection.innerHTML = `
                <div class="compression-header mb-3">
                    <h6 class="text-success">
                        <i class="fas fa-crop-alt me-2"></i>이미지 크롭 및 고성능 압축
                    </h6>
                    <div class="compression-progress">
                        <small class="text-muted">현재 이미지: <span id="currentImageInfo">1 / 1</span></small>
                    </div>
                </div>
                
                <!-- 크롭 영역 -->
                <div id="cropContainer" class="crop-container mb-3">
                    <div class="crop-image-container">
                        <img id="cropImage" style="max-width: 100%; max-height: 500px; display: block; margin: 0 auto;">
                        <canvas id="cropCanvas" style="display: none;"></canvas>
                    </div>
                </div>
                
                <!-- 크롭 컨트롤 -->
                <div id="cropControls" class="crop-controls mb-3">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="crop-navigation d-flex align-items-center">
                                <button type="button" id="prevImage" class="btn btn-sm btn-outline-secondary me-2">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button type="button" id="nextImage" class="btn btn-sm btn-outline-secondary me-3">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                                <button type="button" id="resetCrop" class="btn btn-sm btn-outline-warning me-2">
                                    <i class="fas fa-undo me-1"></i>리셋
                                </button>
                                <button type="button" id="autoFit" class="btn btn-sm btn-outline-info">
                                    <i class="fas fa-expand-arrows-alt me-1"></i>16:9 자동맞춤
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 text-end">
                            <button type="button" id="completeImageProcessing" class="btn btn-success">
                                <i class="fas fa-save me-1"></i>압축 완료
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            mainContainer.appendChild(cropSection);
            Core.logger.log('크롭 섹션 동적 생성 완료');
        },
        
        async initializeManageStep() {
            UI.hide('#uploadSection');
            UI.hide('#cropSection');
            UI.show('#manageSection');
            
            // 최종 업로드 준비
            await this.prepareForFinalUpload();
            
            mainState.currentState = MAIN_CONSTANTS.STATES.PROCESSING;
        },
        
        async loadImageForCrop(index) {
            if (index >= mainState.selectedFiles.length) return;
            
            // 크롭퍼 모듈 상태 재확인
            if (!mainState.moduleStates.cropper) {
                Core.logger.warn('크롭퍼 모듈이 사용 불가능합니다.');
                UI.showNotification('크롭 기능을 사용할 수 없습니다.', UI.CONSTANTS.NOTIFICATION_TYPES.WARNING);
                return;
            }
            
            mainState.currentImageIndex = index;
            const file = mainState.selectedFiles[index];
            
            try {
                Core.logger.log('크롭을 위한 이미지 로드:', { index, file: file.name, type: file.type });
                
                // 크롭 이미지 요소 강제 확인 및 생성
                let cropImage = document.getElementById('cropImage');
                if (!cropImage) {
                    Core.logger.warn('cropImage 요소가 없습니다. 동적 생성 시도');
                    cropImage = this.createCropImageElement();
                }
                
                // 크롭퍼 모듈 상태 확인 후 로드
                if (Cropper && typeof Cropper.loadImage === 'function') {
                    await Cropper.loadImage(file, index);
                    
                    // 크롭 이미지가 제대로 로드되었는지 확인
                    setTimeout(() => {
                        const cropImageCheck = document.getElementById('cropImage');
                        if (cropImageCheck && cropImageCheck.src) {
                            Core.logger.success('크롭 이미지 로드 확인됨:', cropImageCheck.src.substring(0, 50) + '...');
                        } else {
                            Core.logger.error('크롭 이미지가 로드되지 않았습니다.');
                            // 직접 이미지 소스 설정 시도
                            this.fallbackImageLoad(file, cropImageCheck);
                        }
                    }, 500);
                    
                    // 크롭 네비게이션 업데이트
                    this.updateCropNavigation();
                    
                    // 2단계 압축 설정 초기화
                    this.initializeCompressionSettings();
                    
                    // SEO 기능 초기화
                    this.initializeSEOFeatures(file, index);
                    
                    // 이미지 정보 업데이트
                    this.updateImageInfo(file, index);
                } else {
                    throw new Error('크롭퍼 모듈을 사용할 수 없습니다.');
                }
                
            } catch (error) {
                Core.logger.error('이미지 로드 실패:', error);
                UI.showNotification('이미지 로드에 실패했습니다.', UI.CONSTANTS.NOTIFICATION_TYPES.ERROR);
                
                // 크롭퍼 실패 시 대체 로드 시도
                this.fallbackImageLoad(file, document.getElementById('cropImage'));
            }
        },
        
        // 크롭 이미지 요소 동적 생성
        createCropImageElement() {
            const cropContainer = document.querySelector('.crop-image-container') || document.getElementById('cropContainer');
            if (!cropContainer) {
                Core.logger.error('크롭 컨테이너를 찾을 수 없습니다.');
                return null;
            }
            
            let cropImage = document.createElement('img');
            cropImage.id = 'cropImage';
            cropImage.style.cssText = 'max-width: 100%; max-height: 500px; display: block; margin: 0 auto;';
            
            cropContainer.appendChild(cropImage);
            Core.logger.log('cropImage 요소 동적 생성 완료');
            
            return cropImage;
        },
        
        // 대체 이미지 로드 (크롭퍼 실패 시)
        fallbackImageLoad(file, imageElement) {
            if (!imageElement || !file) return;
            
            Core.logger.warn('대체 이미지 로드 시도:', file.name);
            
            const reader = new FileReader();
            reader.onload = function(e) {
                imageElement.src = e.target.result;
                imageElement.style.display = 'block';
                Core.logger.success('대체 이미지 로드 성공');
            };
            reader.onerror = function() {
                Core.logger.error('대체 이미지 로드도 실패');
                imageElement.style.display = 'none';
            };
            reader.readAsDataURL(file);
        },
        
        // 2단계 압축 설정 초기화
        initializeCompressionSettings() {
            const compressionContainer = document.getElementById('compressionSettings');
            if (!compressionContainer) return;
            
            // 압축 설정 UI 표시
            compressionContainer.style.display = 'block';
            
            // 압축 품질 슬라이더 초기화
            const qualitySlider = document.getElementById('compressionQuality');
            const qualityValue = document.getElementById('qualityValue');
            
            if (qualitySlider && qualityValue) {
                qualitySlider.value = 85;
                qualityValue.textContent = '85%';
                
                qualitySlider.addEventListener('input', (e) => {
                    qualityValue.textContent = e.target.value + '%';
                });
            }
        },
        
        // SEO 기능 초기화 (완전 기능)
        initializeSEOFeatures(file, index) {
            const seoContainer = document.getElementById('seoSettings');
            if (!seoContainer) return;
            
            seoContainer.style.display = 'block';
            
            // 파일명 영문 변환 (안전한 방식)
            const originalName = file.name.split('.')[0];
            let englishName;
            
            try {
                // SEO 모듈이 있으면 사용, 없으면 기본 변환
                if (window.FacilityImageSystem?.SEO?.cleanFileName) {
                    englishName = window.FacilityImageSystem.SEO.cleanFileName(originalName);
                } else {
                    englishName = this.simpleCleanFileName(originalName);
                }
            } catch (error) {
                englishName = this.simpleCleanFileName(originalName);
            }
            
            const filenameInput = document.getElementById('englishFilename');
            if (filenameInput) {
                filenameInput.value = englishName || `facility-image-${index + 1}`;
            }
            
            // Alt 텍스트 설정
            const altTextInput = document.getElementById('altText');
            if (altTextInput) {
                altTextInput.value = `${mainState.facilityName || '시설'} 시설 이미지 ${index + 1}`;
            }
            
            // 키워드 목록 초기화
            this.initializeKeywordList();
        },
        
        // 간단한 파일명 정리 (백업용)
        simpleCleanFileName(fileName) {
            if (!fileName || typeof fileName !== 'string') {
                return 'facility-image';
            }
            
            // 한글을 영어로 기본 변환
            const koreanToEnglish = {
                '시설': 'facility',
                '요양원': 'nursing-home',
                '로비': 'lobby',
                '복도': 'corridor',
                '거실': 'living-room',
                '침실': 'bedroom',
                '식당': 'dining-room',
                '정원': 'garden'
            };
            
            let result = fileName.toLowerCase();
            for (const [korean, english] of Object.entries(koreanToEnglish)) {
                result = result.replace(new RegExp(korean, 'g'), english);
            }
            
            // 특수문자 제거 및 대시로 변환
            result = result.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            
            return result || 'facility-image';
        },
        
        // 키워드 목록 초기화
        initializeKeywordList() {
            const keywordContainer = document.getElementById('keywordList');
            if (!keywordContainer) return;
            
            const defaultKeywords = [
                '시설', '요양원', '노인요양', '복지시설', '데이케어',
                '간병', '건강관리', '의료서비스', '재활치료', '요양보호'
            ];
            
            keywordContainer.innerHTML = '';
            
            defaultKeywords.forEach(keyword => {
                const badge = document.createElement('span');
                badge.className = 'badge bg-outline-secondary me-1 mb-1 keyword-badge';
                badge.style.cursor = 'pointer';
                badge.textContent = keyword;
                badge.onclick = () => this.toggleKeyword(badge, keyword);
                keywordContainer.appendChild(badge);
            });
        },
        
        // 키워드 토글
        toggleKeyword(badge, keyword) {
            if (badge.classList.contains('bg-primary')) {
                badge.classList.remove('bg-primary');
                badge.classList.add('bg-outline-secondary');
            } else {
                badge.classList.remove('bg-outline-secondary');
                badge.classList.add('bg-primary');
            }
            
            // 선택된 키워드 업데이트
            this.updateSelectedKeywords();
        },
        
        // 선택된 키워드 업데이트
        updateSelectedKeywords() {
            const selectedKeywords = [];
            const keywordBadges = document.querySelectorAll('.keyword-badge.bg-primary');
            
            keywordBadges.forEach(badge => {
                selectedKeywords.push(badge.textContent);
            });
            
            // 현재 파일에 키워드 저장
            const currentFile = mainState.selectedFiles[mainState.currentImageIndex];
            if (currentFile) {
                currentFile.keywords = selectedKeywords;
            }
        },
        
        // 이미지 정보 업데이트
        updateImageInfo(file, index) {
            const imageFileName = document.getElementById('imageFileName');
            const imageDimensions = document.getElementById('imageDimensions');
            
            if (imageFileName) {
                imageFileName.textContent = file.name || `이미지 ${index + 1}`;
                imageFileName.title = file.name || `이미지 ${index + 1}`;
            }
            
            // 이미지 크기 정보 업데이트 (파일 로드 후)
            if (imageDimensions && file instanceof File) {
                const img = new Image();
                img.onload = () => {
                    imageDimensions.textContent = `${img.width} × ${img.height}`;
                };
                img.src = URL.createObjectURL(file);
            }
        },
        
        updateCropNavigation() {
            const current = mainState.currentImageIndex + 1;
            const total = mainState.selectedFiles.length;
            
            // 네비게이션 UI 업데이트
            const navInfo = document.querySelector('.crop-navigation-info');
            if (navInfo) {
                navInfo.textContent = `${current} / ${total}`;
            }
            
            // 이전/다음 버튼 상태 업데이트
            const prevBtn = document.getElementById('prevImageBtn');
            const nextBtn = document.getElementById('nextImageBtn');
            
            if (prevBtn) {
                prevBtn.disabled = (current === 1);
            }
            
            if (nextBtn) {
                if (current === total) {
                    nextBtn.innerHTML = '<i class="fas fa-check me-1"></i>완료';
                    nextBtn.className = 'btn btn-success';
                } else {
                    nextBtn.innerHTML = '<i class="fas fa-arrow-right me-1"></i>다음';
                    nextBtn.className = 'btn btn-primary';
                }
            }
        },
        
        async savePendingCrops() {
            // 현재 크롭 데이터 저장
            const cropData = Cropper.getCropData();
            if (cropData) {
                const currentFile = mainState.selectedFiles[mainState.currentImageIndex];
                if (currentFile) {
                    currentFile.cropData = cropData;
                    currentFile.croppedBlob = await Cropper.getCroppedBlob();
                }
            }
        },
        
        async prepareForFinalUpload() {
            UI.showProgress('final-upload', '최종 업로드 준비 중...');
            
            try {
                // 모든 파일의 크롭 데이터 확인
                for (let i = 0; i < mainState.selectedFiles.length; i++) {
                    const fileData = mainState.selectedFiles[i];
                    
                    if (!fileData.croppedBlob) {
                        // 크롭되지 않은 파일은 원본 사용
                        fileData.croppedBlob = fileData.compressedBlob || fileData.file;
                    }
                    
                    UI.updateProgress('final-upload', (i + 1) / mainState.selectedFiles.length * 100, 
                        `파일 준비 중... ${i + 1}/${mainState.selectedFiles.length}`);
                }
                
                UI.hideProgress('final-upload');
                mainState.processedImages = mainState.selectedFiles;
                
            } catch (error) {
                UI.hideProgress('final-upload');
                Core.logger.error('최종 업로드 준비 실패:', error);
                throw error;
            }
        },
        
        // 크롭 단계에서 압축 적용 (안전한 완전 기능)
        async applyCompressionToCrop() {
            const currentFile = mainState.selectedFiles[mainState.currentImageIndex];
            if (!currentFile || !window.FacilityImageCropper) return;
            
            try {
                const qualitySlider = document.getElementById('compressionQuality');
                const quality = qualitySlider ? parseInt(qualitySlider.value) / 100 : 0.85;
                
                // 크롭된 이미지 얻기
                const croppedBlob = await window.FacilityImageCropper.getCroppedBlob({
                    quality: quality,
                    format: 'image/jpeg',
                    maxWidth: 1920,
                    maxHeight: 1080
                });
                
                if (croppedBlob) {
                    let finalBlob = croppedBlob;
                    
                    // 압축 모듈이 있으면 추가 압축 적용
                    try {
                        if (window.FacilityImageUpload?.compressImage) {
                            finalBlob = await window.FacilityImageUpload.compressImage(croppedBlob, {
                                quality: quality,
                                maxWidth: 1920,
                                maxHeight: 1080
                            });
                        }
                    } catch (compressError) {
                        Core.logger.warn('추가 압축 실패, 크롭된 이미지 사용:', compressError);
                        finalBlob = croppedBlob;
                    }
                    
                    // 파일에 저장
                    currentFile.croppedBlob = finalBlob;
                    currentFile.compressed = true;
                    
                    // 실시간 미리보기 업데이트
                    this.updateRealTimePreview(finalBlob);
                    
                    Core.logger.log('크롭 및 압축 완료:', {
                        original: currentFile.size,
                        final: finalBlob.size,
                        reduction: Math.round((1 - finalBlob.size / currentFile.size) * 100) + '%'
                    });
                }
                
            } catch (error) {
                Core.logger.error('압축 적용 실패:', error);
                UI.showNotification('이미지 처리에 실패했습니다.', UI.CONSTANTS.NOTIFICATION_TYPES.WARNING);
            }
        },
        
        // 실시간 미리보기 업데이트
        updateRealTimePreview(blob) {
            try {
                const previewImg = document.getElementById('cropPreviewImage') || 
                                 document.querySelector('.crop-preview-image, .preview-img');
                
                if (previewImg && blob) {
                    const url = URL.createObjectURL(blob);
                    previewImg.src = url;
                    previewImg.style.display = 'block';
                    
                    // 이전 URL 정리
                    if (previewImg.dataset.previousUrl) {
                        URL.revokeObjectURL(previewImg.dataset.previousUrl);
                    }
                    previewImg.dataset.previousUrl = url;
                    
                    Core.logger.log('실시간 미리보기 업데이트 완료');
                } else {
                    Core.logger.warn('미리보기 이미지 요소 또는 blob을 찾을 수 없음');
                }
            } catch (error) {
                Core.logger.error('실시간 미리보기 업데이트 실패:', error);
            }
        },
        
        // 다음 이미지로 이동
        async proceedToNextImage() {
            // 현재 설정 저장
            await this.saveCurrentImageSettings();
            
            const nextIndex = mainState.currentImageIndex + 1;
            if (nextIndex < mainState.selectedFiles.length) {
                await this.loadImageForCrop(nextIndex);
            } else {
                // 모든 이미지 완료 - 3단계로 이동
                await this.moveToStep(MAIN_CONSTANTS.WORKFLOW_STEPS.MANAGE);
            }
        },
        
        // 이전 이미지로 이동
        async proceedToPrevImage() {
            // 현재 설정 저장
            await this.saveCurrentImageSettings();
            
            const prevIndex = mainState.currentImageIndex - 1;
            if (prevIndex >= 0) {
                await this.loadImageForCrop(prevIndex);
            }
        },
        
        // 현재 이미지 설정 저장
        async saveCurrentImageSettings() {
            const currentFile = mainState.selectedFiles[mainState.currentImageIndex];
            if (!currentFile) return;
            
            try {
                // 크롭 데이터 저장
                const cropData = Cropper.getCropData();
                if (cropData) {
                    currentFile.cropData = cropData;
                }
                
                // Alt 텍스트 저장
                const altTextInput = document.getElementById('altText');
                if (altTextInput) {
                    currentFile.altText = altTextInput.value;
                }
                
                // 파일명 저장
                const filenameInput = document.getElementById('englishFilename');
                if (filenameInput) {
                    currentFile.englishFilename = filenameInput.value;
                }
                
                // 선택된 키워드 업데이트
                this.updateSelectedKeywords();
                
                // 압축 적용
                await this.applyCompressionToCrop();
                
            } catch (error) {
                Core.logger.error('설정 저장 실패:', error);
            }
        }
    };
    
    // ================================================
    // 이벤트 관리
    // ================================================
    
    const eventManager = {
        setupGlobalEvents() {
            // 크롭퍼 이벤트
            Core.on('imageCropped', this.handleImageCropped.bind(this));
            Core.on('nextImage', this.handleNextImage.bind(this));
            Core.on('prevImage', this.handlePrevImage.bind(this));
            
            // 데이터 이벤트
            Core.on('uploadComplete', this.handleDataUploadComplete.bind(this));
            
            // 키보드 단축키
            document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        },
        
        handleImageCropped(data) {
            const currentFile = mainState.selectedFiles[data.index];
            if (currentFile) {
                currentFile.croppedBlob = data.blob;
                currentFile.cropData = data.cropData;
            }
            
            // 자동 이돔을 제거하고 수동 제어로 변경
            // 사용자가 직접 다음 버튼을 눌러야 이동
            this.updateRealTimePreview(data.blob);
        },
        
        async handleNextImage() {
            await workflowManager.proceedToNextImage();
        },
        
        async handlePrevImage() {
            await workflowManager.proceedToPrevImage();
        },
        
        handleDataUploadComplete(data) {
            UI.showNotification('모든 이미지가 성공적으로 업로드되었습니다!', UI.CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
            mainState.currentState = MAIN_CONSTANTS.STATES.COMPLETE;
            
            // 페이지 새로고침 또는 리다이렉트
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        },
        
        handleKeyboardShortcuts(event) {
            if (mainState.currentStep !== MAIN_CONSTANTS.WORKFLOW_STEPS.CROP) return;
            
            // Cropper 모듈의 키보드 단축키는 이미 처리됨
            // 추가적인 전역 단축키만 여기서 처리
            
            if (event.key === 'Escape') {
                // ESC: 1단계로 돌아가기
                event.preventDefault();
                controller.moveToStep(MAIN_CONSTANTS.WORKFLOW_STEPS.UPLOAD);
            }
        }
    };
    
    // ================================================
    // 메인 컨트롤러 객체
    // ================================================
    
    const controller = {
        async initialize(options = {}) {
            if (mainState.isInitialized) {
                Core.logger.warn('메인 컨트롤러가 이미 초기화됨');
                return true;
            }
            
            Core.logger.log('메인 컨트롤러 초기화 시작');
            
            try {
                // 설정 병합
                Object.assign(mainState.settings, options.settings || {});
                
                // 시설 정보 설정
                mainState.facilityId = options.facilityId || Core.utils.extractFacilityId();
                mainState.facilityName = options.facilityName || '';
                
                if (!mainState.facilityId) {
                    throw new Error('시설 ID를 찾을 수 없습니다.');
                }
                
                // 모든 모듈 초기화
                const initSuccess = await moduleInitializer.initializeAllModules(
                    mainState.facilityId, 
                    mainState.facilityName, 
                    options
                );
                
                if (!initSuccess) {
                    throw new Error('모듈 초기화 실패');
                }
                
                // 이벤트 설정
                eventManager.setupGlobalEvents();
                
                // 초기 단계 설정
                await workflowManager.initializeStep(MAIN_CONSTANTS.WORKFLOW_STEPS.UPLOAD);
                
                mainState.isInitialized = true;
                mainState.currentState = MAIN_CONSTANTS.STATES.READY;
                
                Core.logger.success('메인 컨트롤러 초기화 완료');
                
                // 초기화 완료 알림
                UI.showNotification('시설 이미지 시스템이 준비되었습니다.', UI.CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
                
                return true;
                
            } catch (error) {
                mainState.currentState = MAIN_CONSTANTS.STATES.ERROR;
                Core.logger.error('메인 컨트롤러 초기화 실패:', error);
                UI.showNotification('시스템 초기화에 실패했습니다.', UI.CONSTANTS.NOTIFICATION_TYPES.ERROR);
                return false;
            }
        },
        
        async moveToStep(step) {
            return workflowManager.moveToStep(step);
        },
        
        async uploadImages() {
            if (mainState.processedImages.length === 0) {
                UI.showNotification('업로드할 이미지가 없습니다.', UI.CONSTANTS.NOTIFICATION_TYPES.WARNING);
                return;
            }
            
            try {
                mainState.currentState = MAIN_CONSTANTS.STATES.UPLOADING;
                UI.showProgress('upload', '이미지 업로드 중...');
                
                const result = await Data.uploadImages(mainState.processedImages);
                
                UI.hideProgress('upload');
                return result;
                
            } catch (error) {
                UI.hideProgress('upload');
                mainState.currentState = MAIN_CONSTANTS.STATES.ERROR;
                throw error;
            }
        },
        
        getCurrentState() {
            return {
                ...mainState,
                moduleInfo: {
                    core: Core.getInfo(),
                    cropper: Cropper.getInfo(),
                    upload: Upload.getInfo(),
                    ui: UI.getInfo(),
                    data: Data.getInfo(),
                    seo: SEO.getInfo(),
                    utils: Utils.getInfo()
                }
            };
        },
        
        async destroy() {
            Core.logger.log('메인 컨트롤러 종료');
            
            // 각 모듈 정리
            if (mainState.moduleStates.cropper) Cropper.destroy();
            if (mainState.moduleStates.upload) Upload.destroy();
            if (mainState.moduleStates.ui) UI.destroy();
            if (mainState.moduleStates.data) Data.destroy();
            if (mainState.moduleStates.seo) SEO.destroy();
            
            // 상태 초기화
            mainState.isInitialized = false;
            mainState.currentState = MAIN_CONSTANTS.STATES.INITIALIZING;
            
            Core.logger.success('메인 컨트롤러 종료 완료');
        },
        
        // 공용 파일 처리 함수 (다양한 입력 소스에서 사용)
        processFiles(files) {
            if (!files || files.length === 0) return;
            
            try {
                Core.logger.log('공용 파일 처리 시작:', { count: files.length });
                
                // 파일 배열로 변환
                const fileArray = Array.from(files);
                
                // 업로드 모듈의 파일 처리 함수 호출
                if (Upload && typeof Upload.handleFileSelect === 'function') {
                    Upload.handleFileSelect(fileArray);
                } else {
                    Core.logger.warn('업로드 모듈을 사용할 수 없습니다.');
                }
                
            } catch (error) {
                Core.logger.error('파일 처리 실패:', error);
                UI.showNotification('파일 처리 중 오류가 발생했습니다.', UI.CONSTANTS.NOTIFICATION_TYPES.ERROR);
            }
        },
        
        getInfo() {
            return {
                name: MAIN_CONSTANTS.MODULE_NAME,
                version: MAIN_CONSTANTS.VERSION,
                isInitialized: mainState.isInitialized,
                currentState: mainState.currentState,
                currentStep: mainState.currentStep,
                facilityId: mainState.facilityId,
                moduleStates: mainState.moduleStates
            };
        }
    };
    
    // ================================================
    // 전역 함수 정의 (HTML에서 호출됨)
    // ================================================
    
    // 메인 이미지 선택/해제 함수
    window.selectMainImage = function(index) {
        try {
            // 현재 메인 이미지와 같은 인덱스면 해제, 다른 인덱스면 설정
            if (mainState.mainImageIndex === index) {
                mainState.mainImageIndex = -1; // 메인 이미지 해제
                Core.logger.log(`메인 이미지 해제: ${index}`);
            } else {
                mainState.mainImageIndex = index; // 새 메인 이미지 설정
                Core.logger.log(`메인 이미지 설정: ${index}`);
            }
            
            // UI 업데이트
            moduleInitializer.updateMainImageInfo();
            
            // 이미지 목록 재생성 (메인 이미지 표시 업데이트)
            if (mainState.selectedFiles.length > 0) {
                moduleInitializer.showImageOrderInterface(mainState.selectedFiles);
            }
            
        } catch (error) {
            Core.logger.error('메인 이미지 선택 실패:', error);
        }
    };
    
    // 이미지 제거 함수
    window.removeImageFromOrder = function(index) {
        try {
            if (index >= 0 && index < mainState.selectedFiles.length) {
                const removedFile = mainState.selectedFiles[index];
                mainState.selectedFiles.splice(index, 1);
                
                // 메인 이미지 인덱스 조정
                if (mainState.mainImageIndex === index) {
                    mainState.mainImageIndex = -1; // 메인 이미지가 제거된 경우 해제
                } else if (mainState.mainImageIndex > index) {
                    mainState.mainImageIndex--; // 메인 이미지가 뒤에 있는 경우 인덱스 조정
                }
                
                Core.logger.log(`이미지 제거: ${removedFile.name}`);
                
                // UI 업데이트
                if (mainState.selectedFiles.length > 0) {
                    moduleInitializer.showImageOrderInterface(mainState.selectedFiles);
                } else {
                    // 모든 이미지가 제거된 경우 컨테이너 숨김
                    const previewContainer = document.querySelector('.selected-images-preview');
                    if (previewContainer) {
                        previewContainer.style.display = 'none';
                    }
                }
            }
        } catch (error) {
            Core.logger.error('이미지 제거 실패:', error);
        }
    };
    
    // 이미지 순서 변경 함수들
    window.moveImageUp = function(index) {
        try {
            if (index > 0 && index < mainState.selectedFiles.length) {
                // 파일 순서 변경
                [mainState.selectedFiles[index], mainState.selectedFiles[index - 1]] = 
                [mainState.selectedFiles[index - 1], mainState.selectedFiles[index]];
                
                // 메인 이미지 인덱스 조정
                if (mainState.mainImageIndex === index) {
                    mainState.mainImageIndex = index - 1;
                } else if (mainState.mainImageIndex === index - 1) {
                    mainState.mainImageIndex = index;
                }
                
                // UI 업데이트
                moduleInitializer.showImageOrderInterface(mainState.selectedFiles);
                Core.logger.log(`이미지 위로 이동: ${index} → ${index - 1}`);
            }
        } catch (error) {
            Core.logger.error('이미지 위로 이동 실패:', error);
        }
    };
    
    window.moveImageDown = function(index) {
        try {
            if (index >= 0 && index < mainState.selectedFiles.length - 1) {
                // 파일 순서 변경
                [mainState.selectedFiles[index], mainState.selectedFiles[index + 1]] = 
                [mainState.selectedFiles[index + 1], mainState.selectedFiles[index]];
                
                // 메인 이미지 인덱스 조정
                if (mainState.mainImageIndex === index) {
                    mainState.mainImageIndex = index + 1;
                } else if (mainState.mainImageIndex === index + 1) {
                    mainState.mainImageIndex = index;
                }
                
                // UI 업데이트
                moduleInitializer.showImageOrderInterface(mainState.selectedFiles);
                Core.logger.log(`이미지 아래로 이동: ${index} → ${index + 1}`);
            }
        } catch (error) {
            Core.logger.error('이미지 아래로 이동 실패:', error);
        }
    };
    
    // ================================================
    // 모듈 노출
    // ================================================
    
    window.FacilityImageSystem.Main = {
        CONSTANTS: MAIN_CONSTANTS,
        controller,
        workflowManager,
        eventManager,
        moduleInitializer,
        getState: () => ({ ...mainState }),
        initialize: controller.initialize.bind(controller),
        moveToStep: controller.moveToStep.bind(controller),
        uploadImages: controller.uploadImages.bind(controller),
        processFiles: controller.processFiles.bind(controller),
        getCurrentState: controller.getCurrentState.bind(controller),
        destroy: controller.destroy.bind(controller)
    };
    
    // 전역 접근을 위한 단축 참조
    window.FacilityImageMainController = window.FacilityImageSystem.Main;
    
    // workflowManager를 전역에서 접근 가능하도록 노출
    window.FacilityImageSystem.Main.workflowManager = workflowManager;
    
    // 자동 초기화 (DOM 준비 시)
    document.addEventListener('DOMContentLoaded', async function() {
        // 시설 이미지 관련 페이지에서만 자동 초기화
        if (document.querySelector('#uploadSection, .upload-area, #cropSection') ||
            window.location.pathname.includes('/facility/') && 
            window.location.pathname.includes('/crop-images')) {
            
            Core.logger.log('시설 이미지 페이지 감지 - 자동 초기화 시작');
            
            try {
                const success = await controller.initialize();
                if (success) {
                    Core.logger.success('시설 이미지 시스템 자동 초기화 완료');
                } else {
                    Core.logger.error('시설 이미지 시스템 자동 초기화 실패');
                }
            } catch (error) {
                Core.logger.error('자동 초기화 중 오류:', error);
            }
        }
    });
    
    Core.logger.log('메인 컨트롤러 로드 완료');
    
})();

// ================================================
// 전역 함수들 (HTML에서 호출)
// ================================================

// 이미지 순서 조작 함수들 (전역 함수로 HTML에서 호출)
function removeImageFromOrder(index) {
    try {
        console.log('이미지 제거 시도:', index);
        
        if (!window.FacilityImageSystem?.Main) {
            console.error('FacilityImageSystem.Main을 찾을 수 없음');
            return;
        }
        
        const mainController = window.FacilityImageSystem.Main;
        const currentState = mainController.getState();
        
        console.log('현재 상태:', {
            selectedFilesLength: currentState.selectedFiles?.length,
            index: index,
            moduleInitializer: !!mainController.moduleInitializer
        });
        
        if (index >= 0 && index < (currentState.selectedFiles?.length || 0)) {
            currentState.selectedFiles.splice(index, 1);
            console.log('이미지 제거 완료. 남은 파일:', currentState.selectedFiles.length);
            
            // moduleInitializer의 showImageOrderInterface 호출
            if (mainController.moduleInitializer?.showImageOrderInterface) {
                mainController.moduleInitializer.showImageOrderInterface(currentState.selectedFiles);
            } else {
                console.error('showImageOrderInterface 함수를 찾을 수 없음');
            }
            
            // 파일이 없으면 미리보기 숨기기
            if (currentState.selectedFiles.length === 0) {
                const previewContainer = document.getElementById('selectedImagesPreview');
                if (previewContainer) {
                    previewContainer.style.display = 'none';
                }
            }
        } else {
            console.error('잘못된 인덱스:', index);
        }
    } catch (error) {
        console.error('이미지 제거 실패:', error);
    }
}

function moveImageUp(index) {
    try {
        if (!window.FacilityImageSystem?.Main) return;
        
        const mainController = window.FacilityImageSystem.Main;
        const currentState = mainController.getState();
        
        if (index > 0 && index < currentState.selectedFiles.length) {
            // 배열 요소 교체
            [currentState.selectedFiles[index], currentState.selectedFiles[index - 1]] = 
            [currentState.selectedFiles[index - 1], currentState.selectedFiles[index]];
            
            // UI 다시 그리기
            if (mainController.moduleInitializer?.showImageOrderInterface) {
                mainController.moduleInitializer.showImageOrderInterface(currentState.selectedFiles);
            }
        }
    } catch (error) {
        console.error('이미지 위로 이동 실패:', error);
    }
}

function moveImageDown(index) {
    try {
        if (!window.FacilityImageSystem?.Main) return;
        
        const mainController = window.FacilityImageSystem.Main;
        const currentState = mainController.getState();
        
        if (index >= 0 && index < currentState.selectedFiles.length - 1) {
            // 배열 요소 교체
            [currentState.selectedFiles[index], currentState.selectedFiles[index + 1]] = 
            [currentState.selectedFiles[index + 1], currentState.selectedFiles[index]];
            
            // UI 다시 그리기
            if (mainController.moduleInitializer?.showImageOrderInterface) {
                mainController.moduleInitializer.showImageOrderInterface(currentState.selectedFiles);
            }
        }
    } catch (error) {
        console.error('이미지 아래로 이동 실패:', error);
    }
}

// 메인 이미지 선택 (1단계용)
function selectMainImage(index) {
    try {
        if (!window.FacilityImageSystem?.Main) return;
        
        const mainController = window.FacilityImageSystem.Main;
        const currentState = mainController.getState();
        
        if (index >= 0 && index < currentState.selectedFiles.length) {
            currentState.mainImageIndex = index;
            
            // UI 다시 그리기
            if (mainController.moduleInitializer?.showImageOrderInterface) {
                mainController.moduleInitializer.showImageOrderInterface(currentState.selectedFiles);
            }
        }
    } catch (error) {
        console.error('메인 이미지 설정 실패:', error);
    }
}

// 키워드 클릭 핸들러
function handleKeywordClick(keyword) {
    try {
        // 키워드 버튼 토글 (간단하게)
        const buttons = document.querySelectorAll(`[data-keyword="${keyword}"]`);
        buttons.forEach(button => {
            if (button.classList.contains('btn-outline-primary')) {
                button.classList.remove('btn-outline-primary');
                button.classList.add('btn-primary');
            } else {
                button.classList.remove('btn-primary');
                button.classList.add('btn-outline-primary');
            }
        });
        
        // 선택된 키워드 업데이트
        if (window.FacilityImageSystem?.Main?.moduleInitializer) {
            window.FacilityImageSystem.Main.moduleInitializer.updateSelectedKeywords();
        }
    } catch (error) {
        console.error('키워드 선택 오류:', error);
    }
}

// 2단계 컴트롤 전역 함수들
function proceedToNextImage() {
    try {
        if (window.FacilityImageSystem?.Main?.workflowManager) {
            window.FacilityImageSystem.Main.workflowManager.proceedToNextImage();
        }
    } catch (error) {
        console.error('다음 이미지 이동 실패:', error);
    }
}

function proceedToPrevImage() {
    try {
        if (window.FacilityImageSystem?.Main?.workflowManager) {
            window.FacilityImageSystem.Main.workflowManager.proceedToPrevImage();
        }
    } catch (error) {
        console.error('이전 이미지 이동 실패:', error);
    }
}

function applyCompression() {
    try {
        if (window.FacilityImageSystem?.Main?.workflowManager) {
            window.FacilityImageSystem.Main.workflowManager.applyCompressionToCrop();
        }
    } catch (error) {
        console.error('압축 적용 실패:', error);
    }
}

function saveCropAndNext() {
    try {
        if (window.FacilityImageSystem?.Main?.workflowManager) {
            window.FacilityImageSystem.Main.workflowManager.saveCurrentImageSettings();
        }
    } catch (error) {
        console.error('크롭 저장 실패:', error);
    }
}

function resetCrop() {
    try {
        if (window.FacilityImageCropper?.cropperControls) {
            window.FacilityImageCropper.cropperControls.reset();
        }
    } catch (error) {
        console.error('크롭 초기화 실패:', error);
    }
}

function zoomIn() {
    try {
        if (window.FacilityImageCropper?.cropperControls) {
            window.FacilityImageCropper.cropperControls.zoomIn();
        }
    } catch (error) {
        console.error('확대 실패:', error);
    }
}

function zoomOut() {
    try {
        if (window.FacilityImageCropper?.cropperControls) {
            window.FacilityImageCropper.cropperControls.zoomOut();
        }
    } catch (error) {
        console.error('축소 실패:', error);
    }
} 