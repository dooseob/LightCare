// 내가 쓴 글 페이지 JavaScript
// Thymeleaf 인라인 JavaScript를 사용하지 않고 완전히 분리된 JavaScript 파일

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 선택
    const elements = {
        filterButtons: document.querySelectorAll('.filter-btn'),
        sortSelect: document.getElementById('sortSelect'),
        postsContainer: document.getElementById('postsContainer'),
        postItems: document.querySelectorAll('.post-item'),
        tableBody: document.querySelector('#postsContainer tbody')
    };

    // 디버깅: DOM 요소 확인
    console.log('내가 쓴 글 페이지 DOM 요소:', {
        filterButtons: elements.filterButtons.length,
        sortSelect: elements.sortSelect ? 'found' : 'not found',
        postsContainer: elements.postsContainer ? 'found' : 'not found',
        postItems: elements.postItems.length,
        tableBody: elements.tableBody ? 'found' : 'not found'
    });

    // 현재 URL에서 파라미터 추출
    const urlParams = new URLSearchParams(window.location.search);
    const currentType = urlParams.get('type') || 'all';
    const currentPage = parseInt(urlParams.get('page')) || 1;
    const currentPageSize = parseInt(urlParams.get('pageSize')) || 10;

    // 필터 버튼 이벤트 설정
    function setupFilterButtons() {
        elements.filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const selectedType = this.getAttribute('data-type');
                
                if (selectedType !== currentType) {
                    // URL 파라미터를 변경하여 페이지 이동
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('type', selectedType);
                    newUrl.searchParams.set('page', '1'); // 첫 페이지로 리셋
                    
                    console.log('필터 변경:', selectedType);
                    window.location.href = newUrl.toString();
                }
            });
        });
    }

    // 정렬 기능
    function setupSorting() {
        if (!elements.sortSelect || !elements.tableBody) return;

        elements.sortSelect.addEventListener('change', function() {
            const sortType = this.value;
            console.log('정렬 변경:', sortType);
            
            // 현재 보이는 게시글들을 배열로 변환
            const rows = Array.from(elements.tableBody.querySelectorAll('.post-item'));
            
            // 정렬 기준에 따라 정렬
            rows.sort((a, b) => {
                switch (sortType) {
                    case 'latest':
                        // 최신순 (기본값)
                        const dateA = new Date(a.getAttribute('data-created'));
                        const dateB = new Date(b.getAttribute('data-created'));
                        return dateB - dateA;
                        
                    case 'oldest':
                        // 오래된순
                        const oldDateA = new Date(a.getAttribute('data-created'));
                        const oldDateB = new Date(b.getAttribute('data-created'));
                        return oldDateA - oldDateB;
                        
                    case 'views':
                        // 조회순
                        const viewsA = parseInt(a.getAttribute('data-views')) || 0;
                        const viewsB = parseInt(b.getAttribute('data-views')) || 0;
                        return viewsB - viewsA;
                        
                    case 'likes':
                        // 추천순
                        const likesA = parseInt(a.getAttribute('data-likes')) || 0;
                        const likesB = parseInt(b.getAttribute('data-likes')) || 0;
                        return likesB - likesA;
                        
                    default:
                        return 0;
                }
            });
            
            // 정렬된 순서로 DOM 재배치
            rows.forEach(row => {
                elements.tableBody.appendChild(row);
            });
            
            // 정렬 애니메이션 효과
            rows.forEach((row, index) => {
                row.style.opacity = '0.5';
                setTimeout(() => {
                    row.style.opacity = '1';
                    row.style.transition = 'opacity 0.2s ease';
                }, index * 30);
            });
        });
    }

    // 테이블 행 호버 효과 (간단한)
    function setupRowEffects() {
        const postRows = document.querySelectorAll('.post-item');
        
        postRows.forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f8f9fa';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
        });
    }

    // 페이지 로드 완료 메시지
    function showLoadedMessage() {
        const totalPosts = elements.postItems.length;
        if (totalPosts > 0) {
            console.log(`내가 쓴 글 페이지 로드 완료: ${totalPosts}개 게시글`);
        }
    }

    // 초기화 함수
    function init() {
        setupFilterButtons();
        setupSorting();
        setupRowEffects();
        showLoadedMessage();
        
        console.log('내가 쓴 글 페이지 JavaScript 초기화 완료');
    }

    // 초기화 실행
    init();
});