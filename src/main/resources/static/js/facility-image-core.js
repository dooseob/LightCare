/**
 * 시설 이미지 핵심 모듈 (Core Module)
 * 모든 시설 이미지 모듈의 기반이 되는 핵심 기능 제공
 * 
 * 주요 기능:
 * - 전역 네임스페이스 관리
 * - 상태 관리 시스템
 * - 이벤트 시스템
 * - 모듈 초기화 및 종속성 관리
 * - 공통 유틸리티 함수
 * - 에러 처리 및 로깅
 * - 브라우저 호환성 체크
 * 
 * @version 1.0.0
 * @author LightCare Team
 */

(function() {
    'use strict';
    
    // ================================================
    // 전역 네임스페이스 초기화
    // ================================================
    
    // 메인 네임스페이스 생성 (중복 방지)
    if (typeof window.FacilityImageSystem === 'undefined') {
        window.FacilityImageSystem = {};
    }
    
    // 모듈 네임스페이스 생성
    window.FacilityImageSystem.Core = {};
    
    // ================================================
    // 상수 정의
    // ================================================
    
    const CONSTANTS = {
        VERSION: '1.0.0',
        MODULE_NAME: 'FacilityImageCore',
        
        // 파일 제한
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        MAX_IMAGES: 5,
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
        
        // 이미지 크기 제한
        MAX_WIDTH: 1920,
        MAX_HEIGHT: 1200,
        CROP_RATIO: 16/9,
        
        // 품질 설정
        DEFAULT_QUALITY: 0.8,
        WEBP_QUALITY: 0.85,
        
        // 단계 정의
        STEPS: {
            UPLOAD: 1,
            CROP: 2,
            MANAGE: 3
        },
        
        // 상태 정의
        STATUS: {
            IDLE: 'idle',
            LOADING: 'loading',
            PROCESSING: 'processing',
            SUCCESS: 'success',
            ERROR: 'error'
        },
        
        // 이벤트 타입
        EVENTS: {
            INITIALIZED: 'initialized',
            STATE_CHANGED: 'stateChanged',
            STEP_CHANGED: 'stepChanged',
            IMAGE_ADDED: 'imageAdded',
            IMAGE_REMOVED: 'imageRemoved',
            IMAGE_PROCESSED: 'imageProcessed',
            ERROR: 'error',
            SUCCESS: 'success'
        }
    };
    
    // ================================================
    // 전역 상태 관리
    // ================================================
    
    const globalState = {
        // 시스템 상태
        isInitialized: false,
        currentStep: CONSTANTS.STEPS.UPLOAD,
        status: CONSTANTS.STATUS.IDLE,
        
        // 시설 정보
        facilityId: null,
        facilityName: null,
        
        // 이미지 데이터
        originalImages: [],
        processedImages: [],
        uploadedImages: [],
        
        // 현재 작업 상태
        currentImageIndex: 0,
        isProcessing: false,
        
        // 설정
        settings: {
            maxFileSize: CONSTANTS.MAX_FILE_SIZE,
            maxImages: CONSTANTS.MAX_IMAGES,
            allowedTypes: CONSTANTS.ALLOWED_TYPES,
            cropRatio: CONSTANTS.CROP_RATIO,
            quality: CONSTANTS.DEFAULT_QUALITY,
            enableCompression: true,
            enableSEO: true,
            enableAltText: true
        },
        
        // 브라우저 지원 정보
        browserSupport: {
            avif: false,
            webp: false,
            dragDrop: false,
            fileReader: false
        },
        
        // 에러 상태
        errors: [],
        warnings: []
    };
    
    // ================================================
    // 이벤트 시스템
    // ================================================
    
    const eventSystem = {
        listeners: {},
        
        /**
         * 이벤트 리스너 등록
         * @param {string} eventType - 이벤트 타입
         * @param {Function} callback - 콜백 함수
         */
        on(eventType, callback) {
            if (!this.listeners[eventType]) {
                this.listeners[eventType] = [];
            }
            this.listeners[eventType].push(callback);
        },
        
        /**
         * 이벤트 리스너 제거
         * @param {string} eventType - 이벤트 타입
         * @param {Function} callback - 제거할 콜백 함수
         */
        off(eventType, callback) {
            if (!this.listeners[eventType]) return;
            
            this.listeners[eventType] = this.listeners[eventType].filter(
                listener => listener !== callback
            );
        },
        
        /**
         * 이벤트 발생
         * @param {string} eventType - 이벤트 타입
         * @param {*} data - 전달할 데이터
         */
        emit(eventType, data) {
            if (!this.listeners[eventType]) return;
            
            this.listeners[eventType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`이벤트 리스너 오류 (${eventType}):`, error);
                }
            });
        },
        
        /**
         * 모든 이벤트 리스너 제거
         */
        removeAllListeners() {
            this.listeners = {};
        }
    };
    
    // ================================================
    // 로깅 시스템
    // ================================================
    
    const logger = {
        isEnabled: true,
        prefix: '🏢 [FacilityImageCore]',
        
        /**
         * 일반 로그
         * @param {string} message - 메시지
         * @param {*} data - 추가 데이터
         */
        log(message, data = null) {
            if (!this.isEnabled) return;
            
            const timestamp = new Date().toLocaleTimeString();
            console.log(`${this.prefix} [${timestamp}] ${message}`, data || '');
        },
        
        /**
         * 에러 로그
         * @param {string} message - 메시지
         * @param {Error} error - 에러 객체
         */
        error(message, error = null) {
            if (!this.isEnabled) return;
            
            const timestamp = new Date().toLocaleTimeString();
            console.error(`${this.prefix} [${timestamp}] ❌ ${message}`, error || '');
        },
        
        /**
         * 경고 로그
         * @param {string} message - 메시지
         * @param {*} data - 추가 데이터
         */
        warn(message, data = null) {
            if (!this.isEnabled) return;
            
            const timestamp = new Date().toLocaleTimeString();
            console.warn(`${this.prefix} [${timestamp}] ⚠️ ${message}`, data || '');
        },
        
        /**
         * 성공 로그
         * @param {string} message - 메시지
         * @param {*} data - 추가 데이터
         */
        success(message, data = null) {
            if (!this.isEnabled) return;
            
            const timestamp = new Date().toLocaleTimeString();
            console.log(`${this.prefix} [${timestamp}] ✅ ${message}`, data || '');
        },
        
        /**
         * 상태 체크 로그
         */
        checkState() {
            if (!this.isEnabled) return;
            
            this.log('현재 상태 체크', {
                isInitialized: globalState.isInitialized,
                currentStep: globalState.currentStep,
                status: globalState.status,
                facilityId: globalState.facilityId,
                imagesCount: globalState.originalImages.length,
                isProcessing: globalState.isProcessing
            });
        }
    };
    
    // ================================================
    // 상태 관리 함수
    // ================================================
    
    const stateManager = {
        /**
         * 상태 업데이트 (불변성 보장)
         * @param {Object} updates - 업데이트할 상태
         * @returns {Object} 새로운 상태
         */
        updateState(updates) {
            const oldState = { ...globalState };
            Object.assign(globalState, updates);
            
            // 상태 변경 이벤트 발생
            eventSystem.emit(CONSTANTS.EVENTS.STATE_CHANGED, {
                oldState,
                newState: globalState,
                changes: updates
            });
            
            logger.log('상태 업데이트', updates);
            return globalState;
        },
        
        /**
         * 현재 상태 반환
         * @returns {Object} 현재 상태
         */
        getState() {
            return { ...globalState };
        },
        
        /**
         * 상태 초기화
         */
        resetState() {
            const initialState = {
                isInitialized: false,
                currentStep: CONSTANTS.STEPS.UPLOAD,
                status: CONSTANTS.STATUS.IDLE,
                facilityId: null,
                facilityName: null,
                originalImages: [],
                processedImages: [],
                uploadedImages: [],
                currentImageIndex: 0,
                isProcessing: false,
                errors: [],
                warnings: []
            };
            
            this.updateState(initialState);
            logger.log('상태 초기화 완료');
        },
        
        /**
         * 단계 변경
         * @param {number} step - 변경할 단계
         */
        changeStep(step) {
            if (step < 1 || step > 3) {
                logger.error('잘못된 단계 번호:', step);
                return;
            }
            
            const oldStep = globalState.currentStep;
            this.updateState({ currentStep: step });
            
            // 단계 변경 이벤트 발생
            eventSystem.emit(CONSTANTS.EVENTS.STEP_CHANGED, {
                oldStep,
                newStep: step
            });
            
            logger.log(`단계 변경: ${oldStep} → ${step}`);
        },
        
        /**
         * 에러 추가
         * @param {string} message - 에러 메시지
         * @param {Error} error - 에러 객체
         */
        addError(message, error = null) {
            const errorObj = {
                message,
                error: error ? error.message : null,
                timestamp: new Date().toISOString(),
                stack: error ? error.stack : null
            };
            
            globalState.errors.push(errorObj);
            this.updateState({ status: CONSTANTS.STATUS.ERROR });
            
            eventSystem.emit(CONSTANTS.EVENTS.ERROR, errorObj);
            logger.error(message, error);
        },
        
        /**
         * 경고 추가
         * @param {string} message - 경고 메시지
         */
        addWarning(message) {
            const warningObj = {
                message,
                timestamp: new Date().toISOString()
            };
            
            globalState.warnings.push(warningObj);
            logger.warn(message);
        }
    };
    
    // ================================================
    // 브라우저 호환성 체크
    // ================================================
    
    const browserSupport = {
        /**
         * 브라우저 지원 기능 체크
         */
        async checkSupport() {
            logger.log('브라우저 지원 기능 체크 시작');
            
            const support = {
                avif: await this.checkImageFormat('avif'),
                webp: await this.checkImageFormat('webp'),
                dragDrop: this.checkDragDropSupport(),
                fileReader: this.checkFileReaderSupport()
            };
            
            stateManager.updateState({ browserSupport: support });
            logger.log('브라우저 지원 기능 체크 완료', support);
            
            return support;
        },
        
        /**
         * 이미지 포맷 지원 체크
         * @param {string} format - 체크할 포맷 (webp, avif)
         * @returns {Promise<boolean>} 지원 여부
         */
        checkImageFormat(format) {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, 1, 1);
                
                const dataURL = canvas.toDataURL(`image/${format}`);
                const supported = dataURL.indexOf(`data:image/${format}`) === 0;
                
                resolve(supported);
            });
        },
        
        /**
         * 드래그 앤 드롭 지원 체크
         * @returns {boolean} 지원 여부
         */
        checkDragDropSupport() {
            const div = document.createElement('div');
            return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 
                   'FormData' in window && 'FileReader' in window;
        },
        
        /**
         * FileReader 지원 체크
         * @returns {boolean} 지원 여부
         */
        checkFileReaderSupport() {
            return 'FileReader' in window;
        }
    };
    
    // ================================================
    // 유틸리티 함수
    // ================================================
    
    const utils = {
        /**
         * 시설 ID 추출
         * @returns {number|null} 시설 ID
         */
        extractFacilityId() {
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
                logger.error('시설 ID 추출 중 오류:', error);
            }
            
            return facilityId;
        },
        
        /**
         * 파일 크기 포맷팅
         * @param {number} bytes - 바이트
         * @returns {string} 포맷된 크기
         */
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        
        /**
         * 파일 유형 검증
         * @param {File} file - 검증할 파일
         * @returns {boolean} 유효한 파일인지 여부
         */
        validateFileType(file) {
            return CONSTANTS.ALLOWED_TYPES.includes(file.type);
        },
        
        /**
         * 파일 크기 검증
         * @param {File} file - 검증할 파일
         * @returns {boolean} 유효한 크기인지 여부
         */
        validateFileSize(file) {
            return file.size <= CONSTANTS.MAX_FILE_SIZE;
        },
        
        /**
         * 고유 ID 생성
         * @returns {string} 고유 ID
         */
        generateUniqueId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },
        
        /**
         * 디바운스 함수
         * @param {Function} func - 실행할 함수
         * @param {number} wait - 대기 시간 (ms)
         * @returns {Function} 디바운스된 함수
         */
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        /**
         * 스로틀 함수
         * @param {Function} func - 실행할 함수
         * @param {number} limit - 제한 시간 (ms)
         * @returns {Function} 스로틀된 함수
         */
        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };
    
    // ================================================
    // 초기화 함수
    // ================================================
    
    const core = {
        /**
         * 핵심 모듈 초기화
         * @param {Object} options - 초기화 옵션
         * @returns {Promise<boolean>} 초기화 성공 여부
         */
        async initialize(options = {}) {
            if (globalState.isInitialized) {
                logger.warn('이미 초기화됨 - 중복 초기화 방지');
                return true;
            }
            
            logger.log('핵심 모듈 초기화 시작');
            
            try {
                // 설정 병합
                if (options.settings) {
                    Object.assign(globalState.settings, options.settings);
                }
                
                // 시설 ID 추출
                const facilityId = utils.extractFacilityId();
                if (!facilityId) {
                    throw new Error('시설 ID를 찾을 수 없습니다.');
                }
                
                // 브라우저 지원 체크
                await browserSupport.checkSupport();
                
                // 상태 업데이트
                stateManager.updateState({
                    isInitialized: true,
                    facilityId: facilityId,
                    status: CONSTANTS.STATUS.IDLE
                });
                
                // 초기화 완료 이벤트 발생
                eventSystem.emit(CONSTANTS.EVENTS.INITIALIZED, {
                    facilityId,
                    settings: globalState.settings,
                    browserSupport: globalState.browserSupport
                });
                
                logger.success('핵심 모듈 초기화 완료', {
                    facilityId,
                    version: CONSTANTS.VERSION
                });
                
                return true;
                
            } catch (error) {
                stateManager.addError('핵심 모듈 초기화 실패', error);
                return false;
            }
        },
        
        /**
         * 핵심 모듈 종료
         */
        destroy() {
            logger.log('핵심 모듈 종료');
            
            // 이벤트 리스너 제거
            eventSystem.removeAllListeners();
            
            // 상태 초기화
            stateManager.resetState();
            
            logger.success('핵심 모듈 종료 완료');
        },
        
        /**
         * 모듈 정보 반환
         * @returns {Object} 모듈 정보
         */
        getInfo() {
            return {
                name: CONSTANTS.MODULE_NAME,
                version: CONSTANTS.VERSION,
                isInitialized: globalState.isInitialized,
                facilityId: globalState.facilityId,
                currentStep: globalState.currentStep,
                status: globalState.status
            };
        }
    };
    
    // ================================================
    // 모듈 노출
    // ================================================
    
    // Core 모듈 API 노출
    window.FacilityImageSystem.Core = {
        // 상수
        CONSTANTS,
        
        // 시스템
        core,
        stateManager,
        eventSystem,
        logger,
        utils,
        browserSupport,
        
        // 편의 함수
        initialize: core.initialize.bind(core),
        destroy: core.destroy.bind(core),
        getState: stateManager.getState.bind(stateManager),
        updateState: stateManager.updateState.bind(stateManager),
        on: eventSystem.on.bind(eventSystem),
        off: eventSystem.off.bind(eventSystem),
        emit: eventSystem.emit.bind(eventSystem)
    };
    
    // 전역 접근을 위한 단축 참조
    window.FacilityImageCore = window.FacilityImageSystem.Core;
    
    logger.log('핵심 모듈 로드 완료');
    
})(); 