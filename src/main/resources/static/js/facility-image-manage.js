/**
 * 시설 이미지 관리 전용 JavaScript
 * Thymeleaf 인라인 충돌 방지를 위해 별도 파일로 분리
 */

console.log('🛠️ 시설 이미지 관리 스크립트 로드됨');

// 전역 변수
let facilityId = null;

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 시설 이미지 관리 초기화 시작');
    
    // URL에서 facilityId 추출
    const pathParts = window.location.pathname.split('/');
    facilityId = pathParts[pathParts.length - 1];
    console.log('🏢 시설 ID:', facilityId);
    
    // 브라우저 환경 체크
    console.log('🌐 브라우저 환경:', {
        userAgent: navigator.userAgent,
        bootstrap: typeof bootstrap !== 'undefined' ? bootstrap.version : 'undefined',
        jquery: typeof $ !== 'undefined' ? $.fn.jquery : 'undefined'
    });
    
    // 관리 기능 초기화
    initializeImageManagement();
});

// 이미지 관리 기능 초기화
function initializeImageManagement() {
    console.log('🔧 이미지 관리 기능 초기화');
    
    // 기존 전역 함수들을 재정의하여 충돌 방지
    setupGlobalFunctions();
    
    // 동적으로 생성되는 드롭다운 버튼 이벤트 위임
    setupEventDelegation();
    
    console.log('✅ 이미지 관리 기능 초기화 완료');
}

// 전역 함수 설정 (Thymeleaf 충돌 방지)
function setupGlobalFunctions() {
    console.log('🌐 전역 함수 설정 시작');
    
    // 메인 이미지 설정 함수
    window.setMainImage = function(imageId) {
        console.log('⭐ 메인 이미지 설정 요청:', imageId);
        
        if (!imageId) {
            console.error('❌ imageId가 제공되지 않았습니다');
            alert('이미지 ID가 잘못되었습니다.');
            return;
        }
        
        if (!confirm('이 이미지를 메인 이미지로 설정하시겠습니까?')) {
            return;
        }
        
        // 버튼 비활성화 (중복 클릭 방지)
        const buttons = document.querySelectorAll('[onclick*="setMainImage"]');
        buttons.forEach(btn => btn.disabled = true);
        
        fetch(`/facility/api/images/${imageId}/set-main`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(response => {
            console.log('📡 서버 응답 상태:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('📥 서버 응답 데이터:', data);
            
            if (data.success) {
                console.log('✅ 메인 이미지 설정 성공:', imageId);
                
                // 성공 메시지 표시
                showMessage('success', '메인 이미지로 설정되었습니다.');
                
                // 페이지 새로고침 또는 이미지 목록 업데이트
                setTimeout(() => {
                    if (typeof updateManageImagesGrid === 'function') {
                        updateManageImagesGrid();
                    } else {
                        location.reload();
                    }
                }, 1000);
                
            } else {
                console.error('❌ 메인 이미지 설정 실패:', data.message);
                showMessage('error', data.message || '메인 이미지 설정에 실패했습니다.');
            }
        })
        .catch(error => {
            console.error('🚨 메인 이미지 설정 오류:', error);
            showMessage('error', '메인 이미지 설정 중 오류가 발생했습니다: ' + error.message);
        })
        .finally(() => {
            // 버튼 재활성화
            buttons.forEach(btn => btn.disabled = false);
        });
    };
    
    // 이미지 삭제 함수
    window.deleteImage = function(imageId) {
        console.log('🗑️ 이미지 삭제 요청:', imageId);
        
        if (!imageId) {
            console.error('❌ imageId가 제공되지 않았습니다');
            alert('이미지 ID가 잘못되었습니다.');
            return;
        }
        
        if (!confirm('이 이미지를 삭제하시겠습니까?\n삭제된 이미지는 복구할 수 없습니다.')) {
            return;
        }
        
        // 버튼 비활성화 (중복 클릭 방지)
        const buttons = document.querySelectorAll('[onclick*="deleteImage"]');
        buttons.forEach(btn => btn.disabled = true);
        
        fetch(`/facility/api/images/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(response => {
            console.log('📡 서버 응답 상태:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('📥 서버 응답 데이터:', data);
            
            if (data.success) {
                console.log('✅ 이미지 삭제 성공:', imageId);
                
                // UI에서 해당 이미지 카드 제거 (애니메이션)
                const imageCard = document.querySelector(`[data-image-id="${imageId}"]`);
                if (imageCard) {
                    const cardContainer = imageCard.closest('.col-md-4, .col-sm-6, .col-12');
                    if (cardContainer) {
                        cardContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        cardContainer.style.opacity = '0';
                        cardContainer.style.transform = 'scale(0.8)';
                        
                        setTimeout(() => {
                            cardContainer.remove();
                        }, 300);
                    }
                }
                
                // 성공 메시지 표시
                showMessage('success', '이미지가 성공적으로 삭제되었습니다.');
                
                // 이미지 목록 새로고침
                setTimeout(() => {
                    if (typeof updateManageImagesGrid === 'function') {
                        updateManageImagesGrid();
                    } else {
                        location.reload();
                    }
                }, 1500);
                
            } else {
                console.error('❌ 이미지 삭제 실패:', data.message);
                showMessage('error', data.message || '이미지 삭제에 실패했습니다.');
            }
        })
        .catch(error => {
            console.error('🚨 이미지 삭제 오류:', error);
            showMessage('error', '이미지 삭제 중 오류가 발생했습니다: ' + error.message);
        })
        .finally(() => {
            // 버튼 재활성화
            buttons.forEach(btn => btn.disabled = false);
        });
    };
    
    console.log('✅ 전역 함수 설정 완료');
}

// 이벤트 위임 설정 (동적 생성 요소 대응)
function setupEventDelegation() {
    console.log('🎯 이벤트 위임 설정');
    
    // 전체 document에 대한 클릭 이벤트 위임
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        console.log('🖱️ 클릭 이벤트 발생:', {
            tagName: target.tagName,
            className: target.className,
            id: target.id,
            closest_dropdown: !!target.closest('.dropdown'),
            closest_dropdown_toggle: !!target.closest('[data-bs-toggle="dropdown"]'),
            closest_set_main: !!target.closest('.set-main-image-btn'),
            closest_delete: !!target.closest('.delete-image-btn')
        });
        
        // 메인 이미지 설정 버튼 (data 속성 사용)
        if (target.closest('.set-main-image-btn')) {
            event.preventDefault();
            console.log('✅ 메인 이미지 설정 버튼 클릭 감지');
            const button = target.closest('.set-main-image-btn');
            const imageId = button.getAttribute('data-image-id');
            
            console.log('📋 메인 이미지 버튼 정보:', {
                button: button,
                imageId: imageId,
                allAttributes: Array.from(button.attributes).map(attr => `${attr.name}="${attr.value}"`).join(', ')
            });
            
            if (imageId) {
                console.log('🎯 이벤트 위임으로 메인 이미지 설정 호출:', imageId);
                window.setMainImage(parseInt(imageId));
            } else {
                console.error('❌ 메인 이미지 설정: imageId를 찾을 수 없음');
            }
            return;
        }
        
        // 이미지 삭제 버튼 (data 속성 사용)
        if (target.closest('.delete-image-btn')) {
            event.preventDefault();
            console.log('✅ 이미지 삭제 버튼 클릭 감지');
            const button = target.closest('.delete-image-btn');
            const imageId = button.getAttribute('data-image-id');
            
            console.log('📋 삭제 버튼 정보:', {
                button: button,
                imageId: imageId,
                allAttributes: Array.from(button.attributes).map(attr => `${attr.name}="${attr.value}"`).join(', ')
            });
            
            if (imageId) {
                console.log('🎯 이벤트 위임으로 이미지 삭제 호출:', imageId);
                window.deleteImage(parseInt(imageId));
            } else {
                console.error('❌ 이미지 삭제: imageId를 찾을 수 없음');
            }
            return;
        }
        
        // Bootstrap 드롭다운 토글 (상세 디버깅 추가)
        if (target.closest('[data-bs-toggle="dropdown"]')) {
            console.log('🔽 드롭다운 토글 클릭 감지');
            const dropdownToggle = target.closest('[data-bs-toggle="dropdown"]');
            const dropdownMenu = dropdownToggle.nextElementSibling;
            
            console.log('📋 드롭다운 요소 정보:', {
                toggle: dropdownToggle,
                toggleHTML: dropdownToggle.outerHTML,
                menu: dropdownMenu,
                menuHTML: dropdownMenu ? dropdownMenu.outerHTML : 'null',
                menuClasses: dropdownMenu ? Array.from(dropdownMenu.classList) : 'null',
                hasDropdownMenu: dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')
            });
            
            if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                event.preventDefault();
                event.stopPropagation();
                
                console.log('🔄 드롭다운 메뉴 토글 실행');
                
                // 다른 열린 드롭다운 닫기
                const otherMenus = document.querySelectorAll('.dropdown-menu.show');
                console.log('🔍 다른 열린 드롭다운 수:', otherMenus.length);
                otherMenus.forEach(menu => {
                    if (menu !== dropdownMenu) {
                        menu.classList.remove('show');
                        console.log('🚫 다른 드롭다운 닫음:', menu);
                    }
                });
                
                // 현재 드롭다운 토글
                const wasOpen = dropdownMenu.classList.contains('show');
                dropdownMenu.classList.toggle('show');
                const isNowOpen = dropdownMenu.classList.contains('show');
                
                console.log('🔄 드롭다운 상태 변경:', {
                    wasOpen: wasOpen,
                    isNowOpen: isNowOpen,
                    finalClasses: Array.from(dropdownMenu.classList)
                });
                
                // Bootstrap 5 방식으로도 시도
                if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
                    try {
                        const dropdown = bootstrap.Dropdown.getInstance(dropdownToggle) || new bootstrap.Dropdown(dropdownToggle);
                        if (isNowOpen) {
                            dropdown.show();
                        } else {
                            dropdown.hide();
                        }
                        console.log('✅ Bootstrap 드롭다운 API 호출 성공');
                    } catch (error) {
                        console.warn('⚠️ Bootstrap 드롭다운 API 오류:', error);
                    }
                }
            } else {
                console.error('❌ 드롭다운 메뉴를 찾을 수 없음 또는 클래스 누락');
            }
            return;
        }
        
        // 일반 클릭 로그
        if (target.closest('.dropdown')) {
            console.log('📍 드롭다운 영역 내 클릭이지만 특정 버튼이 아님');
        }
    });
    
    // 드롭다운 외부 클릭 시 닫기 (상세 로그 추가)
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown')) {
            const openMenus = document.querySelectorAll('.dropdown-menu.show');
            if (openMenus.length > 0) {
                console.log('🚫 드롭다운 외부 클릭으로 메뉴 닫기:', openMenus.length + '개');
                openMenus.forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        }
    });
    
    console.log('✅ 이벤트 위임 설정 완료 (상세 로그 포함)');
}

// 메시지 표시 함수
function showMessage(type, message) {
    console.log(`📢 메시지 표시 (${type}):`, message);
    
    // 기존 메시지 제거
    const existingMessages = document.querySelectorAll('.facility-message');
    existingMessages.forEach(msg => msg.remove());
    
    // 새 메시지 생성
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show facility-message`;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.minWidth = '300px';
    messageDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
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

// 디버깅용 함수들
window.facilityImageDebug = {
    getFacilityId: () => facilityId,
    testSetMainImage: (imageId) => {
        console.log('🧪 테스트 - 메인 이미지 설정:', imageId);
        window.setMainImage(imageId);
    },
    testDeleteImage: (imageId) => {
        console.log('🧪 테스트 - 이미지 삭제:', imageId);
        window.deleteImage(imageId);
    },
    checkDropdowns: () => {
        const dropdowns = document.querySelectorAll('[data-bs-toggle="dropdown"]');
        console.log('🔍 현재 페이지의 드롭다운 수:', dropdowns.length);
        dropdowns.forEach((dropdown, index) => {
            console.log(`드롭다운 ${index + 1}:`, dropdown);
        });
    }
};

console.log('✅ 시설 이미지 관리 스크립트 로드 완료');
console.log('🧪 디버깅: window.facilityImageDebug 객체를 사용하여 테스트 가능');