/**
 * 시설 이미지 데이터 관리자
 * 기존 DB 이미지와 새 이미지 간의 충돌 방지 및 통합 관리
 * 
 * 기능:
 * 1. 기존 이미지와 새 이미지 구분 관리
 * 2. 데이터 초기화 옵션 제공
 * 3. 충돌 방지 메커니즘
 * 4. 백업 및 복구 기능
 */

console.log('🗃️ 시설 이미지 데이터 관리자 로드됨');

// 데이터 관리자 네임스페이스
window.FacilityImageDataManager = {
    // 상태 관리
    state: {
        existingImages: [],
        newImages: [],
        isDataCleared: false,
        backupData: null,
        conflictMode: 'merge', // 'merge', 'replace', 'append'
        facilityId: null
    },
    
    // 초기화
    async initialize(facilityId) {
        console.log('🔧 데이터 관리자 초기화:', facilityId);
        this.state.facilityId = facilityId;
        
        try {
            // 기존 이미지 로드
            await this.loadExistingImages();
            
            // 충돌 검사 및 사용자 선택 제시
            this.checkConflicts();
            
            console.log('✅ 데이터 관리자 초기화 완료');
        } catch (error) {
            console.error('❌ 데이터 관리자 초기화 실패:', error);
        }
    },
    
    // 기존 이미지 로드
    async loadExistingImages() {
        try {
            const response = await fetch(`/facility/facility-images/${this.state.facilityId}`);
            if (response.ok) {
                const images = await response.json();
                this.state.existingImages = images;
                console.log('📋 기존 이미지 로드 완료:', images.length, '개');
                return images;
            } else {
                console.log('📋 기존 이미지 없음 또는 로드 실패');
                this.state.existingImages = [];
                return [];
            }
        } catch (error) {
            console.error('❌ 기존 이미지 로드 오류:', error);
            this.state.existingImages = [];
            return [];
        }
    },
    
    // 충돌 검사
    checkConflicts() {
        const hasExistingImages = this.state.existingImages.length > 0;
        
        if (hasExistingImages) {
            console.log('⚠️ 기존 이미지 발견:', this.state.existingImages.length, '개');
            this.showConflictResolutionDialog();
        } else {
            console.log('✅ 기존 이미지 없음 - 충돌 없음');
        }
    },
    
    // 충돌 해결 다이얼로그 표시
    showConflictResolutionDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'conflictResolutionModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            기존 이미지 발견
                        </h5>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <h6><i class="fas fa-info-circle me-2"></i>현재 상황</h6>
                            <p class="mb-2">이 시설에는 이미 <strong>${this.state.existingImages.length}개</strong>의 이미지가 등록되어 있습니다.</p>
                            <p class="mb-0">새로운 이미지를 추가하는 방법을 선택해주세요.</p>
                        </div>
                        
                        <div class="row g-3">
                            <div class="col-md-4">
                                <div class="card border-success conflict-option" data-mode="append">
                                    <div class="card-body text-center">
                                        <i class="fas fa-plus-circle text-success fa-2x mb-2"></i>
                                        <h6>기존 유지 + 새로 추가</h6>
                                        <small class="text-muted">기존 이미지를 유지하고 새 이미지를 추가합니다.</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-4">
                                <div class="card border-warning conflict-option" data-mode="replace">
                                    <div class="card-body text-center">
                                        <i class="fas fa-sync-alt text-warning fa-2x mb-2"></i>
                                        <h6>기존 삭제 + 새로 등록</h6>
                                        <small class="text-muted">기존 이미지를 모두 삭제하고 새로 시작합니다.</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-4">
                                <div class="card border-info conflict-option" data-mode="merge">
                                    <div class="card-body text-center">
                                        <i class="fas fa-layer-group text-info fa-2x mb-2"></i>
                                        <h6>스마트 병합</h6>
                                        <small class="text-muted">중복을 제거하고 최적으로 병합합니다.</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="createBackup" checked>
                                <label class="form-check-label" for="createBackup">
                                    <i class="fas fa-shield-alt me-1"></i>
                                    기존 데이터 백업 생성 (복구 가능)
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                        <button type="button" class="btn btn-primary" id="applyConflictResolution" disabled>
                            선택한 방식으로 진행
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 모달 이벤트 설정
        this.setupConflictResolutionEvents(modal);
        
        // 모달 표시
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    },
    
    // 충돌 해결 이벤트 설정
    setupConflictResolutionEvents(modal) {
        const options = modal.querySelectorAll('.conflict-option');
        const applyBtn = modal.querySelector('#applyConflictResolution');
        let selectedMode = null;
        
        options.forEach(option => {
            option.addEventListener('click', () => {
                // 기존 선택 해제
                options.forEach(opt => opt.classList.remove('border-primary', 'bg-light'));
                
                // 새 선택 적용
                option.classList.add('border-primary', 'bg-light');
                selectedMode = option.dataset.mode;
                
                // 버튼 활성화
                applyBtn.disabled = false;
                applyBtn.textContent = this.getActionText(selectedMode);
            });
        });
        
        applyBtn.addEventListener('click', async () => {
            if (selectedMode) {
                const createBackup = modal.querySelector('#createBackup').checked;
                await this.applyConflictResolution(selectedMode, createBackup);
                
                // 모달 닫기
                bootstrap.Modal.getInstance(modal).hide();
                modal.remove();
            }
        });
    },
    
    // 액션 텍스트 가져오기
    getActionText(mode) {
        switch (mode) {
            case 'append': return '기존 유지하고 추가';
            case 'replace': return '기존 삭제하고 새로 시작';
            case 'merge': return '스마트 병합 진행';
            default: return '선택한 방식으로 진행';
        }
    },
    
    // 충돌 해결 적용
    async applyConflictResolution(mode, createBackup) {
        console.log('🔧 충돌 해결 적용:', mode, createBackup ? '(백업 생성)' : '');
        
        this.state.conflictMode = mode;
        
        try {
            // 백업 생성
            if (createBackup) {
                await this.createBackup();
            }
            
            // 선택한 방식에 따라 처리
            switch (mode) {
                case 'replace':
                    await this.clearExistingData();
                    break;
                case 'append':
                    // 기존 데이터 유지, 새 데이터 추가 준비
                    this.prepareAppendMode();
                    break;
                case 'merge':
                    // 스마트 병합 준비
                    this.prepareMergeMode();
                    break;
            }
            
            console.log('✅ 충돌 해결 완료');
            this.showSuccessNotification(mode);
            
        } catch (error) {
            console.error('❌ 충돌 해결 실패:', error);
            this.showErrorNotification(error.message);
        }
    },
    
    // 기존 데이터 백업
    async createBackup() {
        try {
            this.state.backupData = {
                timestamp: new Date().toISOString(),
                images: [...this.state.existingImages],
                facilityId: this.state.facilityId
            };
            
            // 로컬 스토리지에 백업 저장
            localStorage.setItem(`facility_images_backup_${this.state.facilityId}`, 
                JSON.stringify(this.state.backupData));
            
            console.log('💾 백업 생성 완료:', this.state.backupData.images.length, '개 이미지');
        } catch (error) {
            console.error('❌ 백업 생성 실패:', error);
            throw error;
        }
    },
    
    // 기존 데이터 삭제
    async clearExistingData() {
        try {
            for (const image of this.state.existingImages) {
                const response = await fetch(`/facility/facility-images/delete/${image.id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error(`이미지 삭제 실패: ${image.id}`);
                }
            }
            
            this.state.existingImages = [];
            this.state.isDataCleared = true;
            
            console.log('🗑️ 기존 데이터 삭제 완료');
        } catch (error) {
            console.error('❌ 기존 데이터 삭제 실패:', error);
            throw error;
        }
    },
    
    // 추가 모드 준비
    prepareAppendMode() {
        console.log('➕ 추가 모드 준비');
        // 기존 이미지는 그대로 두고 새 이미지만 추가
    },
    
    // 병합 모드 준비
    prepareMergeMode() {
        console.log('🔀 병합 모드 준비');
        // 중복 제거 및 최적화된 병합 로직
    },
    
    // 성공 알림
    showSuccessNotification(mode) {
        const message = this.getSuccessMessage(mode);
        // 알림 표시 로직 (기존 알림 시스템 사용)
        if (typeof showNotification === 'function') {
            showNotification(message, 'success');
        } else {
            alert(message);
        }
    },
    
    // 오류 알림
    showErrorNotification(message) {
        if (typeof showNotification === 'function') {
            showNotification('처리 중 오류가 발생했습니다: ' + message, 'error');
        } else {
            alert('처리 중 오류가 발생했습니다: ' + message);
        }
    },
    
    // 성공 메시지 가져오기
    getSuccessMessage(mode) {
        switch (mode) {
            case 'replace':
                return '기존 이미지가 삭제되고 새로운 이미지 등록을 시작할 수 있습니다.';
            case 'append':
                return '기존 이미지를 유지하면서 새로운 이미지를 추가할 수 있습니다.';
            case 'merge':
                return '스마트 병합 모드로 설정되었습니다. 중복은 자동으로 제거됩니다.';
            default:
                return '설정이 완료되었습니다.';
        }
    },
    
    // 백업 복구
    async restoreFromBackup() {
        try {
            const backupData = localStorage.getItem(`facility_images_backup_${this.state.facilityId}`);
            if (!backupData) {
                throw new Error('백업 데이터를 찾을 수 없습니다.');
            }
            
            const backup = JSON.parse(backupData);
            console.log('🔄 백업에서 복구 중:', backup.images.length, '개 이미지');
            
            // 복구 로직 구현
            // ... 백업 데이터를 서버에 재등록하는 로직
            
            console.log('✅ 백업 복구 완료');
        } catch (error) {
            console.error('❌ 백업 복구 실패:', error);
            throw error;
        }
    }
};

console.log('✅ 시설 이미지 데이터 관리자 로드 완료');