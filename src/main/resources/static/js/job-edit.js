/**
 * 구인구직 수정 페이지 JavaScript
 * job-detail.js와의 충돌 방지를 위한 별도 파일
 */

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('구인구직 수정 페이지 JavaScript 로드됨');
    
    // 폼 유효성 검사 초기화
    initFormValidation();
    
    // 취소 버튼 이벤트 리스너
    initCancelButton();
});

/**
 * 폼 유효성 검사 초기화
 */
function initFormValidation() {
    const form = document.querySelector('form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            return false;
        }
    });
}

/**
 * 폼 유효성 검사
 */
function validateForm() {
    const title = document.querySelector('[name="title"]').value.trim();
    const facilityName = document.querySelector('[name="facilityName"]').value.trim();
    const jobType = document.querySelector('[name="jobType"]').value;
    const content = document.querySelector('[name="content"]').value.trim();
    const salaryDescription = document.querySelector('[name="salaryDescription"]').value.trim();
    const workType = document.querySelector('[name="workType"]').value;
    const status = document.querySelector('[name="status"]').value;
    
    // 필수 필드 검사
    if (!title) {
        alert('제목을 입력해주세요.');
        document.querySelector('[name="title"]').focus();
        return false;
    }
    
    if (!facilityName) {
        alert('회사명을 입력해주세요.');
        document.querySelector('[name="facilityName"]').focus();
        return false;
    }
    
    if (!jobType) {
        alert('직종을 선택해주세요.');
        document.querySelector('[name="jobType"]').focus();
        return false;
    }
    
    if (!content) {
        alert('업무 내용을 입력해주세요.');
        document.querySelector('[name="content"]').focus();
        return false;
    }
    
    if (!salaryDescription) {
        alert('급여를 입력해주세요.');
        document.querySelector('[name="salaryDescription"]').focus();
        return false;
    }
    
    if (!workType) {
        alert('고용형태를 선택해주세요.');
        document.querySelector('[name="workType"]').focus();
        return false;
    }
    
    if (!status) {
        alert('게시글 상태를 선택해주세요.');
        document.querySelector('[name="status"]').focus();
        return false;
    }
    
    // 제목 길이 검사
    if (title.length > 100) {
        alert('제목은 100자 이하로 입력해주세요.');
        document.querySelector('[name="title"]').focus();
        return false;
    }
    
    // 내용 길이 검사
    if (content.length > 2000) {
        alert('업무 내용은 2000자 이하로 입력해주세요.');
        document.querySelector('[name="content"]').focus();
        return false;
    }
    
    return true;
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

/**
 * 숫자 입력 필드 포맷팅 (급여 입력 시 천단위 콤마)
 */
function formatSalary(input) {
    let value = input.value.replace(/,/g, '');
    if (value && !isNaN(value)) {
        input.value = Number(value).toLocaleString();
    }
}

// 급여 입력 필드에 포맷팅 적용
document.addEventListener('DOMContentLoaded', function() {
    const salaryInput = document.querySelector('[name="salaryDescription"]');
    if (salaryInput && salaryInput.type === 'number') {
        salaryInput.addEventListener('blur', function() {
            formatSalary(this);
        });
    }
});