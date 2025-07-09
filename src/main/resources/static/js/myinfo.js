// 내정보수정 페이지 JavaScript (단순화 버전)
// 크롭 기능은 별도 페이지에서 처리

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 선택
    const elements = {
        form: document.getElementById('mypageForm'),
        phone: document.getElementById('phone'),
        name: document.getElementById('name'),
        email: document.getElementById('email')
    };

    // 기본 기능 초기화
    setupPhoneFormatting();
    setupFormValidation();
    
    console.log('내정보수정 페이지 JavaScript 초기화 완료 (단순화)');

    // 휴대폰 번호 자동 포맷팅 (매우 간단한 버전)
    function setupPhoneFormatting() {
        if (!elements.phone) return;

        elements.phone.addEventListener('input', function(event) {
            autoFormatPhone(event.target);
        });
        
        // 붙여넣기 시에도 포맷팅 적용
        elements.phone.addEventListener('paste', function(event) {
            setTimeout(() => autoFormatPhone(event.target), 10);
        });
    }

    // 스마트한 전화번호 포맷팅 함수 (정확한 커서 위치 추적)
    function autoFormatPhone(input) {
        const cursorPos = input.selectionStart;
        const oldValue = input.value;
        
        // 커서 앞에 있는 숫자의 개수 계산 (하이픈 제외)
        const numbersBeforeCursor = oldValue.substring(0, cursorPos).replace(/[^\d]/g, '').length;
        
        // 숫자만 추출
        const numbers = input.value.replace(/[^\d]/g, '');
        
        // 최대 11자리 제한
        const limitedNumbers = numbers.substring(0, 11);
        
        // 포맷팅 적용
        let formatted = formatPhoneNumber(limitedNumbers);
        
        // 값 업데이트
        input.value = formatted;
        
        // 새로운 커서 위치 계산
        let newCursorPos = 0;
        let numberCount = 0;
        
        for (let i = 0; i < formatted.length; i++) {
            if (/\d/.test(formatted[i])) {
                numberCount++;
                if (numberCount === numbersBeforeCursor) {
                    newCursorPos = i + 1;
                    break;
                }
            }
        }
        
        // 숫자가 추가된 경우 마지막 숫자 뒤로 커서 이동
        if (numberCount < numbersBeforeCursor) {
            newCursorPos = formatted.length;
        }
        
        // 커서가 하이픈 위에 있으면 다음 위치로 이동
        if (formatted[newCursorPos] === '-') {
            newCursorPos++;
        }
        
        // 커서 위치 설정 (비동기적으로 처리)
        setTimeout(() => {
            input.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    }

    // 휴대폰 번호 포맷팅 (010으로 시작하는 번호만)
    function formatPhoneNumber(numbers) {
        if (numbers.length === 0) return '';
        
        // 휴대폰 번호만 허용 (010, 011, 016, 017, 018, 019)
        if (numbers.startsWith('01')) {
            if (numbers.length <= 3) {
                return numbers;
            } else if (numbers.length <= 7) {
                return numbers.substring(0, 3) + '-' + numbers.substring(3);
            } else {
                return numbers.substring(0, 3) + '-' + numbers.substring(3, 7) + '-' + numbers.substring(7);
            }
        }
        
        // 010으로 시작하지 않으면 입력 제한 (휴대폰 번호만 허용)
        return numbers.startsWith('0') ? numbers.substring(0, 1) : numbers;
    }


    // 폼 제출 전 유효성 검사
    function setupFormValidation() {
        if (!elements.form) return;

        elements.form.addEventListener('submit', function(event) {
            let isValid = true;
            const errors = [];

            // 이름 검사
            if (elements.name && elements.name.value.trim().length < 2) {
                isValid = false;
                errors.push('이름은 2자 이상 입력해주세요.');
                elements.name.classList.add('is-invalid');
            }

            // 이메일 검사
            if (elements.email && elements.email.value.trim()) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(elements.email.value.trim())) {
                    isValid = false;
                    errors.push('올바른 이메일 형식이 아닙니다.');
                    elements.email.classList.add('is-invalid');
                }
            }

            // 휴대폰 번호 검사
            if (elements.phone && elements.phone.value.trim()) {
                const phonePattern = /^01[0-9]-\d{3,4}-\d{4}$/;
                if (!phonePattern.test(elements.phone.value.trim())) {
                    isValid = false;
                    errors.push('올바른 휴대폰 번호 형식이 아닙니다.');
                    elements.phone.classList.add('is-invalid');
                }
            }

            if (!isValid) {
                event.preventDefault();
                alert('입력 오류:\n' + errors.join('\n'));
                return false;
            }

            // 제출 버튼 비활성화
            const submitButton = elements.form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>저장 중...';
            }

            return true;
        });
    }

    // 입력 필드 포커스 시 에러 상태 제거
    [elements.name, elements.email, elements.phone].forEach(field => {
        if (field) {
            field.addEventListener('focus', function() {
                this.classList.remove('is-invalid');
            });
        }
    });
});