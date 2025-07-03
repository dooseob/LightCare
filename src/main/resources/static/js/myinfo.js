// 내정보수정 페이지 JavaScript
// Thymeleaf 인라인 JavaScript를 사용하지 않고 완전히 분리된 JavaScript 파일

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 선택
    const elements = {
        form: document.getElementById('mypageForm'),
        profileImageFile: document.getElementById('profileImageFile'),
        currentProfileImage: document.getElementById('currentProfileImage'),
        phone: document.getElementById('phone'),
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        address: document.getElementById('address')
    };

    // 디버깅: DOM 요소 확인
    console.log('내정보수정 페이지 DOM 요소:', elements);

    // 프로필 이미지 미리보기 기능
    function setupProfileImagePreview() {
        if (!elements.profileImageFile) {
            console.warn('프로필 이미지 파일 입력 요소가 없습니다.');
            return;
        }

        elements.profileImageFile.addEventListener('change', function(event) {
            const input = event.target;
            if (input.files && input.files[0]) {
                const file = input.files[0];
                
                // 파일 크기 체크 (5MB 제한)
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    alert('파일 크기는 5MB 이하여야 합니다.');
                    input.value = '';
                    return;
                }
                
                // 파일 타입 체크
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                if (!allowedTypes.includes(file.type)) {
                    alert('JPG, PNG, GIF 파일만 업로드 가능합니다.');
                    input.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (elements.currentProfileImage) {
                        elements.currentProfileImage.src = e.target.result;
                        elements.currentProfileImage.style.display = 'block';
                        console.log('프로필 이미지 미리보기 업데이트:', e.target.result.substring(0, 50) + '...');
                    } else {
                        // 이미지 요소가 없으면 동적으로 생성
                        const imgContainer = elements.profileImageFile.parentNode;
                        let previewImg = document.getElementById('profilePreview');
                        if (!previewImg) {
                            previewImg = document.createElement('img');
                            previewImg.id = 'profilePreview';
                            previewImg.className = 'img-thumbnail mt-2';
                            previewImg.style.maxWidth = '150px';
                            previewImg.style.height = 'auto';
                            previewImg.alt = '프로필 이미지 미리보기';
                            imgContainer.appendChild(previewImg);
                        }
                        previewImg.src = e.target.result;
                        previewImg.style.display = 'block';
                    }
                };
                reader.onerror = function() {
                    alert('이미지 파일을 읽는데 실패했습니다.');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 휴대폰 번호 자동 포맷팅
    function setupPhoneFormatting() {
        if (!elements.phone) {
            console.warn('휴대폰 번호 입력 요소가 없습니다.');
            return;
        }

        elements.phone.addEventListener('input', function(event) {
            let value = event.target.value.replace(/[^\d]/g, ''); // 숫자만 추출
            
            // 길이 제한 (11자리)
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            
            // 포맷팅
            let formattedValue = value;
            if (value.length >= 3) {
                if (value.length >= 7) {
                    formattedValue = value.substring(0, 3) + '-' + value.substring(3, 7) + '-' + value.substring(7);
                } else {
                    formattedValue = value.substring(0, 3) + '-' + value.substring(3);
                }
            }
            
            event.target.value = formattedValue;
        });

        // 붙여넣기 시에도 포맷팅 적용
        elements.phone.addEventListener('paste', function(event) {
            setTimeout(() => {
                const inputEvent = new Event('input', { bubbles: true });
                event.target.dispatchEvent(inputEvent);
            }, 0);
        });
    }

    // 이메일 유효성 검사
    function setupEmailValidation() {
        if (!elements.email) {
            console.warn('이메일 입력 요소가 없습니다.');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        elements.email.addEventListener('blur', function(event) {
            const value = event.target.value.trim();
            if (value && !emailPattern.test(value)) {
                event.target.classList.add('is-invalid');
                // 기존 에러 메시지가 없으면 추가
                let feedback = event.target.parentNode.querySelector('.invalid-feedback');
                if (!feedback) {
                    feedback = document.createElement('div');
                    feedback.className = 'invalid-feedback';
                    event.target.parentNode.appendChild(feedback);
                }
                feedback.textContent = '올바른 이메일 형식이 아닙니다.';
            } else {
                event.target.classList.remove('is-invalid');
                const feedback = event.target.parentNode.querySelector('.invalid-feedback');
                if (feedback && feedback.textContent === '올바른 이메일 형식이 아닙니다.') {
                    feedback.textContent = '';
                }
            }
        });

        elements.email.addEventListener('input', function(event) {
            if (event.target.classList.contains('is-invalid')) {
                const value = event.target.value.trim();
                if (!value || emailPattern.test(value)) {
                    event.target.classList.remove('is-invalid');
                    const feedback = event.target.parentNode.querySelector('.invalid-feedback');
                    if (feedback && feedback.textContent === '올바른 이메일 형식이 아닙니다.') {
                        feedback.textContent = '';
                    }
                }
            }
        });
    }

    // 이름 유효성 검사
    function setupNameValidation() {
        if (!elements.name) {
            console.warn('이름 입력 요소가 없습니다.');
            return;
        }

        elements.name.addEventListener('input', function(event) {
            let value = event.target.value;
            // 특수문자 제거 (한글, 영문, 공백만 허용)
            value = value.replace(/[^a-zA-Z가-힣\s]/g, '');
            // 길이 제한 (20자)
            if (value.length > 20) {
                value = value.substring(0, 20);
            }
            event.target.value = value;
        });
    }

    // 폼 제출 전 유효성 검사
    function setupFormValidation() {
        if (!elements.form) {
            console.warn('폼 요소가 없습니다.');
            return;
        }

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
                    errors.push('올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)');
                    elements.phone.classList.add('is-invalid');
                }
            }

            if (!isValid) {
                event.preventDefault();
                alert('입력 오류:\n' + errors.join('\n'));
                return false;
            }

            // 제출 버튼 비활성화 (중복 제출 방지)
            const submitButton = elements.form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>저장 중...';
            }

            console.log('내정보수정 폼 제출');
            return true;
        });
    }

    // 입력 필드 포커스 시 에러 상태 제거
    function setupErrorStateClear() {
        const inputFields = [elements.name, elements.email, elements.phone];
        
        inputFields.forEach(field => {
            if (field) {
                field.addEventListener('focus', function() {
                    this.classList.remove('is-invalid');
                });
            }
        });
    }

    // 모든 기능 초기화
    function init() {
        setupProfileImagePreview();
        setupPhoneFormatting();
        setupEmailValidation();
        setupNameValidation();
        setupFormValidation();
        setupErrorStateClear();
        
        console.log('내정보수정 페이지 JavaScript 초기화 완료');
        
        // 기존 에러 상태가 있다면 포커스 시 제거하도록 설정
        const invalidFields = document.querySelectorAll('.is-invalid');
        invalidFields.forEach(field => {
            field.addEventListener('focus', function() {
                this.classList.remove('is-invalid');
            });
        });
    }

    // 초기화 실행
    init();
});