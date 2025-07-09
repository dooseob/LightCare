/**
 * 게시판 네비게이션 공통 JavaScript
 * 모든 게시판 템플릿에서 사용
 * 탭 클릭 시 브라우저 히스토리 문제 해결
 */

$(document).ready(function() {
    console.log('게시판 네비게이션 스크립트 로드됨');
    
    // 게시판 타입 링크 클릭 시 히스토리 교체 (핵심 기능)
    $('.board-type-link, .btn-group a[href*="/board"]').on('click', function(e) {
        const url = $(this).attr('href');
        
        // 현재 게시판 페이지에서 다른 탭으로 이동할 때만 히스토리 교체
        if (url && window.location.pathname.includes('/board')) {
            e.preventDefault();
            
            // 브라우저 지원 체크 후 히스토리 교체
            if (history.replaceState) {
                history.replaceState(null, null, url);
                console.log('히스토리 교체됨:', url);
            }
            
            // 페이지 이동
            window.location.href = url;
        }
        // 다른 페이지에서 게시판으로 오는 경우는 정상적인 히스토리 추가
    });
    
    // 검색 폼과 페이지네이션도 동일하게 처리
    $(document).on('click', '.pagination .page-link', function(e) {
        const url = $(this).attr('href');
        
        if (url && url !== '#' && url !== 'javascript:void(0)' && window.location.pathname.includes('/board')) {
            e.preventDefault();
            if (history.replaceState) {
                history.replaceState(null, null, url);
            }
            window.location.href = url;
        }
    });
    
    $(document).on('submit', 'form[action*="/board"]', function(e) {
        if (window.location.pathname.includes('/board')) {
            e.preventDefault();
            const form = $(this);
            const url = form.attr('action') || '/board';
            const formData = form.serialize();
            const fullUrl = url + '?' + formData;
            
            if (history.replaceState) {
                history.replaceState(null, null, fullUrl);
            }
            window.location.href = fullUrl;
        }
    });
});