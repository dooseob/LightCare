/**
 * 시설 이미지 SEO 키워드 관리 JavaScript
 * 파일명 영문변환 및 키워드 추가 기능
 */

console.log('🎯 시설 이미지 SEO 키워드 관리 스크립트 로드됨');

// 전역 변수
window.facilityImageSEO = window.facilityImageSEO || {
    currentFileName: '',
    availableKeywords: [],
    selectedKeywords: []
};

// 확장된 키워드 목록
const FACILITY_KEYWORDS = {
    // 시설 종류
    facility: ['시설', 'facility', 'care facility'],
    nursing_home: ['요양원', 'nursing home', 'senior care'],
    hospital: ['병원', 'hospital', 'medical center'],
    daycare: ['데이케어', 'daycare', 'day center'],
    
    // 공간 - 기본
    exterior: ['외관', 'exterior', 'building exterior', 'facade'],
    interior: ['내부', 'interior', 'inside', 'indoor'],
    lobby: ['로비', 'lobby', 'reception area', 'entrance hall'],
    corridor: ['복도', 'corridor', 'hallway', 'passage'],
    entrance: ['입구', 'entrance', 'front door', 'main entrance'],
    
    // 공간 - 거주
    room: ['방', 'room', 'resident room'],
    bedroom: ['침실', 'bedroom', 'sleeping room'],
    living_room: ['생활실', 'living room', 'common area'],
    private_room: ['개인실', 'private room', 'single room'],
    shared_room: ['다인실', 'shared room', 'multi-bed room'],
    
    // 공간 - 생활
    dining_room: ['식당', 'dining room', 'cafeteria', 'meal area'],
    kitchen: ['주방', 'kitchen', 'cooking area'],
    cafe: ['카페', 'cafe', 'coffee shop'],
    restroom: ['화장실', 'restroom', 'bathroom', 'toilet'],
    laundry: ['세탁실', 'laundry room', 'washing area'],
    
    // 공간 - 의료
    medical_room: ['의무실', 'medical room', 'clinic room'],
    treatment_room: ['치료실', 'treatment room', 'therapy room'],
    consultation_room: ['상담실', 'consultation room', 'counseling room'],
    nurses_station: ['간호사실', 'nurses station', 'nursing desk'],
    pharmacy: ['약국', 'pharmacy', 'medication room'],
    
    // 공간 - 재활/운동
    rehabilitation_room: ['재활실', 'rehabilitation room', 'rehab center'],
    physical_therapy_room: ['물리치료실', 'physical therapy room', 'PT room'],
    exercise_room: ['운동실', 'exercise room', 'fitness room'],
    gym: ['헬스장', 'gym', 'fitness center'],
    pool: ['수영장', 'swimming pool', 'aquatic therapy'],
    
    // 공간 - 활동
    program_room: ['프로그램실', 'program room', 'activity room'],
    auditorium: ['강당', 'auditorium', 'assembly hall'],
    library: ['도서실', 'library', 'reading room'],
    music_room: ['음악실', 'music room', 'music therapy'],
    art_room: ['미술실', 'art room', 'craft room'],
    recreation_room: ['오락실', 'recreation room', 'game room'],
    
    // 공간 - 외부
    garden: ['정원', 'garden', 'outdoor garden'],
    yard: ['마당', 'yard', 'courtyard'],
    terrace: ['테라스', 'terrace', 'outdoor terrace'],
    balcony: ['발코니', 'balcony', 'outdoor balcony'],
    parking_lot: ['주차장', 'parking lot', 'parking area'],
    walking_path: ['산책로', 'walking path', 'garden path'],
    
    // 서비스
    nursing: ['간호', 'nursing care', 'nursing service'],
    care: ['간병', 'care service', 'patient care'],
    treatment: ['치료', 'treatment', 'medical treatment'],
    rehabilitation: ['재활', 'rehabilitation', 'rehab service'],
    health_care: ['건강관리', 'health care', 'health management'],
    
    // 특징
    clean: ['깨끗한', 'clean', 'hygienic'],
    bright: ['밝은', 'bright', 'well-lit'],
    spacious: ['넓은', 'spacious', 'roomy'],
    safe: ['안전한', 'safe', 'secure'],
    comfortable: ['편안한', 'comfortable', 'cozy'],
    modern: ['현대적', 'modern', 'contemporary'],
    premium: ['고급', 'premium', 'luxury'],
    
    // 시간
    morning: ['아침', 'morning', 'AM'],
    lunch: ['점심', 'lunch', 'noon'],
    evening: ['저녁', 'evening', 'PM'],
    
    // 층수/위치
    first_floor: ['1층', 'first floor', 'ground floor'],
    second_floor: ['2층', 'second floor'],
    front: ['앞', 'front', 'front view'],
    back: ['뒤', 'back', 'rear view']
};

// 키워드 카테고리
const KEYWORD_CATEGORIES = {
    '시설 종류': ['facility', 'nursing_home', 'hospital', 'daycare'],
    '기본 공간': ['exterior', 'interior', 'lobby', 'corridor', 'entrance'],
    '거주 공간': ['room', 'bedroom', 'living_room', 'private_room', 'shared_room'],
    '생활 공간': ['dining_room', 'kitchen', 'cafe', 'restroom', 'laundry'],
    '의료 공간': ['medical_room', 'treatment_room', 'consultation_room', 'nurses_station', 'pharmacy'],
    '재활/운동': ['rehabilitation_room', 'physical_therapy_room', 'exercise_room', 'gym', 'pool'],
    '활동 공간': ['program_room', 'auditorium', 'library', 'music_room', 'art_room', 'recreation_room'],
    '외부 공간': ['garden', 'yard', 'terrace', 'balcony', 'parking_lot', 'walking_path'],
    '서비스': ['nursing', 'care', 'treatment', 'rehabilitation', 'health_care'],
    '특징': ['clean', 'bright', 'spacious', 'safe', 'comfortable', 'modern', 'premium'],
    '시간/위치': ['morning', 'lunch', 'evening', 'first_floor', 'second_floor', 'front', 'back']
};

// Alt 태그 자동 생성 (새로 추가)
function generateAutoAltText(imageIndex = 0) {
    console.log('🏷️ Alt 태그 자동 생성 시작 - 이미지 인덱스:', imageIndex);
    
    const altTextInput = document.getElementById('altText');
    if (!altTextInput) {
        console.warn('⚠️ Alt 텍스트 입력 필드를 찾을 수 없습니다');
        return '';
    }
    
    // 시설명 가져오기 (여러 방법 시도)
    let facilityName = '';
    const facilityMeta = document.querySelector('meta[name="facility-name"]');
    if (facilityMeta) {
        facilityName = facilityMeta.getAttribute('content');
    }
    
    if (!facilityName) {
        facilityName = '시설';
    }
    
    // 현재 선택된 키워드 확인
    const selectedKeywords = Array.from(document.querySelectorAll('.keyword-btn.btn-success'))
        .map(btn => btn.dataset.keyword || btn.textContent.trim())
        .filter(keyword => keyword);
    
    // 파일명에서 키워드 추출
    const fileNameInput = document.getElementById('seoFileName') || document.getElementById('imageNameInput');
    let fileKeywords = [];
    if (fileNameInput && fileNameInput.value) {
        fileKeywords = fileNameInput.value.toLowerCase().split(/[-_]/)
            .filter(part => part.length > 1);
    }
    
    // Alt 텍스트 조합
    let altText = facilityName;
    
    if (selectedKeywords.length > 0) {
        altText += ' ' + selectedKeywords.join(' ');
    } else if (fileKeywords.length > 0) {
        altText += ' ' + fileKeywords.slice(0, 2).join(' ');
    }
    
    altText += ' 사진';
    
    if (imageIndex > 0) {
        altText += ` ${imageIndex + 1}`;
    }
    
    // Alt 텍스트 설정
    altTextInput.value = altText;
    
    console.log('✅ Alt 태그 자동 생성 완료:', altText);
    return altText;
}

// 파일명에 키워드 추가 (확장자 위치 수정)
function addKeywordToFileName(keyword) {
    console.log('🏷️ 키워드 추가:', keyword);
    
    const fileNameInput = document.getElementById('seoFileName') || 
                         document.getElementById('imageNameInput') ||
                         document.querySelector('input[name*="fileName"]');
    
    if (!fileNameInput) {
        console.warn('⚠️ 파일명 입력 필드를 찾을 수 없습니다');
        return;
    }
    
    const currentValue = fileNameInput.value.trim();
    let newValue;
    
    if (currentValue === '' || !currentValue.includes(keyword)) {
        // 확장자 분리하여 올바른 위치에 키워드 추가
        const lastDotIndex = currentValue.lastIndexOf('.');
        if (lastDotIndex > 0) {
            const nameWithoutExt = currentValue.substring(0, lastDotIndex);
            const extension = currentValue.substring(lastDotIndex);
            newValue = `${nameWithoutExt}-${keyword}${extension}`;
            console.log('✅ 확장자 고려하여 키워드 추가:', `${nameWithoutExt} + ${keyword} + ${extension}`);
        } else {
            newValue = `${currentValue}-${keyword}`;
            console.log('✅ 확장자 없이 키워드 추가:', newValue);
        }
    } else {
        newValue = currentValue;
        console.log('ℹ️ 이미 포함된 키워드:', keyword);
    }
    
    fileNameInput.value = newValue;
    window.facilityImageSEO.currentFileName = newValue;
    
    // 파일명 미리보기 업데이트
    updateFileNamePreview();
    
    // Alt 태그 자동 업데이트
    generateAutoAltText();
    
    // 시각적 피드백
    showKeywordAddedFeedback(keyword);
}

// 파일명에서 키워드 제거
function removeKeywordFromFileName(keyword) {
    console.log('🗑️ 키워드 제거:', keyword);
    
    const fileNameInput = document.getElementById('seoFileName') || 
                         document.getElementById('imageNameInput') ||
                         document.querySelector('input[name*="fileName"]');
    
    if (!fileNameInput) return;
    
    let currentValue = fileNameInput.value.trim();
    
    // 키워드 제거 (다양한 패턴 고려)
    const patterns = [
        `-${keyword}`,
        `_${keyword}`,
        `${keyword}-`,
        `${keyword}_`,
        keyword
    ];
    
    for (const pattern of patterns) {
        currentValue = currentValue.replace(pattern, '');
    }
    
    // 연속된 구분자 정리
    currentValue = currentValue.replace(/[-_]{2,}/g, '-').replace(/^[-_]+|[-_]+$/g, '');
    
    fileNameInput.value = currentValue;
    window.facilityImageSEO.currentFileName = currentValue;
    
    updateFileNamePreview();
    console.log('✅ 키워드 제거 완료:', currentValue);
}

// 키워드 선택 UI 생성
function createKeywordSelector(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('⚠️ 키워드 선택기 컨테이너를 찾을 수 없습니다:', containerId);
        return;
    }
    
    let html = '<div class="keyword-selector">';
    html += '<h6><i class="fas fa-tags me-2"></i>SEO 키워드 선택</h6>';
    html += '<small class="text-muted mb-3 d-block">파일명에 추가할 키워드를 선택하세요 (검색 최적화)</small>';
    
    // 카테고리별 키워드 표시
    for (const [categoryName, keywords] of Object.entries(KEYWORD_CATEGORIES)) {
        html += `<div class="keyword-category mb-3">`;
        html += `<h6 class="small fw-bold text-secondary mb-2">${categoryName}</h6>`;
        html += `<div class="keyword-buttons">`;
        
        keywords.forEach(keywordKey => {
            const keywordData = FACILITY_KEYWORDS[keywordKey];
            if (keywordData) {
                const [korean, english, description] = keywordData;
                html += `
                    <button type="button" class="btn btn-outline-primary btn-sm keyword-btn me-1 mb-1" 
                            onclick="addKeywordToFileName('${english}')"
                            title="${description || english}"
                            data-keyword="${english}">
                        ${korean} (${english})
                    </button>
                `;
            }
        });
        
        html += `</div></div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    console.log('✅ 키워드 선택기 생성 완료');
}

// 키워드 드롭다운 생성 (키보드 단축키 대신)
function createKeywordDropdown(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = `
        <div class="dropdown">
            <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" 
                    data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-keyboard me-1"></i>빠른 키워드
            </button>
            <ul class="dropdown-menu">
                <li><h6 class="dropdown-header">자주 사용하는 키워드</h6></li>
    `;
    
    const frequentKeywords = [
        'exterior', 'interior', 'lobby', 'room', 'dining_room', 
        'clean', 'bright', 'safe', 'modern', 'comfortable'
    ];
    
    frequentKeywords.forEach(keywordKey => {
        const keywordData = FACILITY_KEYWORDS[keywordKey];
        if (keywordData) {
            const [korean, english] = keywordData;
            html += `
                <li>
                    <a class="dropdown-item" href="#" onclick="addKeywordToFileName('${english}'); return false;">
                        <small>${korean}</small><br>
                        <code class="small">${english}</code>
                    </a>
                </li>
            `;
        }
    });
    
    html += `
                <li><hr class="dropdown-divider"></li>
                <li>
                    <a class="dropdown-item" href="#" onclick="showAllKeywords(); return false;">
                        <i class="fas fa-list me-1"></i>전체 키워드 보기
                    </a>
                </li>
            </ul>
        </div>
    `;
    
    container.innerHTML = html;
}

// 파일명 미리보기 업데이트
function updateFileNamePreview() {
    const previewElement = document.getElementById('fileNamePreview') ||
                          document.getElementById('previewFileName') ||
                          document.querySelector('.filename-preview');
    
    if (previewElement) {
        const fileName = window.facilityImageSEO.currentFileName || 'example-image.jpg';
        previewElement.textContent = fileName;
        previewElement.style.color = '#17a2b8';
        previewElement.style.fontFamily = 'Monaco, Consolas, monospace';
    }
}

// 키워드 추가 피드백
function showKeywordAddedFeedback(keyword) {
    // 임시 알림 표시
    const feedback = document.createElement('div');
    feedback.className = 'alert alert-success alert-dismissible fade show position-fixed';
    feedback.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    feedback.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>키워드 추가됨: <strong>${keyword}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(feedback);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.remove();
        }
    }, 3000);
    
    // 버튼 시각적 효과
    const button = document.querySelector(`[data-keyword="${keyword}"]`);
    if (button) {
        button.classList.add('btn-success');
        button.classList.remove('btn-outline-primary');
        
        setTimeout(() => {
            button.classList.remove('btn-success');
            button.classList.add('btn-outline-primary');
        }, 1000);
    }
}

// 전체 키워드 모달 표시
function showAllKeywords() {
    // 모달이 없으면 생성
    if (!document.getElementById('keywordModal')) {
        createKeywordModal();
    }
    
    // Bootstrap 모달 표시
    const modal = new bootstrap.Modal(document.getElementById('keywordModal'));
    modal.show();
}

// 키워드 모달 생성
function createKeywordModal() {
    const modalHtml = `
        <div class="modal fade" id="keywordModal" tabindex="-1" aria-labelledby="keywordModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="keywordModalLabel">
                            <i class="fas fa-tags me-2"></i>전체 SEO 키워드 목록
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="keywordModalBody">
                        <!-- 키워드 내용이 여기에 동적으로 삽입됨 -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 모달 내용 생성
    createKeywordSelector('keywordModalBody');
}

// 파일명 영문 변환 (프론트엔드)
function convertKoreanFileName(koreanName) {
    if (!koreanName || koreanName.trim() === '') {
        return 'facility-image';
    }
    
    let result = koreanName.toLowerCase().trim();
    
    // 의미 있는 키워드 변환
    for (const [key, values] of Object.entries(FACILITY_KEYWORDS)) {
        const [korean, english] = values;
        result = result.replace(korean, english);
    }
    
    // 특수문자 제거 및 정리
    result = result.replace(/[^a-zA-Z0-9가-힣\s\-_.]/g, '')
                   .replace(/\s+/g, '-')
                   .replace(/[-_]{2,}/g, '-')
                   .replace(/^[-_]+|[-_]+$/g, '');
    
    // 한글이 남아있으면 로마자 변환 (간단)
    if (/[가-힣]/.test(result)) {
        result = 'korean-' + Date.now() % 10000;
    }
    
    return result || 'facility-image';
}

// 전역 함수로 노출
window.addKeywordToFileName = addKeywordToFileName;
window.removeKeywordFromFileName = removeKeywordFromFileName;
window.createKeywordSelector = createKeywordSelector;
window.createKeywordDropdown = createKeywordDropdown;
window.updateFileNamePreview = updateFileNamePreview;
window.showAllKeywords = showAllKeywords;
window.convertKoreanFileName = convertKoreanFileName;

console.log('✅ 시설 이미지 SEO 키워드 관리 스크립트 완전 로드됨');
console.log('📋 사용 가능한 키워드 카테고리:', Object.keys(KEYWORD_CATEGORIES).length, '개');
console.log('🏷️ 총 키워드 수:', Object.keys(FACILITY_KEYWORDS).length, '개');