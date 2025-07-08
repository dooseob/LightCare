/**
 * 시설 이미지 UI 모듈 (UI Module)
 * DOM 조작, 이벤트 처리, 프로그레스 표시 전용 모듈
 * 
 * @version 1.0.0
 * @author LightCare Team
 * @requires FacilityImageCore
 */

(function() {
    'use strict';
    
    if (!window.FacilityImageCore) {
        throw new Error('FacilityImageCore 모듈이 필요합니다.');
    }
    
    const Core = window.FacilityImageCore;
    
    if (!window.FacilityImageSystem.UI) {
        window.FacilityImageSystem.UI = {};
    }
    
    // ================================================
    // 상수 정의
    // ================================================
    
    const UI_CONSTANTS = {
        MODULE_NAME: 'FacilityImageUI',
        VERSION: '1.0.0',
        
        NOTIFICATION_TYPES: {
            INFO: 'info',
            SUCCESS: 'success',
            WARNING: 'warning',
            ERROR: 'error'
        },
        
        ANIMATION_DURATION: 300,
        NOTIFICATION_TIMEOUT: 5000
    };
    
    // ================================================
    // UI 상태 관리
    // ================================================
    
    const uiState = {
        isInitialized: false,
        activeNotifications: [],
        stepIndicators: [],
        progressBars: [],
        elements: {
            stepContainer: null,
            mainContainer: null,
            notificationContainer: null
        }
    };
    
    // ================================================
    // 단계 표시기 관리
    // ================================================
    
    const stepIndicator = {
        initialize() {
            const container = document.querySelector('.steps-indicator, #stepsIndicator');
            if (!container) {
                this.createStepIndicator();
            } else {
                uiState.elements.stepContainer = container;
            }
            this.setupStepEvents();
        },
        
        createStepIndicator() {
            const html = `
                <div class="steps-indicator mb-4" id="stepsIndicator">
                    <div class="step-item active" data-step="1">
                        <div class="step-circle"><i class="fas fa-upload"></i></div>
                        <div class="step-label">이미지 선택</div>
                    </div>
                    <div class="step-connector"></div>
                    <div class="step-item" data-step="2">
                        <div class="step-circle"><i class="fas fa-crop-alt"></i></div>
                        <div class="step-label">크롭 & 조정</div>
                    </div>
                    <div class="step-connector"></div>
                    <div class="step-item" data-step="3">
                        <div class="step-circle"><i class="fas fa-check"></i></div>
                        <div class="step-label">완료</div>
                    </div>
                </div>
            `;
            
            const container = document.querySelector('main, .container, body');
            if (container) {
                container.insertAdjacentHTML('afterbegin', html);
                uiState.elements.stepContainer = document.getElementById('stepsIndicator');
            }
        },
        
        setupStepEvents() {
            Core.on(Core.CONSTANTS.EVENTS.STEP_CHANGED, (data) => {
                this.updateStep(data.newStep);
            });
        },
        
        updateStep(step) {
            const steps = document.querySelectorAll('.step-item');
            steps.forEach((stepEl, index) => {
                const stepNumber = index + 1;
                if (stepNumber <= step) {
                    stepEl.classList.add('active');
                    if (stepNumber < step) {
                        stepEl.classList.add('completed');
                    }
                } else {
                    stepEl.classList.remove('active', 'completed');
                }
            });
        }
    };
    
    // ================================================
    // 프로그레스 관리
    // ================================================
    
    const progressManager = {
        show(id, message = '처리 중...') {
            const progressHtml = `
                <div class="progress-container" id="progress-${id}">
                    <div class="progress-message mb-2">${message}</div>
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                    </div>
                    <div class="progress-percentage text-center mt-1">0%</div>
                </div>
            `;
            
            const container = this.getProgressContainer();
            container.insertAdjacentHTML('beforeend', progressHtml);
            
            return document.getElementById(`progress-${id}`);
        },
        
        update(id, percentage, message = null) {
            const progressElement = document.getElementById(`progress-${id}`);
            if (!progressElement) return;
            
            const bar = progressElement.querySelector('.progress-bar');
            const text = progressElement.querySelector('.progress-percentage');
            const messageEl = progressElement.querySelector('.progress-message');
            
            if (bar) {
                bar.style.width = percentage + '%';
                bar.setAttribute('aria-valuenow', percentage);
            }
            
            if (text) {
                text.textContent = percentage + '%';
            }
            
            if (message && messageEl) {
                messageEl.textContent = message;
            }
        },
        
        hide(id) {
            const element = document.getElementById(`progress-${id}`);
            if (element) {
                element.style.opacity = '0';
                setTimeout(() => {
                    if (element.parentElement) {
                        element.parentElement.removeChild(element);
                    }
                }, UI_CONSTANTS.ANIMATION_DURATION);
            }
        },
        
        getProgressContainer() {
            let container = document.querySelector('#progressContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'progressContainer';
                container.className = 'progress-container-wrapper';
                document.body.appendChild(container);
            }
            return container;
        }
    };
    
    // ================================================
    // 알림 시스템
    // ================================================
    
    const notificationManager = {
        show(message, type = UI_CONSTANTS.NOTIFICATION_TYPES.INFO, timeout = UI_CONSTANTS.NOTIFICATION_TIMEOUT) {
            const id = Core.utils.generateUniqueId();
            const typeClass = this.getTypeClass(type);
            const icon = this.getTypeIcon(type);
            
            const notificationHtml = `
                <div class="alert alert-${typeClass} alert-dismissible fade show" id="notification-${id}" 
                     style="position: fixed; top: 20px; right: 20px; z-index: 1060; max-width: 400px;">
                    <i class="${icon} me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" onclick="FacilityImageUI.dismissNotification('${id}')"></button>
                </div>
            `;
            
            const container = this.getNotificationContainer();
            container.insertAdjacentHTML('beforeend', notificationHtml);
            
            uiState.activeNotifications.push(id);
            
            if (timeout > 0) {
                setTimeout(() => {
                    this.dismiss(id);
                }, timeout);
            }
            
            return id;
        },
        
        dismiss(id) {
            const notification = document.getElementById(`notification-${id}`);
            if (notification) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.parentElement.removeChild(notification);
                    }
                }, UI_CONSTANTS.ANIMATION_DURATION);
            }
            
            uiState.activeNotifications = uiState.activeNotifications.filter(nId => nId !== id);
        },
        
        getTypeClass(type) {
            switch (type) {
                case UI_CONSTANTS.NOTIFICATION_TYPES.SUCCESS: return 'success';
                case UI_CONSTANTS.NOTIFICATION_TYPES.WARNING: return 'warning';
                case UI_CONSTANTS.NOTIFICATION_TYPES.ERROR: return 'danger';
                default: return 'info';
            }
        },
        
        getTypeIcon(type) {
            switch (type) {
                case UI_CONSTANTS.NOTIFICATION_TYPES.SUCCESS: return 'fas fa-check-circle';
                case UI_CONSTANTS.NOTIFICATION_TYPES.WARNING: return 'fas fa-exclamation-triangle';
                case UI_CONSTANTS.NOTIFICATION_TYPES.ERROR: return 'fas fa-times-circle';
                default: return 'fas fa-info-circle';
            }
        },
        
        getNotificationContainer() {
            let container = uiState.elements.notificationContainer;
            if (!container) {
                container = document.createElement('div');
                container.id = 'notificationContainer';
                container.className = 'notification-container';
                document.body.appendChild(container);
                uiState.elements.notificationContainer = container;
            }
            return container;
        }
    };
    
    // ================================================
    // DOM 유틸리티
    // ================================================
    
    const domUtils = {
        show(element, animation = true) {
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }
            
            if (element) {
                if (animation) {
                    element.style.opacity = '0';
                    element.style.display = 'block';
                    setTimeout(() => {
                        element.style.opacity = '1';
                    }, 10);
                } else {
                    element.style.display = 'block';
                }
            }
        },
        
        hide(element, animation = true) {
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }
            
            if (element) {
                if (animation) {
                    element.style.opacity = '0';
                    setTimeout(() => {
                        element.style.display = 'none';
                    }, UI_CONSTANTS.ANIMATION_DURATION);
                } else {
                    element.style.display = 'none';
                }
            }
        },
        
        toggle(element, animation = true) {
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }
            
            if (element) {
                const isVisible = element.style.display !== 'none' && 
                                element.offsetParent !== null;
                
                if (isVisible) {
                    this.hide(element, animation);
                } else {
                    this.show(element, animation);
                }
            }
        },
        
        addClass(element, className) {
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }
            if (element) {
                element.classList.add(className);
            }
        },
        
        removeClass(element, className) {
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }
            if (element) {
                element.classList.remove(className);
            }
        },
        
        toggleClass(element, className) {
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }
            if (element) {
                element.classList.toggle(className);
            }
        }
    };
    
    // ================================================
    // 이벤트 관리
    // ================================================
    
    const eventManager = {
        setupGlobalEvents() {
            // Core 이벤트 리스너
            Core.on(Core.CONSTANTS.EVENTS.ERROR, (data) => {
                notificationManager.show(data.message, UI_CONSTANTS.NOTIFICATION_TYPES.ERROR);
            });
            
            Core.on(Core.CONSTANTS.EVENTS.SUCCESS, (data) => {
                notificationManager.show(data.message, UI_CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
            });
            
            // 진행률 이벤트
            Core.on('uploadProgress', (data) => {
                progressManager.update('upload', data.percentage, data.message);
            });
            
            Core.on('uploadStart', () => {
                progressManager.show('upload', '업로드 중...');
            });
            
            Core.on('uploadComplete', () => {
                progressManager.hide('upload');
                notificationManager.show('업로드가 완료되었습니다.', UI_CONSTANTS.NOTIFICATION_TYPES.SUCCESS);
            });
        }
    };
    
    // ================================================
    // 메인 UI 객체
    // ================================================
    
    const ui = {
        async initialize(options = {}) {
            if (uiState.isInitialized) {
                Core.logger.warn('UI 모듈이 이미 초기화됨');
                return true;
            }
            
            Core.logger.log('UI 모듈 초기화 시작');
            
            try {
                stepIndicator.initialize();
                eventManager.setupGlobalEvents();
                this.setupStyles();
                
                uiState.isInitialized = true;
                Core.logger.success('UI 모듈 초기화 완료');
                
                return true;
            } catch (error) {
                Core.logger.error('UI 모듈 초기화 실패:', error);
                return false;
            }
        },
        
        setupStyles() {
            const styles = `
                <style id="facility-ui-styles">
                .steps-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 2rem;
                }
                .step-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                }
                .step-circle {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: #dee2e6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 8px;
                    transition: all 0.3s ease;
                }
                .step-item.active .step-circle {
                    background: #007bff;
                    color: white;
                }
                .step-item.completed .step-circle {
                    background: #28a745;
                    color: white;
                }
                .step-connector {
                    width: 80px;
                    height: 2px;
                    background: #dee2e6;
                    margin: 0 20px;
                    margin-bottom: 25px;
                }
                .step-label {
                    font-size: 0.875rem;
                    color: #6c757d;
                    text-align: center;
                }
                .step-item.active .step-label {
                    color: #007bff;
                    font-weight: 500;
                }
                </style>
            `;
            
            if (!document.getElementById('facility-ui-styles')) {
                document.head.insertAdjacentHTML('beforeend', styles);
            }
        },
        
        showNotification(message, type, timeout) {
            return notificationManager.show(message, type, timeout);
        },
        
        dismissNotification(id) {
            notificationManager.dismiss(id);
        },
        
        showProgress(id, message) {
            return progressManager.show(id, message);
        },
        
        updateProgress(id, percentage, message) {
            progressManager.update(id, percentage, message);
        },
        
        hideProgress(id) {
            progressManager.hide(id);
        },
        
        updateStep(step) {
            stepIndicator.updateStep(step);
        },
        
        show: domUtils.show,
        hide: domUtils.hide,
        toggle: domUtils.toggle,
        addClass: domUtils.addClass,
        removeClass: domUtils.removeClass,
        toggleClass: domUtils.toggleClass,
        
        destroy() {
            uiState.activeNotifications.forEach(id => {
                notificationManager.dismiss(id);
            });
            
            const containers = [
                '#stepsIndicator',
                '#progressContainer',
                '#notificationContainer',
                '#facility-ui-styles'
            ];
            
            containers.forEach(selector => {
                const element = document.querySelector(selector);
                if (element && element.parentElement) {
                    element.parentElement.removeChild(element);
                }
            });
            
            uiState.isInitialized = false;
            Core.logger.log('UI 모듈 제거 완료');
        },
        
        getInfo() {
            return {
                name: UI_CONSTANTS.MODULE_NAME,
                version: UI_CONSTANTS.VERSION,
                isInitialized: uiState.isInitialized,
                activeNotifications: uiState.activeNotifications.length
            };
        }
    };
    
    // ================================================
    // 모듈 노출
    // ================================================
    
    window.FacilityImageSystem.UI = {
        CONSTANTS: UI_CONSTANTS,
        ui,
        stepIndicator,
        progressManager,
        notificationManager,
        domUtils,
        getState: () => ({ ...uiState }),
        initialize: ui.initialize.bind(ui),
        showNotification: ui.showNotification.bind(ui),
        dismissNotification: ui.dismissNotification.bind(ui),
        showProgress: ui.showProgress.bind(ui),
        updateProgress: ui.updateProgress.bind(ui),
        hideProgress: ui.hideProgress.bind(ui),
        updateStep: ui.updateStep.bind(ui),
        destroy: ui.destroy.bind(ui)
    };
    
    window.FacilityImageUI = window.FacilityImageSystem.UI;
    
    Core.logger.log('UI 모듈 로드 완료');
    
})(); 