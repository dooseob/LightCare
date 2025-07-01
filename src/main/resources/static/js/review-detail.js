/**
 * 리뷰 상세보기 페이지 JavaScript
 * Thymeleaf 충돌 방지를 위해 완전 분리된 버전
 */

// 전역 변수
let currentReviewId = null;

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('리뷰 상세보기 페이지 JavaScript 로드됨');
    
    // URL에서 리뷰 ID 추출
    currentReviewId = extractReviewIdFromUrl();
    console.log('현재 리뷰 ID:', currentReviewId);
    
    // 이벤트 리스너 초기화
    initializeEventListeners();
    
    // 이미지 모달 초기화
    initializeImageModal();
});

/**
 * URL에서 리뷰 ID 추출
 */
function extractReviewIdFromUrl() {
    const path = window.location.pathname;
    const segments = path.split('/');
    const detailIndex = segments.findIndex(segment => segment === 'detail');
    
    if (detailIndex !== -1 && detailIndex < segments.length - 1) {
        return segments[detailIndex + 1];
    }
    
    console.warn('URL에서 리뷰 ID를 찾을 수 없습니다:', path);
    return null;
}

/**
 * 이벤트 리스너 초기화
 */
function initializeEventListeners() {
    // data-action 속성을 가진 모든 버튼에 이벤트 리스너 추가
    const actionButtons = document.querySelectorAll('[data-action]');
    
    actionButtons.forEach(button => {
        const action = button.getAttribute('data-action');
        console.log('이벤트 리스너 등록:', action);
        
        switch(action) {
            case 'likeReview':
                button.addEventListener('click', handleLikeReview);
                break;
            case 'deleteReview':
                button.addEventListener('click', handleDeleteReview);
                break;
            case 'shareReview':
                button.addEventListener('click', handleShareReview);
                break;
            case 'reportReview':
                button.addEventListener('click', handleReportReview);
                break;
            default:
                console.warn('알 수 없는 액션:', action);
        }
    });
    
    console.log('이벤트 리스너 초기화 완료, 등록된 버튼 수:', actionButtons.length);
}

/**
 * 이미지 모달 초기화
 */
function initializeImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const reviewImages = document.querySelectorAll('.review-image');
    const closeBtn = document.querySelector('.close-modal');
    
    if (!modal || !modalImage) {
        console.log('이미지 모달 요소를 찾을 수 없음');
        return;
    }
    
    // 리뷰 이미지 클릭 이벤트
    reviewImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            modal.style.display = 'block';
            modalImage.src = this.src;
            modalImage.alt = this.alt || '리뷰 이미지';
        });
    });
    
    // 모달 닫기 버튼
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // 모달 배경 클릭 시 닫기
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
    
    console.log('이미지 모달 초기화 완료, 이미지 수:', reviewImages.length);
}

/**
 * 리뷰 추천 처리
 */
function handleLikeReview(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!currentReviewId) {
        showAlert('error', '리뷰 정보를 찾을 수 없습니다.');
        return;
    }
    
    console.log('추천 요청 시작:', currentReviewId);
    
    // 버튼 비활성화
    const button = event.target.closest('button');
    const originalHtml = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>처리 중...';
    button.disabled = true;
    
    fetch(`/review/like/${currentReviewId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        console.log('추천 응답:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('추천 응답 데이터:', data);
        if (data.success) {
            // 추천 수 업데이트
            const likeCountElement = document.getElementById('likeCount');
            if (likeCountElement) {
                likeCountElement.textContent = data.likeCount || 0;
            }
            
            showAlert('success', data.message || '추천하였습니다.');
        } else {
            showAlert('error', data.message || '추천 처리 중 오류가 발생했습니다.');
        }
    })
    .catch(error => {
        console.error('추천 처리 오류:', error);
        showAlert('error', '추천 처리 중 오류가 발생했습니다.');
    })
    .finally(() => {
        // 버튼 상태 복원
        button.innerHTML = originalHtml;
        button.disabled = false;
    });
}

/**
 * 리뷰 삭제 처리
 */
function handleDeleteReview(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!currentReviewId) {
        showAlert('error', '리뷰 정보를 찾을 수 없습니다.');
        return;
    }
    
    if (!confirm('정말 이 리뷰를 삭제하시겠습니까?\n삭제된 리뷰는 복구할 수 없습니다.')) {
        return;
    }
    
    console.log('삭제 요청 시작:', currentReviewId);
    
    // 삭제 버튼 비활성화 및 로딩 상태 표시
    const button = event.target.closest('button');
    const originalHtml = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>삭제 중...';
    button.disabled = true;
    
    fetch(`/review/delete/${currentReviewId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        console.log('삭제 응답:', response.status);
        if (response.ok) {
            showAlert('success', '리뷰가 성공적으로 삭제되었습니다.');
            // 2초 후 목록 페이지로 이동
            setTimeout(() => {
                window.location.href = '/review';
            }, 2000);
        } else if (response.redirected) {
            // 리다이렉트된 경우
            window.location.href = response.url;
        } else {
            throw new Error('삭제 요청이 실패했습니다.');
        }
    })
    .catch(error => {
        console.error('삭제 처리 오류:', error);
        showAlert('error', '리뷰 삭제 중 오류가 발생했습니다.');
        
        // 버튼 상태 복원
        button.innerHTML = originalHtml;
        button.disabled = false;
    });
}

/**
 * 리뷰 공유 처리
 */
function handleShareReview(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const currentUrl = window.location.href;
    const reviewTitle = document.querySelector('h1, .card-title')?.textContent || '리뷰';
    
    console.log('공유 요청:', { url: currentUrl, title: reviewTitle });
    
    // Web Share API 지원 확인
    if (navigator.share) {
        navigator.share({
            title: reviewTitle,
            text: '이 리뷰를 확인해보세요!',
            url: currentUrl
        }).then(() => {
            console.log('공유 성공');
            showAlert('success', '공유가 완료되었습니다.');
        }).catch(error => {
            console.log('공유 취소 또는 실패:', error);
            // 공유 취소는 에러가 아니므로 메시지 표시하지 않음
        });
    } else {
        // 클립보드에 URL 복사
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(currentUrl).then(() => {
                showAlert('success', '링크가 클립보드에 복사되었습니다.');
            }).catch(error => {
                console.error('클립보드 복사 실패:', error);
                fallbackCopyToClipboard(currentUrl);
            });
        } else {
            fallbackCopyToClipboard(currentUrl);
        }
    }
}

/**
 * 클립보드 복사 대체 방법
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showAlert('success', '링크가 복사되었습니다.');
        } else {
            showAlert('error', '링크 복사에 실패했습니다.');
        }
    } catch (err) {
        console.error('클립보드 복사 실패:', err);
        showAlert('error', '링크 복사에 실패했습니다.');
    }
    
    document.body.removeChild(textArea);
}

/**
 * 리뷰 신고 처리
 */
function handleReportReview(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!currentReviewId) {
        showAlert('error', '리뷰 정보를 찾을 수 없습니다.');
        return;
    }
    
    const reportReason = prompt(
        '신고 사유를 입력해주세요:\n\n' +
        '• 부적절한 내용\n' +
        '• 허위정보\n' +
        '• 스팸/광고\n' +
        '• 기타'
    );
    
    if (!reportReason || reportReason.trim() === '') {
        return; // 사용자가 취소하거나 빈 내용
    }
    
    if (!confirm('이 리뷰를 신고하시겠습니까?')) {
        return;
    }
    
    console.log('신고 요청:', { reviewId: currentReviewId, reason: reportReason });
    
    // 버튼 비활성화
    const button = event.target.closest('button');
    const originalHtml = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>신고 중...';
    button.disabled = true;
    
    fetch(`/review/report/${currentReviewId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            reason: reportReason.trim()
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('신고 응답:', data);
        if (data.success) {
            showAlert('success', data.message || '신고가 접수되었습니다. 검토 후 적절한 조치를 취하겠습니다.');
        } else {
            showAlert('error', data.message || '신고 처리 중 오류가 발생했습니다.');
        }
    })
    .catch(error => {
        console.error('신고 처리 오류:', error);
        showAlert('error', '신고 처리 중 오류가 발생했습니다.');
    })
    .finally(() => {
        // 버튼 상태 복원
        button.innerHTML = originalHtml;
        button.disabled = false;
    });
}

/**
 * 알림 메시지 표시
 */
function showAlert(type, message) {
    // 기존 알림 제거
    const existingAlert = document.querySelector('.dynamic-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // 새 알림 생성
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show dynamic-alert`;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '80px';
    alertDiv.style.left = '50%';
    alertDiv.style.transform = 'translateX(-50%)';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.maxWidth = '500px';
    
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
    
    console.log('알림 표시:', type, message);
}

// 전역 함수로 노출 (혹시 다른 곳에서 호출하는 경우를 위해)
window.likeReview = handleLikeReview;
window.deleteReview = handleDeleteReview;
window.shareReview = handleShareReview;
window.reportReview = handleReportReview; 