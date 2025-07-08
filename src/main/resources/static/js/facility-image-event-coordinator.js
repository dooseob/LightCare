/**
 * 시설 이미지 이벤트 코디네이터
 * 파일 선택 중복 실행 완전 방지 및 이벤트 조정
 */

console.log('🎭 시설 이미지 이벤트 코디네이터 로드됨');

// 이벤트 코디네이터 네임스페이스
window.FacilityImageEventCoordinator = {
    // 상태 관리
    state: {
        fileSelectionActive: false,
        lastFileSelectionTime: 0,
        eventQueue: [],
        blockedEvents: [],
        debugMode: true
    },
    
    // 설정
    config: {
        debounceTime: 1000, // 1초 디바운스
        maxQueueSize: 10,
        cleanupInterval: 5000 // 5초마다 정리
    },
    
    // 초기화
    initialize() {
        console.log('🎭 이벤트 코디네이터 초기화');
        
        // 전역 이벤트 가로채기
        this.interceptGlobalEvents();
        
        // 정기 정리 작업
        this.startCleanupTimer();
        
        // 디버깅 인터페이스
        if (this.state.debugMode) {
            this.setupDebugInterface();
        }
        
        console.log('✅ 이벤트 코디네이터 초기화 완료');
    },
    
    // 파일 선택 이벤트 조정
    coordinateFileSelection(source, callback) {
        const now = Date.now();
        const timeSinceLastSelection = now - this.state.lastFileSelectionTime;
        
        this.log(`📁 파일 선택 요청: ${source}`, {
            active: this.state.fileSelectionActive,
            timeSince: timeSinceLastSelection,
            debounceTime: this.config.debounceTime
        });
        
        // 이미 활성화되어 있는 경우
        if (this.state.fileSelectionActive) {
            this.log('⛔ 파일 선택이 이미 활성화됨 - 요청 차단', { source });
            this.state.blockedEvents.push({
                source,
                timestamp: now,
                reason: 'already_active'
            });
            return false;
        }
        
        // 너무 빠른 연속 요청 차단
        if (timeSinceLastSelection < this.config.debounceTime) {
            this.log('⛔ 너무 빠른 연속 요청 - 디바운스 차단', { 
                source, 
                timeSince: timeSinceLastSelection,
                required: this.config.debounceTime
            });
            this.state.blockedEvents.push({
                source,
                timestamp: now,
                reason: 'debounce'
            });
            return false;
        }
        
        // 파일 선택 활성화
        this.state.fileSelectionActive = true;
        this.state.lastFileSelectionTime = now;
        
        this.log('✅ 파일 선택 허용', { source });
        
        // 콜백 실행
        try {
            const result = callback();
            
            // 비동기 처리 지원
            if (result && typeof result.then === 'function') {
                result.finally(() => {
                    this.releaseFileSelection(source);
                });
            } else {
                // 동기 처리인 경우 지연 후 해제
                setTimeout(() => {
                    this.releaseFileSelection(source);
                }, 100);
            }
            
            return true;
        } catch (error) {
            this.log('❌ 파일 선택 콜백 오류', { source, error });
            this.releaseFileSelection(source);
            return false;
        }
    },
    
    // 파일 선택 해제
    releaseFileSelection(source) {
        this.log('🔓 파일 선택 해제', { source });
        this.state.fileSelectionActive = false;
        
        // 대기 중인 이벤트 처리
        this.processQueuedEvents();
    },
    
    // 전역 이벤트 가로채기
    interceptGlobalEvents() {
        console.log('🕸️ 전역 이벤트 가로채기 설정');
        
        // input[type="file"] 이벤트 가로채기
        document.addEventListener('click', (event) => {
            const target = event.target;
            
            // 파일 입력 클릭 감지
            if (target.type === 'file' && target.id === 'imageInput') {
                this.handleFileInputClick(event, target);
            }
            
            // 파일 선택 트리거 버튼 감지
            if (target.id === 'imageLoadBtn' || 
                target.id === 'fileSelectOption' ||
                target.getAttribute('data-file-trigger')) {
                this.handleFileTriggerClick(event, target);
            }
        }, true); // 캡처 단계에서 처리
        
        // change 이벤트 가로채기
        document.addEventListener('change', (event) => {
            const target = event.target;
            
            if (target.type === 'file' && target.id === 'imageInput') {
                this.handleFileInputChange(event, target);
            }
        }, true);
    },
    
    // 파일 입력 클릭 처리
    handleFileInputClick(event, target) {
        this.log('📁 파일 입력 클릭 감지', { targetId: target.id });
        
        // 사용자 직접 클릭이나 신뢰할 수 있는 이벤트는 항상 허용
        if (event.isTrusted || event.target === target) {
            this.log('✅ 사용자 직접 클릭 또는 신뢰할 수 있는 이벤트 - 허용');
            return true;
        }
        
        // 파일 선택이 활성화되어 있지 않은 경우에도 허용
        if (!this.state.fileSelectionActive) {
            this.log('✅ 파일 선택이 활성화되지 않음 - 허용');
            return true;
        }
        
        // 프로그래밍 방식 클릭의 경우에만 제한적으로 차단
        this.log('⚠️ 프로그래밍 중복 클릭 감지 - 짧은 지연 후 재시도');
        // 완전 차단하지 않고 짧은 지연 후 허용
        setTimeout(() => {
            if (!this.state.fileSelectionActive) {
                target.click();
            }
        }, 50);
        return false;
    },
    
    // 파일 트리거 버튼 클릭 처리
    handleFileTriggerClick(event, target) {
        this.log('🔘 파일 트리거 버튼 클릭', { targetId: target.id });
        
        // 사용자 직접 클릭은 항상 허용하되 중복 방지만 수행
        if (event.isTrusted) {
            this.log('✅ 사용자 직접 트리거 클릭 - 기본 허용');
            
            // 중복 클릭 방지를 위한 최소한의 코디네이션
            if (!this.state.fileSelectionActive) {
                this.state.fileSelectionActive = true;
                this.state.lastFileSelectionTime = Date.now();
                
                setTimeout(() => {
                    const fileInput = document.getElementById('imageInput');
                    if (fileInput) {
                        fileInput.click();
                    }
                }, 10);
                
                // 짧은 시간 후 상태 해제
                setTimeout(() => {
                    this.releaseFileSelection(`button:${target.id}`);
                }, 100);
                
                return true;
            } else {
                this.log('⚠️ 파일 선택이 이미 진행 중 - 잠시 대기');
                return false;
            }
        }
        
        // 프로그래밍 방식 클릭의 경우 기존 로직 사용
        const allowed = this.coordinateFileSelection(`button:${target.id}`, () => {
            return true;
        });
        
        if (allowed) {
            setTimeout(() => {
                const fileInput = document.getElementById('imageInput');
                if (fileInput) {
                    fileInput.click();
                }
            }, 10);
        }
        
        return allowed;
    },
    
    // 파일 입력 변경 처리
    handleFileInputChange(event, target) {
        this.log('📂 파일 입력 변경 감지', { 
            targetId: target.id,
            fileCount: target.files.length
        });
        
        // 파일이 선택되었을 때 다른 모듈들에게 알림
        if (target.files.length > 0) {
            this.log('📢 파일 선택 완료 - 다른 모듈들에게 알림 발송', {
                fileCount: target.files.length,
                targetId: target.id
            });
            
            // 커스텀 이벤트 발생 - 다른 모듈들이 구독할 수 있도록
            const filesSelectedEvent = new CustomEvent('facilityImageFilesSelected', {
                detail: {
                    files: target.files,
                    source: target.id === 'folderInput' ? 'folder' : 'file',
                    targetElement: target,
                    timestamp: Date.now()
                }
            });
            
            document.dispatchEvent(filesSelectedEvent);
            this.log('✅ 파일 선택 이벤트 발송 완료');
        }
        
        // 파일 선택 완료 시 상태 해제
        setTimeout(() => {
            this.releaseFileSelection('file-input-change');
        }, 200);
    },
    
    // 대기열 이벤트 처리
    processQueuedEvents() {
        if (this.state.eventQueue.length > 0) {
            this.log('📋 대기열 이벤트 처리', { queueSize: this.state.eventQueue.length });
            
            const nextEvent = this.state.eventQueue.shift();
            if (nextEvent) {
                setTimeout(() => {
                    nextEvent.callback();
                }, 100);
            }
        }
    },
    
    // 이벤트 대기열에 추가
    queueEvent(source, callback) {
        if (this.state.eventQueue.length >= this.config.maxQueueSize) {
            this.log('⚠️ 대기열 용량 초과 - 이벤트 무시', { source });
            return false;
        }
        
        this.state.eventQueue.push({
            source,
            callback,
            timestamp: Date.now()
        });
        
        this.log('📝 이벤트 대기열 추가', { source, queueSize: this.state.eventQueue.length });
        return true;
    },
    
    // 정리 타이머 시작
    startCleanupTimer() {
        setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
    },
    
    // 정리 작업
    cleanup() {
        const now = Date.now();
        const oldEventsThreshold = now - (this.config.cleanupInterval * 2);
        
        // 오래된 차단 이벤트 제거
        const oldBlockedCount = this.state.blockedEvents.length;
        this.state.blockedEvents = this.state.blockedEvents.filter(
            event => event.timestamp > oldEventsThreshold
        );
        
        // 오래된 대기열 이벤트 제거
        const oldQueueCount = this.state.eventQueue.length;
        this.state.eventQueue = this.state.eventQueue.filter(
            event => event.timestamp > oldEventsThreshold
        );
        
        if (oldBlockedCount !== this.state.blockedEvents.length || 
            oldQueueCount !== this.state.eventQueue.length) {
            this.log('🧹 정리 완료', {
                blockedRemoved: oldBlockedCount - this.state.blockedEvents.length,
                queueRemoved: oldQueueCount - this.state.eventQueue.length
            });
        }
    },
    
    // 디버깅 인터페이스 설정
    setupDebugInterface() {
        window.facilityImageEventDebug = {
            getState: () => this.state,
            getStats: () => ({
                blockedEventsCount: this.state.blockedEvents.length,
                queuedEventsCount: this.state.eventQueue.length,
                isFileSelectionActive: this.state.fileSelectionActive,
                lastSelectionTime: new Date(this.state.lastFileSelectionTime).toLocaleTimeString()
            }),
            clearBlocked: () => {
                this.state.blockedEvents = [];
                console.log('🧹 차단된 이벤트 기록 초기화됨');
            },
            clearQueue: () => {
                this.state.eventQueue = [];
                console.log('🧹 이벤트 대기열 초기화됨');
            },
            forceRelease: () => {
                this.state.fileSelectionActive = false;
                console.log('🔓 파일 선택 강제 해제됨');
            },
            testFileSelection: () => {
                return this.coordinateFileSelection('debug-test', () => {
                    console.log('🧪 테스트 파일 선택 실행됨');
                });
            }
        };
        
        console.log('🧪 디버깅 인터페이스 설정 완료: window.facilityImageEventDebug');
    },
    
    // 로깅
    log(message, data = null) {
        if (!this.state.debugMode) return;
        
        const timestamp = new Date().toLocaleTimeString();
        console.log(`🎭 [EventCoordinator] [${timestamp}] ${message}`, data || '');
    }
};

// 자동 초기화
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.FacilityImageEventCoordinator.initialize();
    }, 50);
});

console.log('✅ 시설 이미지 이벤트 코디네이터 로드 완료');