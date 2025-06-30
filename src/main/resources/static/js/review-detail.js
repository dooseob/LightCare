// 리뷰 상세 페이지 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 리뷰 ID 가져오기
    const reviewId = document.getElementById('reviewId')?.value;
    
    // 추천 버튼 이벤트 핸들러
    window.likeReview = function() {
        if (!reviewId) {
            alert('리뷰 정보를 찾을 수 없습니다.');
            return;
        }

        fetch(`/api/review/${reviewId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('추천 처리 중 오류가 발생했습니다.');
            }
            return response.json();
        })
        .then(data => {
            // 추천 수 업데이트
            const likeCountElement = document.getElementById('likeCount');
            if (likeCountElement) {
                likeCountElement.textContent = data.likeCount;
            }
            
            // 알림 표시
            alert('추천이 완료되었습니다.');
        })
        .catch(error => {
            console.error('추천 처리 오류:', error);
            alert(error.message);
        });
    };

    // 리뷰 삭제 이벤트 핸들러
    window.deleteReview = function() {
        if (!reviewId) {
            alert('리뷰 정보를 찾을 수 없습니다.');
            return;
        }

        if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
            return;
        }

        fetch(`/api/review/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('삭제 처리 중 오류가 발생했습니다.');
            }
            return response.json();
        })
        .then(() => {
            alert('리뷰가 삭제되었습니다.');
            window.location.href = '/review';
        })
        .catch(error => {
            console.error('삭제 처리 오류:', error);
            alert(error.message);
        });
    };

    // 리뷰 신고 이벤트 핸들러
    window.reportReview = function() {
        if (!reviewId) {
            alert('리뷰 정보를 찾을 수 없습니다.');
            return;
        }

        const reason = prompt('신고 사유를 입력해주세요:');
        if (!reason) {
            return;
        }

        fetch(`/api/review/${reviewId}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('신고 처리 중 오류가 발생했습니다.');
            }
            return response.json();
        })
        .then(() => {
            alert('신고가 접수되었습니다.');
        })
        .catch(error => {
            console.error('신고 처리 오류:', error);
            alert(error.message);
        });
    };

    // 리뷰 공유 이벤트 핸들러
    window.shareReview = function() {
        if (!reviewId) {
            alert('리뷰 정보를 찾을 수 없습니다.');
            return;
        }

        const url = window.location.href;
        
        // 클립보드에 URL 복사
        navigator.clipboard.writeText(url)
            .then(() => {
                alert('리뷰 링크가 클립보드에 복사되었습니다.');
            })
            .catch(error => {
                console.error('클립보드 복사 오류:', error);
                alert('클립보드 복사에 실패했습니다. 수동으로 URL을 복사해주세요.');
            });
    };

    // 이미지 모달 기능
    const reviewImages = document.querySelectorAll('.review-image');
    reviewImages.forEach(image => {
        image.addEventListener('click', function() {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImage');
            if (modal && modalImg) {
                modalImg.src = this.src;
                modal.style.display = 'block';
            }
        });
    });

    // 모달 닫기 기능
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            const modal = document.getElementById('imageModal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }
}); 