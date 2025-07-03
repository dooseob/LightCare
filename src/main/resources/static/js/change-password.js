// 비밀번호 변경 페이지 JavaScript
// Thymeleaf 인라인 JavaScript를 사용하지 않고 완전히 분리된 JavaScript 파일

document.addEventListener('DOMContentLoaded', function() {
    // 상수 정의
    const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
    const MIN_PASSWORD_LENGTH = 8;
    
    // DOM 요소 선택
    const elements = {
        form: document.getElementById('changePasswordForm'),
        currentPassword: document.getElementById('currentPassword'),
        newPassword: document.getElementById('newPassword'),
        confirmPassword: document.getElementById('confirmPassword'),
        submitButton: document.getElementById('submitButton'),
        toggleButtons: {
            current: document.getElementById('toggleCurrentPassword'),
            new: document.getElementById('toggleNewPassword'),
            confirm: document.getElementById('toggleConfirmPassword')
        },
        feedbacks: {
            current: document.getElementById('currentPasswordFeedback'),
            new: document.getElementById('newPasswordFeedback'),
            confirm: document.getElementById('confirmPasswordFeedback')
        }
    };

    // 디버깅: DOM 요소 확인
    console.log('비밀번호 변경 페이지 DOM 요소:', elements);

    // 비밀번호 표시/숨김 토글 함수
    function setupPasswordToggle(inputElement, toggleButton) {
        if (!inputElement || !toggleButton) {
            console.warn('비밀번호 토글 요소가 없습니다.');
            return;
        }

        toggleButton.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (inputElement.type === 'password') {
                inputElement.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                inputElement.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // 모든 비밀번호 토글 설정
    setupPasswordToggle(elements.currentPassword, elements.toggleButtons.current);
    setupPasswordToggle(elements.newPassword, elements.toggleButtons.new);
    setupPasswordToggle(elements.confirmPassword, elements.toggleButtons.confirm);

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
        if (isValid) {
            feedbackElement.classList.remove('invalid-feedback');
            feedbackElement.classList.add('valid-feedback');
        } else {
            feedbackElement.classList.remove('valid-feedback');
            feedbackElement.classList.add('invalid-feedback');
        }
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

    // 현재 비밀번호 검증
    function validateCurrentPassword() {
        const value = elements.currentPassword.value.trim();
        const isValid = value.length >= MIN_PASSWORD_LENGTH;
        
        if (value === '') {
            clearValidationState(elements.currentPassword);
            setFeedback(elements.feedbacks.current, '', true);
            return false;
        }
        
        setValidationState(elements.currentPassword, isValid);
        if (!isValid) {
            setFeedback(elements.feedbacks.current, '현재 비밀번호를 정확히 입력해주세요.', false);
        } else {
            setFeedback(elements.feedbacks.current, '', true);
        }
        
        return isValid;
    }

    // 새 비밀번호 검증
    function validateNewPassword() {
        const value = elements.newPassword.value;
        const isValid = PASSWORD_PATTERN.test(value);
        
        if (value === '') {
            clearValidationState(elements.newPassword);
            setFeedback(elements.feedbacks.new, '', true);
            return false;
        }
        
        setValidationState(elements.newPassword, isValid);
        if (!isValid) {
            setFeedback(elements.feedbacks.new, '8-20자의 영문, 숫자, 특수문자를 1개 이상 포함해주세요.', false);
        } else {
            // 현재 비밀번호와 같은지 확인
            if (value === elements.currentPassword.value) {
                setValidationState(elements.newPassword, false);
                setFeedback(elements.feedbacks.new, '현재 비밀번호와 다른 비밀번호를 입력해주세요.', false);
                return false;
            }
            setFeedback(elements.feedbacks.new, '사용 가능한 비밀번호입니다.', true);
        }
        
        return isValid && value !== elements.currentPassword.value;
    }

    // 비밀번호 확인 검증
    function validateConfirmPassword() {
        const newPasswordValue = elements.newPassword.value;
        const confirmValue = elements.confirmPassword.value;
        const isValid = confirmValue !== '' && newPasswordValue === confirmValue;
        
        if (confirmValue === '') {
            clearValidationState(elements.confirmPassword);
            setFeedback(elements.feedbacks.confirm, '', true);
            return false;
        }
        
        setValidationState(elements.confirmPassword, isValid);
        if (!isValid) {
            setFeedback(elements.feedbacks.confirm, '새 비밀번호와 일치하지 않습니다.', false);
        } else {
            setFeedback(elements.feedbacks.confirm, '비밀번호가 일치합니다.', true);
        }
        
        return isValid;
    }

    // 폼 제출 버튼 활성화/비활성화
    function updateSubmitButton() {
        const isCurrentValid = validateCurrentPassword();
        const isNewValid = validateNewPassword();
        const isConfirmValid = validateConfirmPassword();
        
        const isFormValid = isCurrentValid && isNewValid && isConfirmValid;
        
        if (elements.submitButton) {
            elements.submitButton.disabled = !isFormValid;
        }
        
        return isFormValid;
    }

    // 이벤트 리스너 등록
    if (elements.currentPassword) {
        elements.currentPassword.addEventListener('input', function() {
            // 현재 비밀번호가 변경되면 새 비밀번호도 다시 검증
            validateCurrentPassword();
            if (elements.newPassword.value) {
                validateNewPassword();
            }
            updateSubmitButton();
        });
        
        elements.currentPassword.addEventListener('blur', function() {
            validateCurrentPassword();
            updateSubmitButton();
        });
    }

    if (elements.newPassword) {
        elements.newPassword.addEventListener('input', function() {
            validateNewPassword();
            // 새 비밀번호가 변경되면 확인 비밀번호도 다시 검증
            if (elements.confirmPassword.value) {
                validateConfirmPassword();
            }
            updateSubmitButton();
        });
        
        elements.newPassword.addEventListener('blur', function() {
            validateNewPassword();
            updateSubmitButton();
        });
    }

    if (elements.confirmPassword) {
        elements.confirmPassword.addEventListener('input', function() {
            validateConfirmPassword();
            updateSubmitButton();
        });
        
        elements.confirmPassword.addEventListener('blur', function() {
            validateConfirmPassword();
            updateSubmitButton();
        });
    }

    // 폼 제출 이벤트
    if (elements.form) {
        elements.form.addEventListener('submit', function(event) {
            // 최종 유효성 검사
            const isFormValid = updateSubmitButton();
            
            if (!isFormValid) {
                event.preventDefault();
                console.log('폼 유효성 검사 실패');
                
                // 첫 번째 오류 필드에 포커스
                if (!validateCurrentPassword() && elements.currentPassword) {
                    elements.currentPassword.focus();
                } else if (!validateNewPassword() && elements.newPassword) {
                    elements.newPassword.focus();
                } else if (!validateConfirmPassword() && elements.confirmPassword) {
                    elements.confirmPassword.focus();
                }
                
                return false;
            }
            
            // 폼 제출 중 버튼 비활성화
            if (elements.submitButton) {
                elements.submitButton.disabled = true;
                elements.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>변경 중...';
            }
            
            console.log('비밀번호 변경 폼 제출');
            return true;
        });
    }

    // 초기 상태 설정
    updateSubmitButton();
    
    console.log('비밀번호 변경 페이지 JavaScript 초기화 완료');
});