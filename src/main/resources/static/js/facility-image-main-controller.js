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
            UI.showProgress('initialization', '모듈 초기화 중...');
            
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
                
                // 7. Cropper 모듈 초기화
                mainState.moduleStates.cropper = await Cropper.initialize();
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
            mainState.selectedFiles = files;
            
            if (mainState.settings.enableSEO) {
                // SEO 최적화 적용
                mainState.selectedFiles = SEO.bulkOptimize(files);
            }
            
            // 자동 단계 진행
            if (mainState.settings.autoAdvanceSteps && files.length > 0) {
                setTimeout(() => {
                    controller.moveToStep(MAIN_CONSTANTS.WORKFLOW_STEPS.CROP);
                }, 1000);
            }
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
            
            UI.hide('#uploadSection');
            UI.show('#cropSection');
            UI.hide('#manageSection');
            
            // 첫 번째 이미지 로드
            if (mainState.selectedFiles.length > 0) {
                await this.loadImageForCrop(0);
            }
            
            mainState.currentState = MAIN_CONSTANTS.STATES.CROPPING;
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
            
            mainState.currentImageIndex = index;
            const fileData = mainState.selectedFiles[index];
            
            try {
                await Cropper.loadImage(fileData.file, index);
                
                // 크롭 네비게이션 업데이트
                this.updateCropNavigation();
                
            } catch (error) {
                Core.logger.error('이미지 로드 실패:', error);
                UI.showNotification('이미지 로드에 실패했습니다.', UI.CONSTANTS.NOTIFICATION_TYPES.ERROR);
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
            
            // 자동으로 다음 이미지로 이동
            if (data.index < mainState.selectedFiles.length - 1) {
                this.handleNextImage();
            } else {
                // 마지막 이미지면 관리 단계로 이동
                controller.moveToStep(MAIN_CONSTANTS.WORKFLOW_STEPS.MANAGE);
            }
        },
        
        async handleNextImage() {
            const nextIndex = mainState.currentImageIndex + 1;
            if (nextIndex < mainState.selectedFiles.length) {
                await workflowManager.loadImageForCrop(nextIndex);
            }
        },
        
        async handlePrevImage() {
            const prevIndex = mainState.currentImageIndex - 1;
            if (prevIndex >= 0) {
                await workflowManager.loadImageForCrop(prevIndex);
            }
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
        getCurrentState: controller.getCurrentState.bind(controller),
        destroy: controller.destroy.bind(controller)
    };
    
    // 전역 접근을 위한 단축 참조
    window.FacilityImageMainController = window.FacilityImageSystem.Main;
    
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