// 회원탈퇴 페이지 JavaScript
// Thymeleaf 인라인 JavaScript를 사용하지 않고 완전히 분리된 JavaScript 파일

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 선택
    const elements = {
        form: document.getElementById('deleteMemberForm'),
        password: document.getElementById('password'),
        confirmName: document.getElementById('confirmName'),
        confirmDelete: document.getElementById('confirmDelete'),
        submitButton: document.getElementById('submitButton'),
        togglePassword: document.getElementById('togglePassword'),
        passwordFeedback: document.getElementById('passwordFeedback'),
        nameValidationFeedback: document.getElementById('nameValidationFeedback')
    };
    
    // 서버에서 전달된 사용자 이름 (전역 변수로 설정)
    const memberName = document.querySelector('.form-text strong').textContent.trim();

    // 디버깅: DOM 요소 확인
    console.log('회원탈퇴 페이지 DOM 요소:', elements);

    // 비밀번호 표시/숨김 토글
    function setupPasswordToggle() {
        if (!elements.password || !elements.togglePassword) {
            console.warn('비밀번호 토글 요소가 없습니다.');
            return;
        }

        elements.togglePassword.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (elements.password.type === 'password') {
                elements.password.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                elements.password.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // 입력 필드 유효성 검사 상태 초기화
    function clearValidationState(inputElement) {
        if (inputElement) {
            inputElement.classList.remove('is-valid', 'is-invalid');
        }
    }

    // 피드백 메시지 설정
    function setFeedback(feedbackElement, message, isValid) {
        if (!feedbackElement) return;
        
        feedbackElement.textContent = message;
        feedbackElement.style.display = message ? 'block' : 'none';
    }

    // 입력 필드 유효성 상태 설정
    function setValidationState(inputElement, isValid) {
        if (!inputElement) return;
        
        if (isValid) {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
        } else {
            inputElement.classList.remove('is-valid');
            inputElement.classList.add('is-invalid');
        }
    }

    // 비밀번호 검증 (기본 입력 여부만 확인, 실제 비밀번호 일치는 서버에서 처리)
    function validatePassword() {
        const value = elements.password.value.trim();
        const isValid = value.length >= 8; // 최소 8자리 이상 입력되어야 함
        
        if (value === '') {
            clearValidationState(elements.password);
            setFeedback(elements.passwordFeedback, '', true);
            return false;
        }
        
        setValidationState(elements.password, isValid);
        if (!isValid) {
            setFeedback(elements.passwordFeedback, '비밀번호는 최소 8자 이상 입력해주세요.', false);
        } else {
            setFeedback(elements.passwordFeedback, '비밀번호 형식이 유효합니다. (실제 일치 여부는 제출 시 확인)', true);
        }
        
        return isValid;
    }
    
    // 이름 검증
    function validateName() {
        const value = elements.confirmName.value.trim();
        const isValid = value === memberName;
        
        if (value === '') {
            clearValidationState(elements.confirmName);
            setFeedback(elements.nameValidationFeedback, '', true);
            return false;
        }
        
        setValidationState(elements.confirmName, isValid);
        if (!isValid) {
            setFeedback(elements.nameValidationFeedback, `이름이 일치하지 않습니다. '입력값: ${value}' ≠ '등록된 이름: ${memberName}'`, false);
        } else {
            setFeedback(elements.nameValidationFeedback, '이름이 확인되었습니다.', true);
        }
        
        return isValid;
    }

    // 동의 체크박스 검증
    function validateConfirmDelete() {
        return elements.confirmDelete && elements.confirmDelete.checked;
    }

    // 제출 버튼 활성화/비활성화
    function updateSubmitButton() {
        const isPasswordValid = validatePassword();
        const isNameValid = validateName();
        const isConfirmChecked = validateConfirmDelete();
        
        const isFormValid = isPasswordValid && isNameValid && isConfirmChecked;
        
        if (elements.submitButton) {
            elements.submitButton.disabled = !isFormValid;
        }
        
        return isFormValid;
    }

    // 탈퇴 확인 다이얼로그
    function showConfirmDialog() {
        const confirmMessage = 
            `최종 확인: ${memberName}님의 회원탈퇴를 진행하시겠습니까?\n\n` +
            "⚠️ 마지막 경고:\n" +
            "• 모든 개인정보가 영구 삭제됩니다\n" +
            "• 동일한 아이디로 재가입이 불가능합니다\n" +
            "• 탈퇴 후에는 절대 복구할 수 없습니다\n\n" +
            "지금 탈퇴하시겠습니까?";
        
        return confirm(confirmMessage);
    }

    // 이벤트 리스너 등록
    function setupEventListeners() {
        // 비밀번호 입력 이벤트
        if (elements.password) {
            elements.password.addEventListener('input', function() {
                updateSubmitButton();
            });
            
            elements.password.addEventListener('blur', function() {
                validatePassword();
                updateSubmitButton();
            });
            
            elements.password.addEventListener('focus', function() {
                clearValidationState(this);
                setFeedback(elements.passwordFeedback, '', true);
            });
        }

        // 이름 입력 이벤트
        if (elements.confirmName) {
            elements.confirmName.addEventListener('input', function() {
                updateSubmitButton();
            });
            
            elements.confirmName.addEventListener('blur', function() {
                validateName();
                updateSubmitButton();
            });
            
            elements.confirmName.addEventListener('focus', function() {
                clearValidationState(this);
                setFeedback(elements.nameValidationFeedback, '', true);
            });
        }
        
        // 동의 체크박스 이벤트
        if (elements.confirmDelete) {
            elements.confirmDelete.addEventListener('change', function() {
                updateSubmitButton();
                
                // 체크박스 유효성 상태 업데이트
                if (this.checked) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                }
            });
        }

        // 폼 제출 이벤트
        if (elements.form) {
            elements.form.addEventListener('submit', function(event) {
                event.preventDefault(); // 기본 제출 방지
                
                // 최종 유효성 검사
                const isFormValid = updateSubmitButton();
                
                if (!isFormValid) {
                    console.log('폼 유효성 검사 실패');
                    
                    // 첫 번째 오류 필드에 포커스
                    if (!validatePassword() && elements.password) {
                        elements.password.focus();
                        alert('비밀번호를 올바르게 입력해주세요.');
                    } else if (!validateName() && elements.confirmName) {
                        elements.confirmName.focus();
                        alert(`이름을 정확히 입력해주세요. 등록된 이름: '${memberName}'`);
                    } else if (!validateConfirmDelete() && elements.confirmDelete) {
                        elements.confirmDelete.focus();
                        elements.confirmDelete.classList.add('is-invalid');
                        alert('탈퇴 동의 체크박스를 선택해주세요.');
                    }
                    
                    return false;
                }
                
                // 최종 확인 다이얼로그
                if (!showConfirmDialog()) {
                    console.log('사용자가 탈퇴를 취소했습니다.');
                    return false;
                }
                
                // 폼 제출 중 버튼 비활성화
                if (elements.submitButton) {
                    elements.submitButton.disabled = true;
                    elements.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>탈퇴 처리 중...';
                }
                
                console.log('회원탈퇴 폼 제출');
                
                // 실제 폼 제출
                this.submit();
                return true;
            });
        }
    }

    // 페이지 로드 시 경고 메시지
    function showInitialWarning() {
        // 페이지 진입 시 한 번만 경고
        if (!sessionStorage.getItem('deletePageWarningShown')) {
            setTimeout(() => {
                alert('⚠️ 회원탈퇴 페이지입니다.\n신중히 결정해주세요.');
                sessionStorage.setItem('deletePageWarningShown', 'true');
            }, 500);
        }
    }

    // 페이지 나가기 전 경고
    function setupBeforeUnloadWarning() {
        let formChanged = false;
        
        // 폼 변경 감지
        if (elements.password) {
            elements.password.addEventListener('input', () => {
                formChanged = true;
            });
        }
        
        if (elements.confirmName) {
            elements.confirmName.addEventListener('input', () => {
                formChanged = true;
            });
        }
        
        if (elements.confirmDelete) {
            elements.confirmDelete.addEventListener('change', () => {
                formChanged = true;
            });
        }
        
        // 페이지 나가기 전 경고
        window.addEventListener('beforeunload', function(event) {
            if (formChanged) {
                event.preventDefault();
                event.returnValue = '입력된 내용이 있습니다. 정말로 페이지를 나가시겠습니까?';
                return event.returnValue;
            }
        });
    }

    // 초기화 함수
    function init() {
        setupPasswordToggle();
        setupEventListeners();
        updateSubmitButton(); // 초기 상태 설정
        showInitialWarning();
        setupBeforeUnloadWarning();
        
        console.log('회원탈퇴 페이지 JavaScript 초기화 완료');
    }

    // 초기화 실행
    init();
});