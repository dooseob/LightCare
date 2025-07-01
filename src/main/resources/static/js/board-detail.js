// 게시글 상세 페이지 전용 JavaScript
console.log('board-detail.js 로드됨');

function deleteBoard(event) {
    console.log('삭제 함수 실행');
    
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    var button = event ? event.target.closest('button') : document.querySelector('button[data-board-id]');
    console.log('버튼:', button);
    
    if (!button) {
        alert('삭제 버튼을 찾을 수 없습니다.');
        return false;
    }
    
    var boardId = parseInt(button.getAttribute('data-board-id'));
    var type = button.getAttribute('data-type') || 'all';
    
    console.log('boardId:', boardId, 'type:', type);
    
    if (!boardId || isNaN(boardId)) {
        alert('게시글 ID가 올바르지 않습니다.');
        return false;
    }
    
    if (!confirm('정말로 삭제하시겠습니까?')) {
        return false;
    }
    
    button.disabled = true;
    button.innerHTML = '삭제 중...';
    
    var formData = new FormData();
    formData.append('type', type);
    
    fetch('/board/delete/' + boardId, {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        console.log('응답 상태:', response.status);
        if (response.ok || response.status === 302) {
            window.location.href = '/board?type=' + type;
        } else {
            alert('삭제에 실패했습니다.');
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-trash me-1"></i>삭제';
        }
    })
    .catch(function(error) {
        console.error('에러:', error);
        alert('오류가 발생했습니다.');
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-trash me-1"></i>삭제';
    });
    
    return false;
}

function likeBoard() {
    var deleteButton = document.querySelector('button[data-board-id]');
    var boardId = deleteButton ? parseInt(deleteButton.getAttribute('data-board-id')) : 0;
    
    if (!boardId) {
        alert('게시글 ID를 찾을 수 없습니다.');
        return;
    }
    
    fetch('/board/like/' + boardId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=like'
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            var likeCount = document.getElementById('likeCount');
            if (likeCount) {
                likeCount.textContent = parseInt(likeCount.textContent) + 1;
            }
            alert(data.message || '추천되었습니다.');
        } else {
            alert(data.message || '추천에 실패했습니다.');
        }
    })
    .catch(function(error) {
        console.error('에러:', error);
        alert('오류가 발생했습니다.');
    });
}

function shareBoard() {
    var title = document.title.replace(' - CareLink', '') || '게시글';
    var url = window.location.href;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function() {
            alert('링크가 복사되었습니다.');
        }).catch(function() {
            prompt('링크를 복사하세요:', url);
        });
    } else {
        prompt('링크를 복사하세요:', url);
    }
}

function reportBoard() {
    if (confirm('이 게시글을 신고하시겠습니까?')) {
        alert('신고가 접수되었습니다.');
    }
}

console.log('board-detail.js 로드 완료'); 