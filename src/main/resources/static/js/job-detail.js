/**
 * 구인구직 상세보기 페이지 JavaScript
 * Thymeleaf 충돌 방지를 위해 단순화된 버전
 */

// 전역 변수
let currentJobId = null;

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('구인구직 상세보기 페이지 JavaScript 로드됨');
    
    // URL에서 구인구직 ID 추출
    currentJobId = extractJobIdFromUrl();
    if (!currentJobId) {
        currentJobId = document.getElementById('jobId')?.value;
    }
    console.log('현재 구인구직 ID:', currentJobId);
    
    // 이벤트 리스너 초기화
    initializeEventListeners();
});

/**
 * URL에서 구인구직 ID 추출
 */
function extractJobIdFromUrl() {
    const path = window.location.pathname;
    const segments = path.split('/');
    const detailIndex = segments.findIndex(segment => segment === 'detail');
    
    if (detailIndex !== -1 && detailIndex < segments.length - 1) {
        return segments[detailIndex + 1];
    }
    
    console.warn('URL에서 구인구직 ID를 찾을 수 없습니다:', path);
    return null;
}

/**
 * 이벤트 리스너 초기화
 */
function initializeEventListeners() {
    // 지원하기 버튼
    const applyBtn = document.querySelector('[onclick="applyJob()"]');
    if (applyBtn) {
        applyBtn.removeAttribute('onclick');
        applyBtn.addEventListener('click', applyJob);
    }
    
    // 연락하기 버튼
    const contactBtn = document.querySelector('[onclick="contactJob()"]');
    if (contactBtn) {
        contactBtn.removeAttribute('onclick');
        contactBtn.addEventListener('click', contactJob);
    }
    
    // 관심등록 버튼
    const bookmarkBtn = document.querySelector('[onclick="bookmarkJob()"]');
    if (bookmarkBtn) {
        bookmarkBtn.removeAttribute('onclick');
        bookmarkBtn.addEventListener('click', bookmarkJob);
    }
    
    // 공유 버튼
    const shareBtn = document.querySelector('[onclick="shareJob()"]');
    if (shareBtn) {
        shareBtn.removeAttribute('onclick');
        shareBtn.addEventListener('click', shareJob);
    }
    
    // 삭제 버튼
    const deleteBtn = document.querySelector('[onclick="deleteJob()"]');
    if (deleteBtn) {
        deleteBtn.removeAttribute('onclick');
        deleteBtn.addEventListener('click', deleteJob);
    }
    
    // 쪽지 보내기 버튼
    const messageBtn = document.querySelector('[onclick="sendMessage()"]');
    if (messageBtn) {
        messageBtn.removeAttribute('onclick');
        messageBtn.addEventListener('click', sendMessage);
    }
    
    // 신고 버튼
    const reportBtn = document.querySelector('[onclick="reportJob()"]');
    if (reportBtn) {
        reportBtn.removeAttribute('onclick');
        reportBtn.addEventListener('click', reportJob);
    }
}

/**
 * 지원하기 기능
 */
function applyJob() {
    if (!currentJobId) {
        alert('오류: 구인구직 정보를 찾을 수 없습니다.');
        return;
    }
    
    if (confirm('이 구인에 지원하시겠습니까?')) {
        // TODO: 실제 지원 로직 구현
        fetch(`/job/${currentJobId}/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jobId: currentJobId
            })
        })
        .then(response => {
            if (response.ok) {
                alert('지원이 완료되었습니다. 담당자가 연락드릴 예정입니다.');
                location.reload();
            } else {
                throw new Error('지원 처리 중 오류가 발생했습니다.');
            }
        })
        .catch(error => {
            console.error('지원 오류:', error);
            alert('지원 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        });
    }
}

/**
 * 연락하기 기능
 */
function contactJob() {
    const contactPhone = document.querySelector('#contactPhone')?.value;
    const contactEmail = document.querySelector('#contactEmail')?.value;
    
    if (contactPhone) {
        if (confirm('담당자에게 연락하시겠습니까?\n연락처: ' + contactPhone)) {
            window.location.href = 'tel:' + contactPhone;
        }
    } else if (contactEmail) {
        if (confirm('담당자에게 이메일을 보내시겠습니까?\n이메일: ' + contactEmail)) {
            window.location.href = 'mailto:' + contactEmail;
        }
    } else {
        alert('연락처 정보가 없습니다.');
    }
}

/**
 * 관심등록 기능
 */
function bookmarkJob() {
    if (!currentJobId) {
        alert('오류: 구인구직 정보를 찾을 수 없습니다.');
        return;
    }
    
    alert('관심등록 기능은 추후 구현 예정입니다.');
}

/**
 * 공유 기능
 */
function shareJob() {
    const url = window.location.href;
    const title = document.querySelector('h3')?.textContent || '구인구직';
    
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        }).catch(error => {
            console.log('공유 실패:', error);
            fallbackShare(url);
        });
    } else {
        fallbackShare(url);
    }
}

/**
 * 공유 기능 대체 방법 (클립보드 복사)
 */
function fallbackShare(url) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            alert('링크가 클립보드에 복사되었습니다.');
        }).catch(() => {
            promptShare(url);
        });
    } else {
        promptShare(url);
    }
}

/**
 * URL 수동 복사 안내
 */
function promptShare(url) {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert('링크가 클립보드에 복사되었습니다.');
    } catch (err) {
        alert('링크 복사에 실패했습니다. 수동으로 복사해주세요:\n' + url);
    }
    
    document.body.removeChild(textArea);
}

/**
 * 구인구직 삭제 기능
 */
function deleteJob() {
    if (!currentJobId) {
        alert('오류: 구인구직 정보를 찾을 수 없습니다.');
        return;
    }
    
    if (confirm('정말로 이 구인구직을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/job/delete/${currentJobId}`;
        
        // CSRF 토큰이 필요한 경우 추가
        const csrfToken = document.querySelector('meta[name="_csrf"]');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_csrf';
            csrfInput.value = csrfToken.getAttribute('content');
            form.appendChild(csrfInput);
        }
        
        document.body.appendChild(form);
        form.submit();
    }
}

/**
 * 쪽지 보내기 기능
 */
function sendMessage() {
    alert('쪽지 기능은 추후 구현 예정입니다.');
}

/**
 * 신고 기능
 */
function reportJob() {
    if (!currentJobId) {
        alert('오류: 구인구직 정보를 찾을 수 없습니다.');
        return;
    }
    
    const reason = prompt('신고 사유를 입력해주세요:');
    if (reason && reason.trim()) {
        if (confirm('이 구인구직을 신고하시겠습니까?\n사유: ' + reason)) {
            // TODO: 실제 신고 로직 구현
            fetch(`/job/${currentJobId}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobId: currentJobId,
                    reason: reason.trim()
                })
            })
            .then(response => {
                if (response.ok) {
                    alert('신고가 접수되었습니다. 검토 후 조치하겠습니다.');
                } else {
                    throw new Error('신고 처리 중 오류가 발생했습니다.');
                }
            })
            .catch(error => {
                console.error('신고 오류:', error);
                alert('신고 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
            });
        }
    }
}