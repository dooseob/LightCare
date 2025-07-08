/**
 * 구인구직 수정 페이지 JavaScript
 * job-detail.js와의 충돌 방지를 위한 별도 파일
 */

// 전역 변수로 제출 상태 관리
let isSubmitting = false;
let formInitialized = false;

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('구인구직 수정 페이지 JavaScript 로드됨');
    
    // 중복 초기화 방지
    if (formInitialized) {
        console.log('이미 초기화됨 - 중복 초기화 방지');
        return;
    }
    
    // 폼 유효성 검사 초기화
    initFormValidation();
    
    // 취소 버튼 이벤트 리스너
    initCancelButton();
    
    // 입력 필드 이벤트 리스너 초기화
    initInputFieldHandlers();
    
    // 리치 텍스트 에디터 안전 초기화
    initSafeRichTextEditor();
    
    formInitialized = true;
    console.log('폼 초기화 완료');
});

/**
 * 폼 유효성 검사 초기화 (중복 방지)
 */
function initFormValidation() {
    const form = document.querySelector('form');
    if (!form) return;
    
    // 기존 이벤트 리스너 제거 (중복 방지)
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // 새로운 이벤트 리스너 추가
    newForm.addEventListener('submit', function(e) {
        console.log('폼 제출 시작 - 검증 중...');
        
        // 중복 제출 방지
        if (isSubmitting) {
            console.log('이미 제출 중 - 중복 제출 방지');
            e.preventDefault();
            return false;
        }
        
        // 제출 전 값 정리
        cleanFormValues();
        
        if (!validateForm()) {
            console.log('폼 검증 실패 - 제출 중단');
            e.preventDefault();
            return false;
        }
        
        // 제출 상태 플래그 설정
        isSubmitting = true;
        
        // 제출 버튼 비활성화
        const submitBtn = newForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>수정 중...';
        }
        
        console.log('폼 검증 성공 - 제출 계속');
        return true;
    });
}

/**
 * 제출 전 폼 값 정리 (중복 및 누적 방지)
 */
function cleanFormValues() {
    console.log('폼 값 정리 시작');
    
    // 급여 설명 정리
    const salaryDescription = document.querySelector('[name="salaryDescription"]');
    if (salaryDescription && salaryDescription.value) {
        const cleanValue = salaryDescription.value.trim();
        // 중복된 값 제거 (콤마로 분리된 경우)
        const uniqueValues = [...new Set(cleanValue.split(',').map(v => v.trim()).filter(v => v))];
        salaryDescription.value = uniqueValues.join(', ');
        console.log('급여 설명 정리됨:', salaryDescription.value);
    }
    
    // 근무시간 정리
    const workHours = document.querySelector('[name="workHours"]');
    if (workHours && workHours.value) {
        const cleanValue = workHours.value.trim();
        // 중복된 값 제거
        const uniqueValues = [...new Set(cleanValue.split(',').map(v => v.trim()).filter(v => v))];
        workHours.value = uniqueValues.join(', ');
        console.log('근무시간 정리됨:', workHours.value);
    }
    
    // 기타 텍스트 필드 정리
    const textFields = ['title', 'facilityName', 'workLocation', 'contactPhone'];
    textFields.forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field && field.value) {
            field.value = field.value.trim();
        }
    });
    
    console.log('폼 값 정리 완료');
}

/**
 * 폼 유효성 검사 (구인글/구직글 구분)
 */
function validateForm() {
    const jobTypeInput = document.querySelector('[name="jobType"]');
    const jobType = jobTypeInput?.value || '';
    
    console.log('검증 시작 - jobType:', jobType);
    
    // 공통 필수 필드 검사
    const title = document.querySelector('[name="title"]')?.value?.trim() || '';
    const content = document.querySelector('[name="content"]')?.value?.trim() || '';
    const workType = document.querySelector('[name="workType"]')?.value || '';
    const status = document.querySelector('[name="status"]')?.value || '';
    
    if (!title) {
        alert('제목을 입력해주세요.');
        document.querySelector('[name="title"]')?.focus();
        return false;
    }
    
    if (!content) {
        alert('내용을 입력해주세요.');
        document.querySelector('[name="content"]')?.focus();
        return false;
    }
    
    if (!workType) {
        alert('고용형태를 선택해주세요.');
        document.querySelector('[name="workType"]')?.focus();
        return false;
    }
    
    if (!status) {
        alert('게시글 상태를 선택해주세요.');
        document.querySelector('[name="status"]')?.focus();
        return false;
    }
    
    // 구인글 전용 필수 필드 검사
    if (jobType === 'RECRUIT') {
        console.log('구인글 검증 중...');
        const facilityName = document.querySelector('[name="facilityName"]')?.value?.trim() || '';
        const position = document.querySelector('[name="position"]')?.value || '';
        
        if (!facilityName) {
            alert('회사명을 입력해주세요.');
            document.querySelector('[name="facilityName"]')?.focus();
            return false;
        }
        
        if (!position) {
            alert('직종을 선택해주세요.');
            document.querySelector('[name="position"]')?.focus();
            return false;
        }
    }
    
    // 구직글 전용 필수 필드 검사
    if (jobType === 'SEARCH') {
        console.log('구직글 검증 중...');
        const workLocation = document.querySelector('[name="workLocation"]')?.value?.trim() || '';
        const contactPhone = document.querySelector('[name="contactPhone"]')?.value?.trim() || '';
        const position = document.querySelector('[name="position"]')?.value || '';
        
        if (!workLocation) {
            alert('희망 근무지를 입력해주세요.');
            document.querySelector('[name="workLocation"]')?.focus();
            return false;
        }
        
        if (!contactPhone) {
            alert('연락처를 입력해주세요.');
            document.querySelector('[name="contactPhone"]')?.focus();
            return false;
        }
        
        if (!position) {
            alert('직종을 선택해주세요.');
            document.querySelector('[name="position"]')?.focus();
            return false;
        }
    }
    
    // 제목 길이 검사
    if (title.length > 100) {
        alert('제목은 100자 이하로 입력해주세요.');
        document.querySelector('[name="title"]')?.focus();
        return false;
    }
    
    // 내용 길이 검사
    if (content.length > 2000) {
        alert('내용은 2000자 이하로 입력해주세요.');
        document.querySelector('[name="content"]')?.focus();
        return false;
    }
    
    console.log('모든 검증 통과');
    return true;
}

/**
 * 입력 필드 이벤트 핸들러 초기화
 */
function initInputFieldHandlers() {
    // 급여 입력 필드 핸들러
    const salaryInputs = document.querySelectorAll('[name="salaryMin"], [name="salaryMax"]');
    salaryInputs.forEach(input => {
        if (input && input.type === 'number') {
            // 기존 이벤트 리스너 제거
            input.removeEventListener('blur', handleSalaryFormat);
            // 새 이벤트 리스너 추가
            input.addEventListener('blur', handleSalaryFormat);
        }
    });
    
    // 텍스트 필드 중복 입력 방지
    const textInputs = document.querySelectorAll('[name="salaryDescription"], [name="workHours"]');
    textInputs.forEach(input => {
        if (input) {
            input.removeEventListener('blur', handleTextFieldClean);
            input.addEventListener('blur', handleTextFieldClean);
        }
    });
}

/**
 * 급여 입력 필드 포맷팅 핸들러
 */
function handleSalaryFormat(event) {
    const input = event.target;
    let value = input.value.replace(/,/g, '');
    if (value && !isNaN(value)) {
        input.value = Number(value).toLocaleString();
    }
}

/**
 * 텍스트 필드 정리 핸들러 (중복 제거)
 */
function handleTextFieldClean(event) {
    const input = event.target;
    if (input.value) {
        const cleanValue = input.value.trim();
        // 중복된 값 제거 (콤마로 분리된 경우)
        const uniqueValues = [...new Set(cleanValue.split(',').map(v => v.trim()).filter(v => v))];
        input.value = uniqueValues.join(', ');
    }
}

/**
 * 리치 텍스트 에디터 안전 초기화
 */
function initSafeRichTextEditor() {
    const contentTextarea = document.getElementById('contentTextarea');
    if (contentTextarea && contentTextarea.hasAttribute('data-rich-editor')) {
        // 기존 에디터 인스턴스가 있다면 제거
        if (window.richTextEditorInstance) {
            try {
                window.richTextEditorInstance.destroy();
                console.log('기존 리치 텍스트 에디터 제거됨');
            } catch (e) {
                console.log('에디터 제거 중 오류 (무시):', e.message);
            }
        }
        
        // 새 에디터 초기화는 RichTextEditorV2가 로드된 후에 수행
        setTimeout(() => {
            if (typeof window.RichTextEditorV2 !== 'undefined') {
                try {
                    window.richTextEditorInstance = new window.RichTextEditorV2(contentTextarea);
                    console.log('리치 텍스트 에디터 안전 초기화 완료');
                } catch (e) {
                    console.log('에디터 초기화 오류:', e.message);
                }
            }
        }, 500);
    }
}

/**
 * 취소 버튼 이벤트 초기화
 */
function initCancelButton() {
    const cancelBtn = document.querySelector('.btn-secondary');
    if (!cancelBtn) return;
    
    cancelBtn.addEventListener('click', function(e) {
        if (confirm('수정을 취소하시겠습니까?\n변경사항이 저장되지 않습니다.')) {
            // 취소 버튼의 href로 이동 (이미 설정됨)
            return true;
        } else {
            e.preventDefault();
            return false;
        }
    });
}