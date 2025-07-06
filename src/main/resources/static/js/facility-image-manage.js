/**
 * 시설 이미지 관리 전용 JavaScript
 * Thymeleaf 인라인 충돌 방지를 위해 별도 파일로 분리
 */

console.log('🛠️ 시설 이미지 관리 스크립트 로드됨');

// 전역 변수 (네임스페이스 사용으로 충돌 방지)
window.facilityImageManage = window.facilityImageManage || {};
window.facilityImageManage.facilityId = null;

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 시설 이미지 관리 초기화 시작');
    
    // URL에서 facilityId 추출 (네임스페이스 사용)
    const pathParts = window.location.pathname.split('/');
    window.facilityImageManage.facilityId = pathParts[pathParts.length - 1];
    console.log('🏢 시설 ID:', window.facilityImageManage.facilityId);
    
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
        console.log('🔍 함수 호출 스택:', new Error().stack);
        
        if (!imageId) {
            console.error('❌ imageId가 제공되지 않았습니다');
            alert('이미지 ID가 잘못되었습니다.');
            return;
        }
        
        if (!window.facilityImageManage.facilityId) {
            console.error('❌ facilityId가 설정되지 않았습니다');
            alert('시설 ID를 찾을 수 없습니다.');
            return;
        }
        
        console.log('📋 설정 파라미터:', {
            imageId: imageId,
            facilityId: window.facilityImageManage.facilityId,
            imageIdType: typeof imageId,
            facilityIdType: typeof window.facilityImageManage.facilityId
        });
        
        if (!confirm('이 이미지를 메인 이미지로 설정하시겠습니까?')) {
            console.log('🚫 사용자가 메인 이미지 설정을 취소함');
            return;
        }
        
        // 버튼 비활성화 (중복 클릭 방지)
        const buttons = document.querySelectorAll('.set-main-image-btn');
        buttons.forEach(btn => btn.disabled = true);
        
        fetch(`/api/facility/images/${imageId}/set-main`, {
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
        console.log('🔍 함수 호출 스택:', new Error().stack);
        
        if (!imageId) {
            console.error('❌ imageId가 제공되지 않았습니다');
            alert('이미지 ID가 잘못되었습니다.');
            return;
        }
        
        if (!window.facilityImageManage.facilityId) {
            console.error('❌ facilityId가 설정되지 않았습니다');
            alert('시설 ID를 찾을 수 없습니다.');
            return;
        }
        
        console.log('📋 삭제 파라미터:', {
            imageId: imageId,
            facilityId: window.facilityImageManage.facilityId,
            imageIdType: typeof imageId,
            facilityIdType: typeof window.facilityImageManage.facilityId
        });
        
        if (!confirm('이 이미지를 삭제하시겠습니까?\n삭제된 이미지는 복구할 수 없습니다.')) {
            console.log('🚫 사용자가 이미지 삭제를 취소함');
            return;
        }
        
        // 버튼 비활성화 (중복 클릭 방지)
        const buttons = document.querySelectorAll('.delete-image-btn');
        buttons.forEach(btn => btn.disabled = true);
        
        fetch(`/api/facility/images/${imageId}`, {
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
        
        // Bootstrap 드롭다운 토글 (간소화된 방식)
        if (target.closest('[data-bs-toggle="dropdown"]')) {
            console.log('🔽 드롭다운 토글 클릭 감지');
            const dropdownToggle = target.closest('[data-bs-toggle="dropdown"]');
            
            event.preventDefault();
            event.stopPropagation();
            
            // Bootstrap 5 Dropdown API 사용
            if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
                try {
                    let dropdown = bootstrap.Dropdown.getInstance(dropdownToggle);
                    if (!dropdown) {
                        dropdown = new bootstrap.Dropdown(dropdownToggle);
                    }
                    dropdown.toggle();
                    console.log('✅ Bootstrap 드롭다운 토글 성공');
                } catch (error) {
                    console.error('❌ Bootstrap 드롭다운 오류:', error);
                    
                    // 폴백: 수동 토글
                    const dropdownMenu = dropdownToggle.nextElementSibling;
                    if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                        dropdownMenu.classList.toggle('show');
                        dropdownToggle.classList.toggle('show');
                        console.log('🔄 수동 드롭다운 토글 완료');
                    }
                }
            } else {
                console.warn('⚠️ Bootstrap이 로드되지 않음 - 수동 토글');
                const dropdownMenu = dropdownToggle.nextElementSibling;
                if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                    // 다른 열린 드롭다운 닫기
                    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                        if (menu !== dropdownMenu) {
                            menu.classList.remove('show');
                        }
                    });
                    document.querySelectorAll('[data-bs-toggle="dropdown"].show').forEach(toggle => {
                        if (toggle !== dropdownToggle) {
                            toggle.classList.remove('show');
                        }
                    });
                    
                    // 현재 드롭다운 토글
                    dropdownMenu.classList.toggle('show');
                    dropdownToggle.classList.toggle('show');
                    console.log('🔄 수동 드롭다운 토글 완료');
                }
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

// 디버깅용 함수들 (확장)
window.facilityImageDebug = {
    getFacilityId: () => window.facilityImageManage.facilityId,
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
            const menu = dropdown.nextElementSibling;
            console.log(`드롭다운 ${index + 1}:`, {
                toggle: dropdown,
                menu: menu,
                toggleClasses: Array.from(dropdown.classList),
                menuClasses: menu ? Array.from(menu.classList) : 'null',
                hasBootstrap: typeof bootstrap !== 'undefined',
                bootstrapInstance: typeof bootstrap !== 'undefined' ? bootstrap.Dropdown.getInstance(dropdown) : 'null'
            });
        });
    },
    checkManageSection: () => {
        const manageSection = document.getElementById('manageSection');
        const manageGrid = document.getElementById('manageImagesGrid');
        console.log('🔍 관리 섹션 상태:', {
            manageSection: !!manageSection,
            manageSectionDisplay: manageSection ? manageSection.style.display : 'null',
            manageGrid: !!manageGrid,
            manageGridHTML: manageGrid ? manageGrid.innerHTML.length + ' chars' : 'null',
            imageCards: document.querySelectorAll('[data-image-id]').length,
            dropdownButtons: document.querySelectorAll('.set-main-image-btn, .delete-image-btn').length
        });
    },
    forceDropdownOpen: (index = 0) => {
        const dropdowns = document.querySelectorAll('[data-bs-toggle="dropdown"]');
        if (dropdowns[index]) {
            const dropdown = dropdowns[index];
            const menu = dropdown.nextElementSibling;
            if (menu) {
                menu.classList.add('show');
                console.log('🔧 강제로 드롭다운 열기:', index);
            }
        }
    },
    simulateClick: (selector) => {
        const element = document.querySelector(selector);
        if (element) {
            console.log('🖱️ 클릭 시뮬레이션:', selector);
            element.click();
        } else {
            console.error('❌ 요소를 찾을 수 없음:', selector);
        }
    },
    checkAllEvents: () => {
        console.log('🔍 이벤트 리스너 상태 점검');
        const testElement = document.createElement('div');
        testElement.className = 'test-dropdown';
        testElement.innerHTML = `
            <button class="btn btn-sm dropdown-toggle" data-bs-toggle="dropdown">테스트</button>
            <ul class="dropdown-menu">
                <li><button class="dropdown-item set-main-image-btn" data-image-id="999">테스트 메인</button></li>
                <li><button class="dropdown-item delete-image-btn" data-image-id="999">테스트 삭제</button></li>
            </ul>
        `;
        document.body.appendChild(testElement);
        
        setTimeout(() => {
            console.log('🧪 테스트 요소 추가됨, 클릭해보세요.');
        }, 100);
    },
    
    checkHTMLStructure: () => {
        console.log('🔍 현재 HTML 구조 상세 분석');
        
        const manageGrid = document.getElementById('manageImagesGrid');
        if (!manageGrid) {
            console.error('❌ manageImagesGrid를 찾을 수 없음');
            return;
        }
        
        // 전체 카드 수 확인
        const allCards = manageGrid.querySelectorAll('.card[data-image-id]');
        console.log(`📊 전체 카드 수: ${allCards.length}개`);
        
        // 이미지 ID별 그룹화
        const imageGroups = {};
        allCards.forEach((card, index) => {
            const imageId = card.getAttribute('data-image-id');
            if (!imageGroups[imageId]) {
                imageGroups[imageId] = [];
            }
            imageGroups[imageId].push({
                index: index + 1,
                card: card,
                hasSetMainBtn: !!card.querySelector('.set-main-image-btn'),
                hasDeleteBtn: !!card.querySelector('.delete-image-btn'),
                setMainBtnId: card.querySelector('.set-main-image-btn')?.getAttribute('data-image-id') || 'null',
                deleteBtnId: card.querySelector('.delete-image-btn')?.getAttribute('data-image-id') || 'null'
            });
        });
        
        // 결과 출력
        console.log('📋 이미지 ID별 카드 분석:');
        Object.keys(imageGroups).forEach(imageId => {
            const group = imageGroups[imageId];
            console.log(`이미지 ID ${imageId}: ${group.length}개 카드`);
            group.forEach(item => {
                console.log(`  - 카드 ${item.index}: 메인버튼=${item.hasSetMainBtn}, 삭제버튼=${item.hasDeleteBtn}, 메인ID=${item.setMainBtnId}, 삭제ID=${item.deleteBtnId}`);
            });
        });
        
        // 중복 카드 감지
        const duplicateIds = Object.keys(imageGroups).filter(id => imageGroups[id].length > 1);
        if (duplicateIds.length > 0) {
            console.warn(`⚠️ 중복 카드 발견: ${duplicateIds.join(', ')}`);
        } else {
            console.log('✅ 중복 카드 없음');
        }
        
        return {
            totalCards: allCards.length,
            uniqueImages: Object.keys(imageGroups).length,
            duplicateIds: duplicateIds,
            imageGroups: imageGroups
        };
    },
    
    findNullButtons: () => {
        console.log('🔍 null ID 버튼 찾기');
        
        const setMainBtns = document.querySelectorAll('.set-main-image-btn');
        const deleteBtns = document.querySelectorAll('.delete-image-btn');
        
        console.log(`📊 메인 설정 버튼: ${setMainBtns.length}개`);
        console.log(`📊 삭제 버튼: ${deleteBtns.length}개`);
        
        const nullSetMainBtns = Array.from(setMainBtns).filter(btn => !btn.getAttribute('data-image-id') || btn.getAttribute('data-image-id') === 'null');
        const nullDeleteBtns = Array.from(deleteBtns).filter(btn => !btn.getAttribute('data-image-id') || btn.getAttribute('data-image-id') === 'null');
        
        console.log(`⚠️ null ID 메인 버튼: ${nullSetMainBtns.length}개`);
        console.log(`⚠️ null ID 삭제 버튼: ${nullDeleteBtns.length}개`);
        
        nullSetMainBtns.forEach((btn, index) => {
            console.log(`메인 버튼 ${index + 1}:`, btn.outerHTML.substring(0, 100) + '...');
        });
        
        nullDeleteBtns.forEach((btn, index) => {
            console.log(`삭제 버튼 ${index + 1}:`, btn.outerHTML.substring(0, 100) + '...');
        });
        
        return {
            totalSetMainBtns: setMainBtns.length,
            totalDeleteBtns: deleteBtns.length,
            nullSetMainBtns: nullSetMainBtns.length,
            nullDeleteBtns: nullDeleteBtns.length
        };
    }
};

// 페이지 완전 로드 후 상태 점검
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🔍 페이지 로드 완료 후 상태 점검:');
        
        // 기본 요소 확인
        const manageSection = document.getElementById('manageSection');
        const manageGrid = document.getElementById('manageImagesGrid');
        
        console.log('📋 DOM 요소 상태:', {
            manageSection: !!manageSection,
            manageSectionVisible: manageSection ? manageSection.style.display !== 'none' : false,
            manageGrid: !!manageGrid,
            manageGridContent: manageGrid ? manageGrid.innerHTML.length : 0
        });
        
        // 드롭다운 버튼 확인
        const dropdownToggles = document.querySelectorAll('[data-bs-toggle="dropdown"]');
        const setMainButtons = document.querySelectorAll('.set-main-image-btn');
        const deleteButtons = document.querySelectorAll('.delete-image-btn');
        
        console.log('📋 버튼 요소 상태:', {
            dropdownToggles: dropdownToggles.length,
            setMainButtons: setMainButtons.length,
            deleteButtons: deleteButtons.length
        });
        
        // 각 드롭다운의 상태 확인
        dropdownToggles.forEach((toggle, index) => {
            const menu = toggle.nextElementSibling;
            const hasMenu = menu && menu.classList.contains('dropdown-menu');
            
            console.log(`드롭다운 ${index + 1} 상태:`, {
                toggle: toggle,
                hasMenu: hasMenu,
                menuHTML: hasMenu ? menu.outerHTML.substring(0, 200) + '...' : 'null',
                bootstrapInstance: typeof bootstrap !== 'undefined' ? bootstrap.Dropdown.getInstance(toggle) : 'null'
            });
        });
        
        // 전역 함수 확인
        console.log('📋 전역 함수 상태:', {
            setMainImage: typeof window.setMainImage,
            deleteImage: typeof window.deleteImage,
            facilityImageDebug: typeof window.facilityImageDebug
        });
        
        console.log('✅ 상태 점검 완료');
    }, 1000);
});

console.log('✅ 시설 이미지 관리 스크립트 로드 완료');
console.log('🧪 디버깅: window.facilityImageDebug 객체를 사용하여 테스트 가능');
console.log('📖 사용 가능한 디버깅 명령:');
console.log('  - facilityImageDebug.checkDropdowns() : 드롭다운 상태 확인');
console.log('  - facilityImageDebug.checkManageSection() : 관리 섹션 상태 확인');
console.log('  - facilityImageDebug.forceDropdownOpen(0) : 첫 번째 드롭다운 강제 열기');
console.log('  - facilityImageDebug.simulateClick("[data-bs-toggle=dropdown]") : 클릭 시뮬레이션');
console.log('  - facilityImageDebug.checkAllEvents() : 테스트 요소 생성');
console.log('  - facilityImageDebug.checkHTMLStructure() : HTML 구조 상세 분석');
console.log('  - facilityImageDebug.findNullButtons() : null ID 버튼 찾기');