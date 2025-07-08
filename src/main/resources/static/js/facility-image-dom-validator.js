/**
 * 시설 이미지 DOM 검증 및 복구 시스템
 * DOM 요소 누락 문제 해결과 타이밍 이슈 방지
 */

console.log('🔍 시설 이미지 DOM 검증자 로드됨');

// DOM 검증자 네임스페이스
window.FacilityImageDOMValidator = {
    // 필수 DOM 요소 정의
    requiredElements: {
        // 1단계 요소들
        step1: {
            uploadSection: { 
                selector: '#uploadSection', 
                fallback: 'div', 
                attributes: { id: 'uploadSection', class: 'section' }
            },
            imageInput: { 
                selector: '#imageInput', 
                fallback: 'input', 
                attributes: { id: 'imageInput', type: 'file', multiple: true, accept: 'image/*' }
            },
            selectedImagesPreview: { 
                selector: '#selectedImagesPreview', 
                fallback: 'div', 
                attributes: { id: 'selectedImagesPreview', class: 'preview-container' }
            }
        },
        
        // 2단계 요소들 (크롭)
        step2: {
            cropSection: { 
                selector: '#cropSection', 
                fallback: 'div', 
                attributes: { id: 'cropSection', class: 'section', style: 'display: none;' }
            },
            cropImage: { 
                selector: '#cropImage', 
                fallback: 'img', 
                attributes: { id: 'cropImage', class: 'crop-target', style: 'max-width: 100%; display: block;' }
            },
            nextAndSaveBtn: { 
                selector: '#nextAndSaveBtn', 
                fallback: 'button', 
                attributes: { id: 'nextAndSaveBtn', class: 'btn btn-primary', type: 'button' }
            },
            saveAndCompleteBtn: { 
                selector: '#saveAndCompleteBtn', 
                fallback: 'button', 
                attributes: { id: 'saveAndCompleteBtn', class: 'btn btn-success', type: 'button' }
            }
        },
        
        // 3단계 요소들
        step3: {
            manageSection: { 
                selector: '#manageSection', 
                fallback: 'div', 
                attributes: { id: 'manageSection', class: 'section', style: 'display: none;' }
            },
            manageImagesGrid: { 
                selector: '#manageImagesGrid', 
                fallback: 'div', 
                attributes: { id: 'manageImagesGrid', class: 'row images-grid' }
            }
        }
    },
    
    // 검증 결과
    validationResults: {
        missing: [],
        created: [],
        existing: []
    },
    
    // DOM 검증 및 복구 실행
    validateAndRepair() {
        console.log('🔧 DOM 검증 및 복구 시작');
        
        this.validationResults = { missing: [], created: [], existing: [] };
        
        Object.keys(this.requiredElements).forEach(stepName => {
            const stepElements = this.requiredElements[stepName];
            console.log(`📋 ${stepName} 단계 요소 검증 중...`);
            
            Object.keys(stepElements).forEach(elementName => {
                const elementConfig = stepElements[elementName];
                this.validateElement(elementName, elementConfig, stepName);
            });
        });
        
        this.reportResults();
        return this.validationResults;
    },
    
    // 개별 요소 검증
    validateElement(elementName, config, stepName) {
        const element = document.querySelector(config.selector);
        
        if (element) {
            this.validationResults.existing.push(`${stepName}.${elementName}`);
            console.log(`✅ ${elementName} 요소 존재 확인`);
        } else {
            console.warn(`⚠️ ${elementName} 요소 누락 - 생성 시도`);
            this.validationResults.missing.push(`${stepName}.${elementName}`);
            
            try {
                const createdElement = this.createElement(config);
                this.insertElement(createdElement, elementName, stepName);
                this.validationResults.created.push(`${stepName}.${elementName}`);
                console.log(`🆕 ${elementName} 요소 생성 완료`);
            } catch (error) {
                console.error(`❌ ${elementName} 요소 생성 실패:`, error);
            }
        }
    },
    
    // 요소 생성
    createElement(config) {
        const element = document.createElement(config.fallback);
        
        // 속성 설정
        Object.keys(config.attributes).forEach(attr => {
            if (attr === 'class') {
                element.className = config.attributes[attr];
            } else {
                element.setAttribute(attr, config.attributes[attr]);
            }
        });
        
        return element;
    },
    
    // 요소 삽입
    insertElement(element, elementName, stepName) {
        let container = null;
        
        // 적절한 컨테이너 찾기
        if (stepName === 'step1') {
            container = document.querySelector('.card-body') || document.body;
        } else if (stepName === 'step2') {
            container = document.querySelector('#cropSection') || document.querySelector('.card-body') || document.body;
            
            // cropSection이 없는 경우 생성
            if (elementName === 'cropImage' && !document.querySelector('#cropSection')) {
                const cropSection = this.createElement({
                    fallback: 'div',
                    attributes: { id: 'cropSection', class: 'section crop-section', style: 'display: none;' }
                });
                
                const cardBody = document.querySelector('.card-body');
                if (cardBody) {
                    cardBody.appendChild(cropSection);
                    container = cropSection;
                }
            }
        } else if (stepName === 'step3') {
            container = document.querySelector('#manageSection') || document.querySelector('.card-body') || document.body;
        }
        
        if (container) {
            container.appendChild(element);
            console.log(`📍 ${elementName} 요소가 ${container.id || container.className}에 삽입됨`);
        } else {
            document.body.appendChild(element);
            console.warn(`⚠️ ${elementName} 요소가 body에 삽입됨 (적절한 컨테이너 없음)`);
        }
    },
    
    // 검증 결과 보고
    reportResults() {
        const { existing, missing, created } = this.validationResults;
        
        console.log('📊 DOM 검증 결과:');
        console.log(`✅ 기존 요소: ${existing.length}개`, existing);
        console.log(`⚠️ 누락 요소: ${missing.length}개`, missing);
        console.log(`🆕 생성 요소: ${created.length}개`, created);
        
        if (missing.length > 0 && created.length > 0) {
            this.showRepairNotification();
        }
    },
    
    // 복구 알림 표시
    showRepairNotification() {
        const notification = document.createElement('div');
        notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
        notification.style.cssText = 'top: 20px; left: 20px; z-index: 9999; max-width: 400px;';
        notification.innerHTML = `
            <i class="fas fa-tools me-2"></i>
            <strong>DOM 복구 완료</strong><br>
            누락된 ${this.validationResults.missing.length}개 요소가 자동으로 생성되었습니다.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // 자동 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    },
    
    // 특정 요소 강제 생성
    forceCreateElement(elementId, config) {
        console.log(`🔨 ${elementId} 요소 강제 생성`);
        
        // 기존 요소 제거
        const existing = document.getElementById(elementId);
        if (existing) {
            existing.remove();
        }
        
        // 새 요소 생성
        const element = this.createElement(config);
        
        // 적절한 위치에 삽입
        const container = document.querySelector('.card-body') || document.body;
        container.appendChild(element);
        
        console.log(`✅ ${elementId} 요소 강제 생성 완료`);
        return element;
    },
    
    // 크롭 요소 전용 생성
    createCropSection() {
        console.log('🎨 크롭 섹션 생성');
        
        const cropSection = document.createElement('div');
        cropSection.id = 'cropSection';
        cropSection.className = 'section crop-section';
        cropSection.style.display = 'none';
        
        cropSection.innerHTML = `
            <div class="row">
                <div class="col-lg-8">
                    <div class="crop-container">
                        <img id="cropImage" class="crop-target" style="max-width: 100%; display: block;">
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="crop-controls">
                        <div class="mb-3">
                            <label for="seoFileName" class="form-label">파일명</label>
                            <input type="text" class="form-control" id="seoFileName" placeholder="파일명 입력">
                        </div>
                        <div class="mb-3">
                            <label for="altText" class="form-label">Alt 텍스트</label>
                            <input type="text" class="form-control" id="altText" placeholder="이미지 설명">
                        </div>
                        <div class="d-flex gap-2">
                            <button type="button" id="nextAndSaveBtn" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i>저장 후 다음
                            </button>
                            <button type="button" id="saveAndCompleteBtn" class="btn btn-success">
                                <i class="fas fa-check me-1"></i>저장 후 완료
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const container = document.querySelector('.card-body');
        if (container) {
            container.appendChild(cropSection);
            console.log('✅ 크롭 섹션 생성 완료');
            return cropSection;
        } else {
            console.error('❌ 크롭 섹션 컨테이너를 찾을 수 없음');
            return null;
        }
    },
    
    // 정기 검증 (옵션)
    startPeriodicValidation(interval = 5000) {
        console.log(`🔄 정기 DOM 검증 시작 (${interval}ms 간격)`);
        
        setInterval(() => {
            const missingElements = this.getMissingElements();
            if (missingElements.length > 0) {
                console.warn('⚠️ 정기 검증에서 누락 요소 발견:', missingElements);
                this.validateAndRepair();
            }
        }, interval);
    },
    
    // 누락 요소 확인
    getMissingElements() {
        const missing = [];
        
        Object.keys(this.requiredElements).forEach(stepName => {
            const stepElements = this.requiredElements[stepName];
            Object.keys(stepElements).forEach(elementName => {
                const config = stepElements[elementName];
                if (!document.querySelector(config.selector)) {
                    missing.push(`${stepName}.${elementName}`);
                }
            });
        });
        
        return missing;
    }
};

// 자동 실행
document.addEventListener('DOMContentLoaded', function() {
    // 초기 검증
    setTimeout(() => {
        window.FacilityImageDOMValidator.validateAndRepair();
    }, 100);
    
    // 추가 검증 (다른 스크립트 로드 후)
    setTimeout(() => {
        window.FacilityImageDOMValidator.validateAndRepair();
    }, 1000);
});

console.log('✅ 시설 이미지 DOM 검증자 로드 완료');