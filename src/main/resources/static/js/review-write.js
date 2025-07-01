// 리뷰 작성 페이지 JavaScript
// 팀원 D 담당 - 완전히 분리된 JavaScript 파일

document.addEventListener('DOMContentLoaded', function() {
    // 상수 정의
    const RATING_TEXTS = ['', '매우 불만족', '불만족', '보통', '만족', '매우 만족'];
    const MIN_CONTENT_LENGTH = 10;
    const MAX_CONTENT_LENGTH = 2000;

    // DOM 요소 선택
    const elements = {
        form: document.getElementById('reviewForm'),
        facilitySelect: document.getElementById('facilitySelect'),
        facilityId: document.getElementById('facilityId'),
        title: document.getElementById('title'),
        content: document.getElementById('content'),
        contentLength: document.getElementById('contentLength'),
        overallRating: document.getElementById('overallRating'),
        ratingValue: document.getElementById('ratingValue'),
        ratingText: document.getElementById('ratingText'),
        submitButton: document.getElementById('submitButton'),
        detailedRatings: document.querySelectorAll('.detailed-rating')
    };

    // 디버깅: DOM 요소 확인
    console.log('별점 관련 DOM 요소:', {
        overallRating: elements.overallRating,
        ratingValue: elements.ratingValue,
        ratingText: elements.ratingText,
        detailedRatings: elements.detailedRatings,
        detailedRatingsCount: elements.detailedRatings.length
    });

    // 세부 평점 컨테이너 확인
    elements.detailedRatings.forEach((container, index) => {
        console.log(`세부 평점 컨테이너 ${index + 1}:`, {
            container: container,
            field: container.dataset.field,
            stars: container.querySelectorAll('.star').length,
            ratingGroup: container.closest('.rating-group'),
            inputElement: container.closest('.rating-group')?.querySelector('.detailed-rating-input')
        });
    });

    // 별점 UI 업데이트 함수
    function updateStars(container, rating) {
        if (!container) {
            console.warn('별점 컨테이너가 없습니다.');
            return;
        }

        console.log('별점 업데이트:', { container, rating });
        const stars = container.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // 시설 선택 이벤트 핸들러
    if (elements.facilitySelect) {
        elements.facilitySelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const facilityId = this.value;
            const status = selectedOption.dataset.status;

            console.log('시설 선택:', { facilityId, status });

            // 시설 ID 설정
            if (elements.facilityId) {
                elements.facilityId.value = facilityId;
            }

            // 시설 상태에 따른 처리
            if (facilityId && status !== '정상') {
                alert('선택할 수 없는 시설입니다: ' + status);
                this.value = '';
                if (elements.facilityId) {
                    elements.facilityId.value = '';
                }
            }
        });
    }

    // 내용 길이 체크 및 표시
    if (elements.content && elements.contentLength) {
        elements.content.addEventListener('input', function() {
            const length = this.value.trim().length;
            elements.contentLength.textContent = length;

            // 길이 유효성 표시
            if (length < MIN_CONTENT_LENGTH) {
                elements.contentLength.classList.remove('text-success');
                elements.contentLength.classList.add('text-danger');
            } else if (length > MAX_CONTENT_LENGTH) {
                elements.contentLength.classList.remove('text-success');
                elements.contentLength.classList.add('text-danger');
            } else {
                elements.contentLength.classList.remove('text-danger');
                elements.contentLength.classList.add('text-success');
            }
        });

        // 초기 내용 길이 표시
        elements.content.dispatchEvent(new Event('input'));
    }

    // 전체 평점 이벤트 핸들러
    if (elements.overallRating) {
        const stars = elements.overallRating.querySelectorAll('.star');
        
        // 별점 클릭 이벤트
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                console.log('전체 평점 클릭:', { rating, target: this });

                // hidden input 업데이트
                elements.ratingValue.value = rating;
                
                // UI 업데이트
                updateStars(elements.overallRating, rating);
                elements.ratingText.textContent = RATING_TEXTS[rating];

                console.log('전체 평점 업데이트 완료:', {
                    rating,
                    text: RATING_TEXTS[rating],
                    inputValue: elements.ratingValue.value
                });
            });

            // 마우스 오버 이벤트
            star.addEventListener('mouseover', function() {
                const rating = parseInt(this.dataset.rating);
                updateStars(elements.overallRating, rating);
                elements.ratingText.textContent = RATING_TEXTS[rating];
            });

            // 마우스 아웃 이벤트
            star.addEventListener('mouseout', function() {
                const rating = parseInt(elements.ratingValue.value) || 0;
                updateStars(elements.overallRating, rating);
                elements.ratingText.textContent = rating ? RATING_TEXTS[rating] : '평점을 선택해주세요';
            });
        });

        // 초기 평점이 있는 경우 UI 업데이트
        const initialRating = parseInt(elements.ratingValue.value);
        if (!isNaN(initialRating) && initialRating >= 1 && initialRating <= 5) {
            console.log('초기 평점 설정:', initialRating);
            updateStars(elements.overallRating, initialRating);
            elements.ratingText.textContent = RATING_TEXTS[initialRating];
        }
    }

    // 세부 평점 이벤트 핸들러
    elements.detailedRatings.forEach(container => {
        const stars = container.querySelectorAll('.star');
        // rating-group에서 input 찾기 (HTML 구조: rating-group > d-flex > detailed-rating)
        const ratingGroup = container.closest('.rating-group');
        const input = ratingGroup ? ratingGroup.querySelector('.detailed-rating-input') : null;
        
        console.log('세부 평점 초기화:', {
            container: container,
            field: container.dataset.field,
            ratingGroup: ratingGroup,
            input: input,
            stars: stars.length
        });
        
        stars.forEach(star => {
            // 클릭 이벤트
            star.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const rating = parseInt(this.dataset.rating);
                console.log('세부 평점 클릭:', {
                    rating,
                    field: container.dataset.field,
                    target: this,
                    input: input
                });

                // hidden input 업데이트
                if (input) {
                    input.value = rating;
                    console.log('세부 평점 입력값 업데이트:', {
                        field: container.dataset.field,
                        rating,
                        inputValue: input.value,
                        inputName: input.name
                    });
                } else {
                    console.error('세부 평점 input을 찾을 수 없습니다:', container.dataset.field);
                }
                
                // UI 업데이트
                updateStars(container, rating);
            });

            // 마우스 오버 이벤트
            star.addEventListener('mouseover', function() {
                const rating = parseInt(this.dataset.rating);
                updateStars(container, rating);
            });

            // 마우스 아웃 이벤트
            star.addEventListener('mouseout', function() {
                const rating = parseInt(input?.value) || 0;
                updateStars(container, rating);
            });
        });

        // 초기 세부 평점이 있는 경우 UI 업데이트
        if (input && input.value) {
            const initialRating = parseInt(input.value);
            if (!isNaN(initialRating) && initialRating >= 1 && initialRating <= 5) {
                console.log('초기 세부 평점 설정:', {
                    field: container.dataset.field,
                    rating: initialRating
                });
                updateStars(container, initialRating);
            }
        }
    });

    // 폼 제출 전 검증
    if (elements.form) {
        elements.form.addEventListener('submit', function(e) {
            e.preventDefault();

            // 시설 선택 검증
            if (!elements.facilityId.value) {
                alert('시설을 선택해주세요.');
                if (elements.facilitySelect) {
                    elements.facilitySelect.focus();
                }
                return;
            }

            // 제목 검증
            if (!elements.title.value.trim()) {
                alert('제목을 입력해주세요.');
                elements.title.focus();
                return;
            }

            // 전체 평점 검증
            if (!elements.ratingValue.value) {
                alert('전체 평점을 선택해주세요.');
                elements.overallRating.scrollIntoView({ behavior: 'smooth' });
                return;
            }

            // 내용 길이 검증
            const contentLength = elements.content.value.trim().length;
            if (contentLength < MIN_CONTENT_LENGTH) {
                alert(`내용을 ${MIN_CONTENT_LENGTH}자 이상 입력해주세요.`);
                elements.content.focus();
                return;
            }

            if (contentLength > MAX_CONTENT_LENGTH) {
                alert(`내용은 ${MAX_CONTENT_LENGTH}자를 초과할 수 없습니다.`);
                elements.content.focus();
                return;
            }

            // 모든 검증 통과 시 폼 제출
            this.submit();
        });
    }
}); 