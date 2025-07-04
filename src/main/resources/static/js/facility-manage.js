// facility-manage.js

// 시설 삭제 함수
function deleteFacility() {
    if (!facilityId) {
        alert('시설 정보를 찾을 수 없습니다.');
        return;
    }
    
    if (confirm('정말로 시설을 삭제하시겠습니까?\n삭제된 시설 정보는 복구할 수 없습니다.')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/facility/delete/${facilityId}`;
        
        // CSRF 토큰 추가 (Spring Security 사용 시)
        const csrfToken = document.querySelector('meta[name="_csrf"]');
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]');
        
        if (csrfToken && csrfHeader) {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = csrfToken.getAttribute('content');
            hiddenField.value = csrfHeader.getAttribute('content');
            form.appendChild(hiddenField);
        }
        
        document.body.appendChild(form);
        form.submit();
    }
}

// 페이지 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 이미지 로드 에러 처리
    const facilityImage = document.querySelector('img[alt="시설 사진"]');
    if (facilityImage) {
        facilityImage.onerror = function() {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'bg-light rounded p-5 text-center';
            placeholder.innerHTML = '<i class="fas fa-image fa-3x text-muted"></i><p class="text-muted mt-2">이미지를 불러올 수 없습니다</p>';
            this.parentNode.replaceChild(placeholder, this);
        };
    }
    
    // 외부 링크 안전하게 열기
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
        link.rel = 'noopener noreferrer';
    });
});