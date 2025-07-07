/**
 * 시설 이미지 업로드 3단계 관리 전용 JavaScript
 * 타임리프 인라인 충돌 완전 방지를 위해 별도 파일로 분리
 * 메인이미지 지정, 이미지 삭제, 드롭다운 관리 포함
 */

console.log('🎯 시설 이미지 3단계 관리 스크립트 로드됨');

// 전역 변수 (네임스페이스 사용으로 충돌 방지)
window.facilityImageStep3 = window.facilityImageStep3 || {
    facilityId: null,
    currentImages: [],
    isProcessing: false
};

// 초기화 (회원삭제 패턴 적용)
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 시설 이미지 3단계 관리 초기화 시작');
    
    // DOM 요소 확인
    const elements = {
        manageImagesGrid: document.getElementById('manageImagesGrid'),
        finalCompleteBtn: document.getElementById('finalCompleteBtn'),
        backToCropBtn: document.getElementById('backToCropBtn')
    };
    
    console.log('📋 3단계 DOM 요소 확인:', {
        manageImagesGrid: !!elements.manageImagesGrid,
        finalCompleteBtn: !!elements.finalCompleteBtn,
        backToCropBtn: !!elements.backToCropBtn
    });
    
    // URL에서 facilityId 추출
    extractFacilityId();
    
    // 3단계 관리 기능이 필요한 경우에만 초기화
    if (elements.manageImagesGrid || document.querySelector('.manage-section')) {
        initializeStep3Management(elements);
        console.log('✅ 시설 이미지 3단계 관리 초기화 완료');
    } else {
        console.log('ℹ️ 3단계 관리 섹션이 없어서 초기화 건너뜀');
    }
});

// 시설 ID 추출 (안전한 방식)
function extractFacilityId() {
    try {
        // URL에서 추출
        const pathParts = window.location.pathname.split('/');
        window.facilityImageStep3.facilityId = pathParts[pathParts.length - 1];
        
        // 숫자가 아닌 경우 다른 방법 시도
        if (isNaN(window.facilityImageStep3.facilityId)) {
            // 메타 태그에서 추출
            const facilityMeta = document.querySelector('meta[name="facility-id"]');
            if (facilityMeta) {
                window.facilityImageStep3.facilityId = facilityMeta.getAttribute('content');
            }
        }
        
        console.log('🏢 추출된 시설 ID:', window.facilityImageStep3.facilityId);
        
    } catch (error) {
        console.error('❌ 시설 ID 추출 실패:', error);
        window.facilityImageStep3.facilityId = null;
    }
}

// 3단계 관리 기능 초기화
function initializeStep3Management(elements) {
    console.log('🔧 3단계 관리 기능 초기화');
    
    // 전역 함수 설정 (타임리프 충돌 방지)
    setupGlobalManageFunctions();
    
    // 이벤트 위임 설정 (동적 생성 요소 대응)
    setupStep3EventDelegation();
    
    // 초기 이미지 목록 로드 (있는 경우)
    if (elements.manageImagesGrid) {
        loadExistingImages();
    }
    
    console.log('✅ 3단계 관리 기능 초기화 완료');
}

// 전역 함수 설정 (타임리프 충돌 완전 방지)
function setupGlobalManageFunctions() {
    console.log('🌐 3단계 전용 전역 함수 설정');
    
    // 메인 이미지 설정 함수 (step3 전용)
    window.setMainImageStep3 = function(imageId) {
        console.log('⭐ 3단계 메인 이미지 설정:', imageId);
        
        if (window.facilityImageStep3.isProcessing) {
            console.log('⚠️ 이미 처리 중입니다');
            return;
        }
        
        if (!validateImageAction(imageId)) {
            return;
        }
        
        if (!confirm('이 이미지를 메인 이미지로 설정하시겠습니까?')) {
            console.log('🚫 메인 이미지 설정 취소');
            return;
        }
        
        executeMainImageSetting(imageId);
    };
    
    // 이미지 삭제 함수 (step3 전용)
    window.deleteImageStep3 = function(imageId) {
        console.log('🗑️ 3단계 이미지 삭제:', imageId);
        
        if (window.facilityImageStep3.isProcessing) {
            console.log('⚠️ 이미 처리 중입니다');
            return;
        }
        
        if (!validateImageAction(imageId)) {
            return;
        }
        
        if (!confirm('이 이미지를 삭제하시겠습니까?\n삭제된 이미지는 복구할 수 없습니다.')) {
            console.log('🚫 이미지 삭제 취소');
            return;
        }
        
        executeImageDeletion(imageId);
    };
    
    console.log('✅ 3단계 전용 전역 함수 설정 완료');
}

// 이미지 액션 유효성 검사
function validateImageAction(imageId) {
    if (!imageId) {
        console.error('❌ imageId가 제공되지 않았습니다');
        showStep3Message('error', '이미지 ID가 잘못되었습니다.');
        return false;
    }
    
    if (!window.facilityImageStep3.facilityId) {
        console.error('❌ facilityId가 설정되지 않았습니다');
        showStep3Message('error', '시설 ID를 찾을 수 없습니다.');
        return false;
    }
    
    console.log('✅ 이미지 액션 유효성 검사 통과:', {
        imageId: imageId,
        facilityId: window.facilityImageStep3.facilityId
    });
    
    return true;
}

// 메인 이미지 설정 실행
function executeMainImageSetting(imageId) {
    console.log('🚀 메인 이미지 설정 실행:', imageId);
    
    window.facilityImageStep3.isProcessing = true;
    
    // 버튼 비활성화
    disableAllActionButtons(true);
    
    fetch(`/facility/facility-images/${imageId}/set-main`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('📡 메인 이미지 설정 응답:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('📥 메인 이미지 설정 결과:', data);
        
        if (data.success) {
            console.log('✅ 메인 이미지 설정 성공');
            showStep3Message('success', '메인 이미지로 설정되었습니다.');
            
            // 이미지 목록 새로고침
            setTimeout(() => {
                refreshImageGrid();
            }, 1000);
            
        } else {
            console.error('❌ 메인 이미지 설정 실패:', data.message);
            showStep3Message('error', data.message || '메인 이미지 설정에 실패했습니다.');
        }
    })
    .catch(error => {
        console.error('🚨 메인 이미지 설정 오류:', error);
        showStep3Message('error', '메인 이미지 설정 중 오류가 발생했습니다: ' + error.message);
    })
    .finally(() => {
        window.facilityImageStep3.isProcessing = false;
        disableAllActionButtons(false);
    });
}

// 이미지 삭제 실행
function executeImageDeletion(imageId) {
    console.log('🚀 이미지 삭제 실행:', imageId);
    
    window.facilityImageStep3.isProcessing = true;
    
    // 버튼 비활성화
    disableAllActionButtons(true);
    
    fetch(`/facility/facility-images/${imageId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('📡 이미지 삭제 응답:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('📥 이미지 삭제 결과:', data);
        
        if (data.success) {
            console.log('✅ 이미지 삭제 성공');
            showStep3Message('success', '이미지가 삭제되었습니다.');
            
            // 이미지 목록 새로고침
            setTimeout(() => {
                refreshImageGrid();
            }, 1000);
            
        } else {
            console.error('❌ 이미지 삭제 실패:', data.message);
            showStep3Message('error', data.message || '이미지 삭제에 실패했습니다.');
        }
    })
    .catch(error => {
        console.error('🚨 이미지 삭제 오류:', error);
        showStep3Message('error', '이미지 삭제 중 오류가 발생했습니다: ' + error.message);
    })
    .finally(() => {
        window.facilityImageStep3.isProcessing = false;
        disableAllActionButtons(false);
    });
}

// 이벤트 위임 설정 (동적 생성 요소 대응)
function setupStep3EventDelegation() {
    console.log('🎯 3단계 이벤트 위임 설정');
    
    // 전체 document에 대한 클릭 이벤트 위임
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        // 3단계 관리 섹션 내에서만 처리
        if (!target.closest('.manage-section') && !target.closest('#manageImagesGrid')) {
            return;
        }
        
        console.log('🖱️ 3단계 내 클릭:', {
            tagName: target.tagName,
            className: target.className,
            id: target.id,
            dataImageId: target.getAttribute('data-image-id')
        });
        
        // 메인 이미지 설정 버튼
        if (target.closest('.set-main-btn-step3')) {
            event.preventDefault();
            console.log('⭐ 3단계 메인 이미지 버튼 클릭');
            const button = target.closest('.set-main-btn-step3');
            const imageId = button.getAttribute('data-image-id');
            
            if (imageId) {
                window.setMainImageStep3(parseInt(imageId));
            } else {
                console.error('❌ 메인 이미지 설정: imageId 없음');
            }
            return;
        }
        
        // 이미지 삭제 버튼
        if (target.closest('.delete-btn-step3')) {
            event.preventDefault();
            console.log('🗑️ 3단계 삭제 버튼 클릭');
            const button = target.closest('.delete-btn-step3');
            const imageId = button.getAttribute('data-image-id');
            
            if (imageId) {
                window.deleteImageStep3(parseInt(imageId));
            } else {
                console.error('❌ 이미지 삭제: imageId 없음');
            }
            return;
        }
        
        // 드롭다운 토글 (3단계 전용)
        if (target.closest('.dropdown-toggle-step3')) {
            event.preventDefault();
            console.log('🔽 3단계 드롭다운 토글');
            const dropdownToggle = target.closest('.dropdown-toggle-step3');
            toggleStep3Dropdown(dropdownToggle);
            return;
        }
    });
    
    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown-step3')) {
            closeAllStep3Dropdowns();
        }
    });
    
    console.log('✅ 3단계 이벤트 위임 설정 완료');
}

// 3단계 전용 드롭다운 토글
function toggleStep3Dropdown(dropdownToggle) {
    console.log('🔽 3단계 드롭다운 토글 시작');
    
    // 다른 드롭다운 모두 닫기
    closeAllStep3Dropdowns();
    
    const dropdownMenu = dropdownToggle.nextElementSibling;
    
    if (!dropdownMenu || !dropdownMenu.classList.contains('dropdown-menu')) {
        console.error('❌ 3단계 드롭다운 메뉴 없음');
        return;
    }
    
    // 현재 드롭다운 토글
    const isShown = dropdownMenu.classList.contains('show');
    
    if (!isShown) {
        dropdownMenu.classList.add('show');
        dropdownToggle.classList.add('show');
        dropdownToggle.setAttribute('aria-expanded', 'true');
        console.log('✅ 3단계 드롭다운 열림');
    }
}

// 모든 3단계 드롭다운 닫기
function closeAllStep3Dropdowns() {
    document.querySelectorAll('.manage-section .dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
    });
    document.querySelectorAll('.manage-section .dropdown-toggle-step3.show').forEach(toggle => {
        toggle.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
    });
}

// 모든 액션 버튼 비활성화/활성화
function disableAllActionButtons(disable) {
    const buttons = document.querySelectorAll('.set-main-btn-step3, .delete-btn-step3');
    buttons.forEach(btn => {
        btn.disabled = disable;
        if (disable) {
            btn.style.opacity = '0.6';
        } else {
            btn.style.opacity = '1';
        }
    });
}

// 기존 이미지 목록 로드
function loadExistingImages() {
    console.log('📋 기존 이미지 목록 로드');
    
    if (!window.facilityImageStep3.facilityId) {
        console.warn('⚠️ 시설 ID가 없어서 이미지 로드 건너뜀');
        return;
    }
    
    fetch(`/facility/facility-images/${window.facilityImageStep3.facilityId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.images) {
                window.facilityImageStep3.currentImages = data.images;
                console.log('✅ 기존 이미지 로드 완료:', data.images.length + '개');
            }
        })
        .catch(error => {
            console.error('❌ 기존 이미지 로드 실패:', error);
        });
}

// 이미지 그리드 새로고침
function refreshImageGrid() {
    console.log('🔄 이미지 그리드 새로고침');
    
    if (!window.facilityImageStep3.facilityId) {
        console.warn('⚠️ 시설 ID가 없어서 새로고침 건너뜀');
        return;
    }
    
    // 현재 이미지 목록 다시 로드
    fetch(`/facility/facility-images/${window.facilityImageStep3.facilityId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.images) {
                console.log('✅ 새로고침 완료:', data.images.length + '개 이미지');
                // 이미지 그리드가 있으면 업데이트
                if (typeof updateManageImagesGrid === 'function') {
                    updateManageImagesGrid();
                } else {
                    // 페이지 새로고침으로 폴백
                    setTimeout(() => location.reload(), 500);
                }
            }
        })
        .catch(error => {
            console.error('❌ 이미지 그리드 새로고침 실패:', error);
        });
}

// 3단계 전용 메시지 표시
function showStep3Message(type, message) {
    console.log(`📢 3단계 메시지 (${type}):`, message);
    
    // 기존 메시지 제거
    const existingMessages = document.querySelectorAll('.step3-message');
    existingMessages.forEach(msg => msg.remove());
    
    // 새 메시지 생성
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show step3-message`;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '10000';
    messageDiv.style.minWidth = '300px';
    messageDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    // 페이지에 추가
    document.body.appendChild(messageDiv);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// 디버깅 함수들
window.facilityImageStep3Debug = {
    getState: () => window.facilityImageStep3,
    testMainImageSetting: (imageId) => {
        console.log('🧪 메인 이미지 설정 테스트:', imageId);
        window.setMainImageStep3(imageId);
    },
    testImageDeletion: (imageId) => {
        console.log('🧪 이미지 삭제 테스트:', imageId);
        window.deleteImageStep3(imageId);
    },
    refreshGrid: () => {
        console.log('🧪 그리드 새로고침 테스트');
        refreshImageGrid();
    }
};

console.log('✅ 시설 이미지 3단계 관리 스크립트 로드 완료');
console.log('🧪 디버깅: window.facilityImageStep3Debug 객체 사용 가능');