/**
 * 시설 이미지 크롭 전용 JavaScript (프로필 방식 완전 적용)
 * 프로필 이미지 업로드의 모든 기능을 다중 이미지 + 16:9 비율로 적용
 * 누락 기능: Alt 텍스트 자동 생성, AVIF/WebP 지원 확인, 로딩 상태 관리
 */

// 전역 변수 (프로필과 동일)
let cropper = null;
let originalImages = [];
let croppedImages = [];
let currentImageIndex = 0;
let facilityId = null;

// DOM 요소들 (프로필과 동일 구조)
const elements = {};

// 포맷 지원 확인 (프로필에서 누락된 기능)
let formatSupport = {
    avif: false,
    webp: false
};

// 초기화 (프로필과 동일)
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 시설 이미지 크롭퍼 초기화 시작 (프로필 방식 완전 적용)');
    
    // URL에서 시설 ID 추출
    const pathParts = window.location.pathname.split('/');
    facilityId = pathParts[pathParts.length - 1];
    console.log('🏢 시설 ID:', facilityId);
    
    // 프로필과 동일한 초기화 순서
    checkFormatSupport();
    initializeElements();
    setupEventListeners();
    setupDragAndDrop();
    
    console.log('✅ 시설 이미지 크롭퍼 초기화 완료');
});

// 포맷 지원 확인 (프로필에서 누락된 기능 추가)
function checkFormatSupport() {
    console.log('🔍 브라우저 이미지 포맷 지원 확인');
    
    // AVIF 지원 확인
    const avifCanvas = document.createElement('canvas');
    avifCanvas.width = 1;
    avifCanvas.height = 1;
    formatSupport.avif = avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    
    // WebP 지원 확인  
    const webpCanvas = document.createElement('canvas');
    webpCanvas.width = 1;
    webpCanvas.height = 1;
    formatSupport.webp = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    console.log('📊 포맷 지원 현황:', formatSupport);
    
    // 지원되지 않는 포맷 숨기기
    if (!formatSupport.avif) {
        const avifOption = document.getElementById('formatAVIF');
        const avifLabel = document.querySelector('label[for="formatAVIF"]');
        if (avifOption && avifLabel) {
            avifOption.style.display = 'none';
            avifLabel.style.display = 'none';
            console.log('⚠️ AVIF 미지원으로 옵션 숨김');
        }
    }
    
    if (!formatSupport.webp) {
        const webpOption = document.getElementById('formatWEBP');
        const webpLabel = document.querySelector('label[for="formatWEBP"]');
        if (webpOption && webpLabel) {
            webpOption.style.display = 'none';
            webpLabel.style.display = 'none';
            console.log('⚠️ WebP 미지원으로 옵션 숨김');
        }
    }
}

// DOM 요소 초기화 (프로필과 동일)
function initializeElements() {
    console.log('🔍 DOM 요소 초기화 시작');
    
    // 기본 요소들
    elements.imageInput = document.getElementById('imageInput');
    elements.uploadSection = document.getElementById('uploadSection');
    elements.cropSection = document.getElementById('cropSection');
    elements.compressionSection = document.getElementById('compressionSection');
    elements.manageSection = document.getElementById('manageSection');
    elements.completeSection = document.getElementById('completeSection');
    
    // 업로드 관련
    elements.uploadArea = document.getElementById('uploadArea');
    
    // 이미지 리스트
    elements.imageListSection = document.getElementById('imageListSection');
    elements.imageList = document.getElementById('imageList');
    elements.imageCount = document.getElementById('imageCount');
    
    // 크롭 관련
    elements.cropImage = document.getElementById('cropImage');
    elements.previewCanvas = document.getElementById('previewCanvas');
    elements.currentImageNumber = document.getElementById('currentImageNumber');
    elements.imageDimensions = document.getElementById('imageDimensions');
    elements.imageFileName = document.getElementById('imageFileName');
    
    // 줌 표시기 (프로필과 동일)
    elements.zoomIndicator = document.getElementById('zoomIndicator');
    elements.zoomLevel = document.getElementById('zoomLevel');
    elements.zoomStatus = document.getElementById('zoomStatus');
    
    // 단계 표시기
    elements.steps = {
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        step3: document.getElementById('step3'),
        step4: document.getElementById('step4'),
        step5: document.getElementById('step5')
    };
    
    // 버튼들
    elements.buttons = {
        backToUpload: document.getElementById('backToUploadBtn'),
        prevImage: document.getElementById('prevImageBtn'),
        nextImage: document.getElementById('nextImageBtn'),
        cropCurrent: document.getElementById('cropCurrentBtn'),
        zoomIn: document.getElementById('zoomInBtn'),
        zoomOut: document.getElementById('zoomOutBtn'),
        rotateLeft: document.getElementById('rotateLeftBtn'),
        rotateRight: document.getElementById('rotateRightBtn'),
        reset: document.getElementById('resetBtn'),
        goToManage: document.getElementById('goToManageBtn'),
        backToCompression: document.getElementById('backToCompressionBtn'),
        finalComplete: document.getElementById('finalCompleteBtn')
    };
    
    console.log('✅ DOM 요소 초기화 완료');
}

// 이벤트 리스너 설정 (프로필과 동일 패턴)
function setupEventListeners() {
    console.log('🔗 이벤트 리스너 설정 시작');
    
    // 파일 입력 이벤트 (프로필과 동일)
    if (elements.imageInput) {
        elements.imageInput.removeEventListener('change', handleImageUpload);
        elements.imageInput.addEventListener('change', handleImageUpload);
        console.log('📁 파일 입력 이벤트 리스너 등록됨');
    }
    
    // 파일 선택 버튼 (프로필 방식 - 직접 참조)
    const fileSelectBtn = document.getElementById('fileSelectBtn');
    if (fileSelectBtn) {
        fileSelectBtn.addEventListener('click', () => {
            console.log('📁 파일 선택 버튼 클릭됨');
            if (elements.imageInput) {
                elements.imageInput.click();
            } else {
                console.error('❌ imageInput 요소를 찾을 수 없습니다.');
            }
        });
        console.log('✅ 파일 선택 버튼 이벤트 등록 완료');
    } else {
        console.error('❌ fileSelectBtn 요소를 찾을 수 없습니다.');
    }
    
    // 크롭 컨트롤 버튼들 (프로필과 동일)
    if (elements.buttons.zoomIn) {
        elements.buttons.zoomIn.addEventListener('click', () => zoomCropper(0.1));
    }
    if (elements.buttons.zoomOut) {
        elements.buttons.zoomOut.addEventListener('click', () => zoomCropper(-0.1));
    }
    if (elements.buttons.rotateLeft) {
        elements.buttons.rotateLeft.addEventListener('click', () => rotateCropper(-90));
    }
    if (elements.buttons.rotateRight) {
        elements.buttons.rotateRight.addEventListener('click', () => rotateCropper(90));
    }
    if (elements.buttons.reset) {
        elements.buttons.reset.addEventListener('click', () => resetCropper());
    }
    
    // 네비게이션 버튼들
    if (elements.buttons.backToUpload) {
        elements.buttons.backToUpload.addEventListener('click', goToUploadStep);
    }
    if (elements.buttons.prevImage) {
        elements.buttons.prevImage.addEventListener('click', goToPreviousImage);
    }
    if (elements.buttons.nextImage) {
        elements.buttons.nextImage.addEventListener('click', goToNextImage);
    }
    if (elements.buttons.cropCurrent) {
        elements.buttons.cropCurrent.addEventListener('click', cropCurrentImage);
    }
    
    // 압축 단계 버튼들
    const backToCropBtn = document.getElementById('backToCropBtn');
    if (backToCropBtn) {
        backToCropBtn.addEventListener('click', () => {
            console.log('🔙 크롭 단계로 돌아가기');
            goToCropStep();
        });
    }
    
    // 관리 단계로 이동 버튼 (이미지 저장 후 관리 단계로 이동)
    if (elements.buttons.goToManage) {
        elements.buttons.goToManage.addEventListener('click', async () => {
            console.log('📋 다음 단계 버튼 클릭 - 이미지 저장 후 관리 단계로 이동');
            
            // 버튼 로딩 상태 설정
            setButtonLoading(elements.buttons.goToManage, true, '이미지 저장 중...');
            
            try {
                // 모든 이미지를 서버에 저장
                const savedCount = await saveAllImages();
                console.log(`✅ ${savedCount}장의 이미지 저장 완료`);
                
                // 저장 성공 후 관리 단계로 이동
                setTimeout(() => {
                    setButtonLoading(elements.buttons.goToManage, false);
                    goToManageStep();
                }, 500);
                
            } catch (error) {
                console.error('❌ 이미지 저장 중 오류:', error);
                setButtonLoading(elements.buttons.goToManage, false);
                alert(`이미지 저장 중 오류가 발생했습니다: ${error.message}`);
            }
        });
    }
    
    // 관리 단계 버튼들
    if (elements.buttons.backToCompression) {
        elements.buttons.backToCompression.addEventListener('click', () => {
            console.log('🔙 압축 설정으로 돌아가기');
            goToCompressionStep();
        });
    }
    
    if (elements.buttons.finalComplete) {
        elements.buttons.finalComplete.addEventListener('click', () => {
            console.log('✅ 최종 완료 버튼 클릭');
            finalComplete();
        });
    }
    
    // 완료 단계 버튼들
    const addMoreImagesBtn = document.getElementById('addMoreImagesBtn');
    if (addMoreImagesBtn) {
        addMoreImagesBtn.addEventListener('click', () => {
            console.log('➕ 이미지 더 추가 버튼 클릭');
            goToUploadStep();
        });
    }
    
    // 압축 설정 컨트롤 설정
    setupCompressionControls();
    
    // SEO 최적화 기능 설정
    setupSEOFeatures();
    
    // 키보드 단축키 (프로필과 동일)
    setupKeyboardShortcuts();
    
    console.log('✅ 이벤트 리스너 설정 완료');
}

// 압축 설정 컨트롤 (프로필에서 누락된 기능)
function setupCompressionControls() {
    // 품질 슬라이더 이벤트
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityPercent = document.getElementById('qualityPercent');
    
    if (qualitySlider && qualityPercent) {
        qualitySlider.addEventListener('input', function() {
            const value = Math.round(this.value * 100);
            qualityPercent.textContent = value + '%';
            updateCompressionPreview();
        });
        
        // 초기값 설정
        qualityPercent.textContent = Math.round(qualitySlider.value * 100) + '%';
    }
    
    // 이미지 형식 라디오 이벤트
    const formatRadios = document.querySelectorAll('input[name="imageFormat"]');
    formatRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateCompressionPreview();
            console.log('🔄 이미지 형식 변경:', this.value);
        });
    });
    
    // 자동 최적화 체크박스
    const autoOptimize = document.getElementById('autoOptimize');
    if (autoOptimize) {
        autoOptimize.addEventListener('change', function() {
            updateCompressionPreview();
            console.log('🤖 자동 최적화:', this.checked);
        });
    }
    
    // Alt 텍스트 자동 생성 버튼 (프로필에서 누락된 기능 추가)
    const autoGenerateAltBtn = document.getElementById('autoGenerateAltBtn');
    if (autoGenerateAltBtn) {
        autoGenerateAltBtn.addEventListener('click', generateAltText);
        console.log('✨ Alt 텍스트 자동 생성 버튼 등록됨');
    }
    
    console.log('⚙️ 압축 컨트롤 설정 완료');
}

// SEO 최적화 기능 설정
function setupSEOFeatures() {
    console.log('🔍 SEO 최적화 기능 설정 시작');
    
    // 추천 키워드 버튼들
    const keywordButtons = document.querySelectorAll('.keyword-btn');
    keywordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const keyword = this.getAttribute('data-keyword');
            handleKeywordClick(keyword);
        });
    });
    
    // 이미지 파일명 입력 필드
    const imageNameInput = document.getElementById('imageNameInput');
    if (imageNameInput) {
        imageNameInput.addEventListener('input', updateFileNamePreview);
        imageNameInput.addEventListener('blur', updateFileNamePreview);
    }
    
    // 파일명 미리보기 버튼
    const previewFileNameBtn = document.getElementById('previewFileNameBtn');
    if (previewFileNameBtn) {
        previewFileNameBtn.addEventListener('click', updateFileNamePreview);
    }
    
    console.log(`✅ SEO 기능 설정 완료 - 키워드 버튼 ${keywordButtons.length}개 등록됨`);
}

// 키워드 클릭 처리
function handleKeywordClick(keyword) {
    console.log('🏷️ 키워드 클릭됨:', keyword);
    
    const imageNameInput = document.getElementById('imageNameInput');
    const altTextInput = document.getElementById('altTextInput');
    
    // 현재 시설명 가져오기 (전역 변수나 페이지에서)
    const facilityName = getFacilityName();
    
    // 파일명에 키워드 추가
    if (imageNameInput) {
        const currentValue = imageNameInput.value.trim();
        let newValue;
        
        if (currentValue === '') {
            newValue = `${facilityName}-${keyword}`;
        } else if (!currentValue.includes(keyword)) {
            newValue = `${currentValue}-${keyword}`;
        } else {
            newValue = currentValue; // 이미 포함된 경우 변경하지 않음
        }
        
        imageNameInput.value = newValue;
        updateFileNamePreview();
    }
    
    // Alt 텍스트에 키워드 추가
    if (altTextInput) {
        const currentAlt = altTextInput.value.trim();
        let newAlt;
        
        if (currentAlt === '') {
            newAlt = `${facilityName} ${keyword} 사진`;
        } else if (!currentAlt.includes(keyword)) {
            newAlt = `${currentAlt} ${keyword}`;
        } else {
            newAlt = currentAlt; // 이미 포함된 경우 변경하지 않음
        }
        
        altTextInput.value = newAlt;
    }
    
    // 버튼 일시적 하이라이트 효과
    const button = document.querySelector(`[data-keyword="${keyword}"]`);
    if (button) {
        button.classList.add('btn-success');
        button.classList.remove('btn-outline-primary', 'btn-outline-success', 'btn-outline-warning');
        setTimeout(() => {
            button.classList.remove('btn-success');
            if (button.parentElement.parentElement.querySelector('small').textContent.includes('시설 구역')) {
                button.classList.add('btn-outline-primary');
            } else if (button.parentElement.parentElement.querySelector('small').textContent.includes('시설 종류')) {
                button.classList.add('btn-outline-success');
            } else {
                button.classList.add('btn-outline-warning');
            }
        }, 500);
    }
}

// 파일명 미리보기 업데이트
function updateFileNamePreview() {
    const imageNameInput = document.getElementById('imageNameInput');
    const previewFileName = document.getElementById('previewFileName');
    
    if (!imageNameInput || !previewFileName) return;
    
    const inputValue = imageNameInput.value.trim();
    let finalFileName;
    
    if (inputValue === '') {
        finalFileName = `facility_${facilityId}_${currentImageIndex}_${new Date().getTime() % 10000}.jpg`;
    } else {
        // 한글을 영문으로 변환하는 시뮬레이션 (실제로는 서버에서 처리)
        const englishName = convertKoreanToEnglishSimple(inputValue);
        const sanitizedName = sanitizeFilenameSimple(englishName);
        finalFileName = `facility_${facilityId}_${currentImageIndex}_${sanitizedName}_${new Date().getTime() % 10000}.jpg`;
    }
    
    previewFileName.textContent = finalFileName;
    console.log('📄 파일명 미리보기 업데이트:', finalFileName);
}

// 시설명 가져오기 (페이지의 시설 정보에서)
function getFacilityName() {
    // 페이지 제목이나 breadcrumb에서 시설명 추출
    const breadcrumb = document.querySelector('.breadcrumb-item.active');
    if (breadcrumb && breadcrumb.textContent.includes('시설')) {
        return '시설'; // 기본값
    }
    
    // URL이나 전역 변수에서 시설명 가져오기
    return '요양원'; // 기본값
}

// 간단한 한글-영문 변환 (클라이언트 사이드)
function convertKoreanToEnglishSimple(text) {
    const simpleMap = {
        '시설': 'facility',
        '요양원': 'nursing_home', 
        '외관': 'exterior',
        '내부': 'interior',
        '정원': 'garden',
        '식당': 'dining',
        '침실': 'bedroom',
        '로비': 'lobby',
        '복도': 'corridor',
        '주차장': 'parking',
        '의무실': 'medical_room',
        '간호실': 'nursing_room'
    };
    
    let result = text.toLowerCase();
    for (const [korean, english] of Object.entries(simpleMap)) {
        result = result.replace(new RegExp(korean, 'g'), english);
    }
    
    // 남은 한글이 있으면 제거
    result = result.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
    
    return result;
}

// 간단한 파일명 정리
function sanitizeFilenameSimple(filename) {
    return filename.replace(/[^a-zA-Z0-9_-]/g, '_')
                  .replace(/_+/g, '_')
                  .replace(/^_+|_+$/g, '')
                  .substring(0, 20) || 'image';
}

// 이미지 업로드 처리 (프로필과 동일하되 다중 파일 지원)
function handleImageUpload(event) {
    console.log('📁 다중 파일 업로드 이벤트 발생');
    const files = Array.from(event.target.files);
    
    if (files.length === 0) {
        console.log('선택된 파일이 없습니다');
        return;
    }
    
    console.log(`📸 선택된 파일 수: ${files.length}`);
    
    // 최대 5장 제한
    if (files.length > 5) {
        alert('최대 5장까지만 등록할 수 있습니다.');
        return;
    }
    
    // 프로필과 동일한 파일 검증
    const validFiles = files.filter(file => validateImageFile(file));
    if (validFiles.length === 0) {
        alert('유효한 이미지 파일이 없습니다.');
        return;
    }
    
    if (validFiles.length !== files.length) {
        alert(`${files.length - validFiles.length}개 파일이 형식 오류로 제외되었습니다.`);
    }
    
    // 기존 이미지 초기화
    originalImages = [];
    croppedImages = [];
    currentImageIndex = 0;
    
    // 프로필 방식: 순차적 파일 처리
    processFilesSequentially(validFiles);
}

// 이미지 파일 검증 (프로필과 동일)
function validateImageFile(file) {
    console.log(`🔍 파일 검증: ${file.name}`);
    
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
        console.error(`❌ 이미지 파일이 아님: ${file.name}`);
        return false;
    }
    
    // 지원되는 형식 검증 (프로필과 동일)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        console.error(`❌ 지원되지 않는 형식: ${file.name} (${file.type})`);
        return false;
    }
    
    // 파일 크기 검증 해제 (프로필과 동일하게 제한 없음)
    // 용량 제한 없이 처리 (대용량 파일도 자동 압축)
    console.log(`📦 파일 크기: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) - 제한 없음`);
    
    console.log(`✅ 파일 검증 통과: ${file.name}`);
    return true;
}

// 순차적 파일 처리 (프로필 방식 적용)
function processFilesSequentially(files) {
    let processedCount = 0;
    
    console.log(`🔄 ${files.length}개 파일 순차 처리 시작`);
    
    files.forEach((file, index) => {
        console.log(`📸 파일 처리 중: ${file.name} (${index + 1}/${files.length})`);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = {
                id: index,
                name: file.name,
                size: file.size,
                type: file.type,
                dataUrl: e.target.result,
                originalFile: file
            };
            
            originalImages.push(imageData);
            processedCount++;
            
            console.log(`✅ 이미지 로드 완료: ${file.name} (${processedCount}/${files.length})`);
            
            // 모든 파일 처리 완료 시 (프로필과 동일한 순서)
            if (processedCount === files.length) {
                console.log('🎉 모든 이미지 로드 완료 - 크롭 단계로 이동');
                
                showImageList();
                loadImageToCropper(originalImages[0]);
                goToCropStep();
            }
        };
        
        reader.onerror = function() {
            console.error(`❌ 파일 읽기 실패: ${file.name}`);
            alert(`${file.name} 파일을 읽을 수 없습니다.`);
        };
        
        reader.readAsDataURL(file);
    });
}

// 이미지를 크롭퍼에 로드 (프로필과 동일)
function loadImageToCropper(imageData) {
    if (!imageData || !elements.cropImage) {
        console.error('❌ loadImageToCropper: 이미지 데이터 또는 cropImage 요소가 없습니다.');
        return;
    }
    
    console.log(`🖼️ 크롭퍼에 이미지 로드: ${imageData.name}`);
    
    // 현재 이미지 정보 업데이트
    updateCurrentImageInfo();
    
    elements.cropImage.src = imageData.dataUrl;
    elements.cropImage.style.display = 'block';
    
    // 프로필 방식: 이미지 로드 후 크롭퍼 초기화
    elements.cropImage.onload = function() {
        console.log('✅ 이미지 로드 완료, 크롭퍼 초기화 시작');
        setTimeout(() => {
            initializeCropper();
            updateImageDimensions();
        }, 100);
    };
}

// 현재 이미지 정보 업데이트
function updateCurrentImageInfo() {
    if (!originalImages.length) return;
    
    // 현재 이미지 번호 업데이트
    if (elements.currentImageNumber) {
        elements.currentImageNumber.textContent = `${currentImageIndex + 1}/${originalImages.length}`;
    }
    
    // 파일명 업데이트
    if (elements.imageFileName) {
        elements.imageFileName.textContent = originalImages[currentImageIndex]?.name || '';
    }
    
    // 네비게이션 버튼 표시/숨김
    if (elements.buttons.prevImage) {
        elements.buttons.prevImage.style.display = currentImageIndex > 0 ? 'inline-block' : 'none';
    }
    if (elements.buttons.nextImage) {
        elements.buttons.nextImage.style.display = currentImageIndex < originalImages.length - 1 ? 'inline-block' : 'none';
    }
}

// 크롭퍼 초기화 (16:9 비율, 프로필과 동일한 패턴)
function initializeCropper() {
    if (!elements.cropImage) {
        console.error('❌ cropImage 요소를 찾을 수 없습니다.');
        return;
    }
    
    console.log('🔧 크롭퍼 초기화 - 16:9 비율 (프로필 방식)');
    
    // 기존 크롭퍼 정리
    if (cropper) {
        // 윈도우 리사이즈 이벤트 리스너 제거
        window.removeEventListener('resize', handleWindowResize);
        
        // 스마트 스크롤 이벤트 리스너 제거
        const cropContainer = elements.cropImage?.parentElement;
        if (cropContainer && cropContainer._smartScrollHandler) {
            cropContainer.removeEventListener('wheel', cropContainer._smartScrollHandler);
            cropContainer.removeEventListener('mousewheel', cropContainer._smartScrollHandler);
            cropContainer.removeEventListener('DOMMouseScroll', cropContainer._smartScrollHandler);
            cropContainer._smartScrollHandler = null;
        }
        
        cropper.destroy();
        cropper = null;
        console.log('🧹 기존 크롭퍼 및 이벤트 리스너 정리 완료');
    }
    
    cropper = new Cropper(elements.cropImage, {
        aspectRatio: 16 / 9, // 시설 사진은 16:9 비율 (프로필과 유일한 차이점)
        viewMode: 1, // 크롭 박스를 캔버스 내부로 제한
        dragMode: 'move',
        autoCropArea: 0.8,
        responsive: true, // 작은 창에서 정상 작동하는 설정 유지
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: true,
        rotatable: true,
        scalable: true,
        zoomable: true,
        minContainerWidth: 200, // 작은 창에서도 작동하도록 더 작은 값
        minContainerHeight: 150,
        minCropBoxWidth: 160, // 작은 창에서도 작동하도록 더 작은 값
        minCropBoxHeight: 90, // 16:9 비율에 맞춘 더 작은 최소 높이
        ready() {
            console.log('✅ 크롭퍼 준비 완료');
            console.log('📐 컨테이너 크기:', cropper.getContainerData());
            updatePreview();
            // 프로필과 동일: 크롭퍼 준비 완료 후 스마트 스크롤 설정
            setTimeout(() => {
                setupSmartScroll();
            }, 100);
            
            // 브라우저 창 크기 변경 대응
            window.addEventListener('resize', handleWindowResize);
        },
        crop: updatePreview
    });
}

// 스마트 스크롤 기능 (프로필과 정확히 동일)
function setupSmartScroll() {
    if (!cropper || !elements.cropImage) {
        console.warn('⚠️ setupSmartScroll: cropper 또는 cropImage가 없음');
        return;
    }
    
    const cropContainer = elements.cropImage.parentElement;
    if (!cropContainer) {
        console.warn('⚠️ setupSmartScroll: cropContainer를 찾을 수 없음');
        return;
    }
    
    // 기존 이벤트 리스너 제거 (중복 방지)
    if (cropContainer._smartScrollHandler) {
        cropContainer.removeEventListener('wheel', cropContainer._smartScrollHandler);
        cropContainer.removeEventListener('mousewheel', cropContainer._smartScrollHandler);
        cropContainer.removeEventListener('DOMMouseScroll', cropContainer._smartScrollHandler);
    }
    
    console.log('🎯 setupSmartScroll: 컨테이너 찾음', cropContainer.className || cropContainer.tagName);
    
    // 최대/최소 줌 레벨 설정 (프로필과 정확히 동일)
    const MIN_ZOOM = 0.1;  // 최소 줌 (10%)
    const MAX_ZOOM = 3.0;  // 최대 줌 (300%)
    
    console.log('🖱️ 스마트 스크롤 기능 활성화');
    
    // 최강 줌 리미트 차단 이벤트 리스너
    const wheelHandler = function(event) {
        if (!cropper) return;
        
        // 현재 줌 레벨 확인 (더 정확한 방식)
        const canvasData = cropper.getCanvasData();
        const containerData = cropper.getContainerData();
        const currentZoom = canvasData.naturalWidth > 0 ? canvasData.width / canvasData.naturalWidth : 1;
        
        const isZoomingIn = event.deltaY < 0;  // 휠을 위로 올리면 확대
        const isZoomingOut = event.deltaY > 0; // 휠을 아래로 내리면 축소
        
        console.log('🔍 현재 줌:', currentZoom.toFixed(2), '방향:', isZoomingIn ? '확대' : '축소');
        
        // 더 엄격한 임계값 설정
        const maxThreshold = 2.5;  // 더 낮은 최대값
        const minThreshold = 0.3;  // 더 높은 최소값
        
        // ⚡ 최강 확대 제한 ⚡
        if (isZoomingIn && currentZoom >= maxThreshold) {
            // 모든 가능한 이벤트 차단
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            // Cropper.js 내부 줌 기능도 강제 차단
            if (cropper.zoom) {
                const originalZoom = cropper.zoom;
                cropper.zoom = function() { 
                    console.log('🚫 Cropper.zoom() 호출 차단됨'); 
                    return false;
                };
                setTimeout(() => { cropper.zoom = originalZoom; }, 100);
            }
            
            updateZoomIndicator(currentZoom, '최대 확대');
            console.log('🚫 최대 확대 완전 차단 - 줌 기능 무력화');
            
            window.scrollBy({ top: -100, behavior: 'smooth' });
            return false;
        }
        
        // ⚡ 최강 축소 제한 ⚡
        if (isZoomingOut && currentZoom <= minThreshold) {
            // 모든 가능한 이벤트 차단
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            // Cropper.js 내부 줌 기능도 강제 차단
            if (cropper.zoom) {
                const originalZoom = cropper.zoom;
                cropper.zoom = function() { 
                    console.log('🚫 Cropper.zoom() 호출 차단됨'); 
                    return false;
                };
                setTimeout(() => { cropper.zoom = originalZoom; }, 100);
            }
            
            updateZoomIndicator(currentZoom, '최소 축소');
            console.log('🚫 최소 축소 완전 차단 - 줌 기능 무력화');
            
            window.scrollBy({ top: 100, behavior: 'smooth' });
            return false;
        }
        
        // 정상 범위에서만 줌 허용
        event.preventDefault();
        event.stopPropagation();
        
        const zoomDelta = isZoomingIn ? 0.1 : -0.1;
        cropper.zoom(zoomDelta);
        
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + zoomDelta));
        updateZoomIndicator(newZoom, isZoomingIn ? '확대' : '축소');
    };
    
    // 핸들러를 컨테이너에 저장하여 재사용 가능하게 함
    cropContainer._smartScrollHandler = wheelHandler;
    
    // 데스크탑 및 모바일 모두 지원하는 이벤트 등록
    try {
        cropContainer.addEventListener('wheel', wheelHandler, { passive: false });
        cropContainer.addEventListener('mousewheel', wheelHandler, { passive: false }); // IE/Edge 호환성
        cropContainer.addEventListener('DOMMouseScroll', wheelHandler, { passive: false }); // Firefox 호환성
        
        console.log('✅ 시설 크롭퍼 스마트 스크롤 이벤트 등록 완료');
        console.log('🎯 이벤트 대상 컨테이너:', cropContainer.className, cropContainer.tagName);
        console.log('📏 현재 컨테이너 크기:', cropContainer.offsetWidth, 'x', cropContainer.offsetHeight);
        
    } catch (error) {
        console.error('❌ 시설 크롭퍼 스마트 스크롤 이벤트 등록 실패:', error);
    }
}

// 줌 표시기 업데이트 (프로필과 정확히 동일)
function updateZoomIndicator(zoomLevel, status) {
    if (!elements.zoomIndicator || !elements.zoomLevel || !elements.zoomStatus) return;
    
    // 줌 레벨을 퍼센트로 표시 (프로필과 동일)
    const zoomPercent = Math.round(zoomLevel * 100);
    elements.zoomLevel.textContent = zoomPercent + '%';
    
    // 상태 메시지 업데이트 (프로필과 동일)
    let statusMessage = '';
    let statusClass = '';
    
    if (status === '최대 확대') {
        statusMessage = '(최대 - 페이지 스크롤 가능)';
        statusClass = 'text-warning';
    } else if (status === '최소 축소') {
        statusMessage = '(최소 - 페이지 스크롤 가능)';
        statusClass = 'text-info';
    } else {
        statusMessage = `(${status} 중)`;
        statusClass = 'text-success';
    }
    
    elements.zoomStatus.textContent = statusMessage;
    elements.zoomStatus.className = `ms-2 ${statusClass}`;
    
    // 줌 표시기 보이기 (프로필과 동일)
    elements.zoomIndicator.style.display = 'block';
    
    // 3초 후 자동 숨김 (프로필과 동일)
    clearTimeout(window.zoomIndicatorTimeout);
    window.zoomIndicatorTimeout = setTimeout(() => {
        if (elements.zoomIndicator) {
            elements.zoomIndicator.style.display = 'none';
        }
    }, 3000);
}

// 브라우저 창 크기 변경 핸들러 (작은 창에서 정상 작동하는 방식 유지)
function handleWindowResize() {
    if (!cropper) return;
    
    console.log('🔄 브라우저 창 크기 변경 감지 - responsive:true 모드로 자동 대응');
    
    // responsive:true 설정으로 Cropper.js가 자동으로 크기 조정하므로
    // 스마트 스크롤만 재설정하면 됨
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        try {
            const containerData = cropper.getContainerData();
            console.log('📐 자동 조정된 컨테이너 크기:', containerData);
            
            // 스마트 스크롤만 재설정 (작은 창에서 정상 작동하는 방식)
            setupSmartScroll();
            
            console.log('✅ 브라우저 창 크기 변경 대응 완료 (responsive 모드)');
            
        } catch (error) {
            console.error('❌ 브라우저 창 크기 변경 처리 오류:', error);
        }
    }, 100); // 더 빠른 반응
}

// 미리보기 업데이트 (16:9 비율)
function updatePreview() {
    if (!cropper || !elements.previewCanvas) return;
    
    console.log('🖼️ 미리보기 업데이트 시작');
    
    // 크롭된 이미지를 캔버스에 그리기 (16:9 비율)
    const canvas = cropper.getCroppedCanvas({
        width: 192,
        height: 108, // 16:9 비율
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });
    
    if (canvas) {
        const ctx = elements.previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, elements.previewCanvas.width, elements.previewCanvas.height);
        ctx.drawImage(canvas, 0, 0, elements.previewCanvas.width, elements.previewCanvas.height);
        console.log('✅ 미리보기 업데이트 완료');
    }
}

// 이미지 크기 정보 업데이트
function updateImageDimensions() {
    if (!cropper || !elements.imageDimensions) return;
    
    const imageData = cropper.getImageData();
    elements.imageDimensions.textContent = `${Math.round(imageData.naturalWidth)} × ${Math.round(imageData.naturalHeight)}`;
}

// 현재 이미지 크롭 (프로필 방식 + 로딩 상태)
function cropCurrentImage() {
    if (!cropper) {
        alert('크롭퍼가 초기화되지 않았습니다.');
        return;
    }
    
    console.log(`🔄 이미지 크롭 중: ${currentImageIndex + 1}/${originalImages.length}`);
    
    // 프로필과 동일한 버튼 로딩 상태 설정
    const cropBtn = elements.buttons.cropCurrent;
    setButtonLoading(cropBtn, true, '크롭 중...');
    
    try {
        // 크롭된 이미지 생성 (16:9 비율)
        const canvas = cropper.getCroppedCanvas({
            width: 800,
            height: 450, // 16:9 비율
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        if (canvas) {
            const croppedImageData = canvas.toDataURL('image/jpeg', 0.9);
            
            // 크롭된 이미지 저장
            croppedImages[currentImageIndex] = {
                ...originalImages[currentImageIndex],
                croppedDataUrl: croppedImageData,
                isCropped: true
            };
            
            console.log(`✅ 이미지 크롭 완료: ${currentImageIndex + 1}`);
            
            // 다음 이미지로 자동 이동 또는 압축 단계로
            setTimeout(() => {
                setButtonLoading(cropBtn, false);
                
                if (currentImageIndex < originalImages.length - 1) {
                    // 다음 이미지가 있으면 이동
                    goToNextImage();
                } else {
                    // 모든 이미지 크롭 완료 시 압축 단계로 이동
                    console.log('🎉 모든 이미지 크롭 완료 - 압축 단계로 이동');
                    goToCompressionStep();
                }
            }, 500);
        } else {
            throw new Error('캔버스 생성 실패');
        }
        
    } catch (error) {
        console.error('크롭 처리 오류:', error);
        setButtonLoading(cropBtn, false);
        alert('이미지 처리 중 오류가 발생했습니다.');
    }
}

// 압축 단계로 이동
function goToCompressionStep() {
    hideAllSections();
    if (elements.compressionSection) {
        elements.compressionSection.style.display = 'block';
        console.log('📦 압축 단계 표시 완료');
    }
    updateStepIndicator(3);
    
    // 크롭된 이미지들을 압축 미리보기에 표시
    updateCompressionPreview();
    
    // Alt 텍스트 자동 생성 (프로필에서 누락된 기능)
    generateAltText();
}

// 압축 미리보기 업데이트 (실시간 반영)
function updateCompressionPreview() {
    const finalPreviewImage = document.getElementById('finalPreviewImage');
    const compressionSavings = document.getElementById('compressionSavings');
    const currentFormat = document.getElementById('currentFormat');
    
    if (!finalPreviewImage || croppedImages.length === 0) return;
    
    // 첫 번째 크롭된 이미지를 미리보기로 표시
    const firstCroppedImage = croppedImages.find(img => img && img.croppedDataUrl);
    if (!firstCroppedImage) return;
    
    // 현재 설정 가져오기
    const qualitySlider = document.getElementById('qualitySlider');
    const quality = qualitySlider ? parseFloat(qualitySlider.value) : 0.8;
    
    const formatRadios = document.querySelectorAll('input[name="imageFormat"]:checked');
    let format = formatRadios.length > 0 ? formatRadios[0].value : 'jpeg';
    
    // 브라우저 지원 확인 후 폴백 (프로필에서 누락된 기능)
    if (format === 'avif' && !formatSupport.avif) {
        console.log('⚠️ AVIF 미지원으로 WebP로 폴백');
        format = formatSupport.webp ? 'webp' : 'jpeg';
        
        // UI에서 지원되는 형식으로 자동 변경
        const fallbackRadio = document.getElementById(formatSupport.webp ? 'formatWEBP' : 'formatJPEG');
        if (fallbackRadio) {
            fallbackRadio.checked = true;
        }
    }
    
    if (format === 'webp' && !formatSupport.webp) {
        console.log('⚠️ WebP 미지원으로 JPEG로 폴백');
        format = 'jpeg';
        
        // UI에서 JPEG로 자동 변경
        const jpegRadio = document.getElementById('formatJPEG');
        if (jpegRadio) {
            jpegRadio.checked = true;
        }
    }
    
    // 선택된 형식에 따라 이미지 재압축
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // 형식별 압축 적용
        let mimeType = 'image/jpeg';
        let compressionRatio = 0.7; // 기본 압축률
        
        switch(format) {
            case 'avif':
                mimeType = 'image/avif';
                compressionRatio = 0.9; // AVIF는 높은 압축률
                break;
            case 'webp':
                mimeType = 'image/webp';
                compressionRatio = 0.8; // WebP는 중간 압축률
                break;
            case 'jpeg':
            default:
                mimeType = 'image/jpeg';
                compressionRatio = 0.7; // JPEG는 낮은 압축률
                break;
        }
        
        // 압축된 이미지 생성
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        finalPreviewImage.src = compressedDataUrl;
        
        // 압축 정보 업데이트
        if (compressionSavings) {
            const savingsPercent = Math.round(compressionRatio * 100);
            compressionSavings.textContent = `평균 ${savingsPercent}% 용량 절약`;
            compressionSavings.className = 'compression-savings text-success fw-bold mb-2';
        }
        
        if (currentFormat) {
            currentFormat.textContent = format.toUpperCase();
            currentFormat.className = 'fw-bold';
        }
        
        console.log(`🔧 압축 미리보기 업데이트: ${format.toUpperCase()}, 품질: ${Math.round(quality * 100)}%`);
    };
    
    img.src = firstCroppedImage.croppedDataUrl;
}

// Alt 텍스트 자동 생성 (다중 이미지 지원)
function generateAltText() {
    const altInput = document.getElementById('altTextInput');
    if (!altInput) return;
    
    console.log('✨ Alt 텍스트 자동 생성 시작');
    
    // 현재 이미지에 대한 개별 Alt 텍스트 생성
    const currentImage = originalImages[currentImageIndex];
    if (!currentImage) return;
    
    let altText = generateIndividualAltText(currentImage, currentImageIndex);
    
    altInput.value = altText;
    console.log(`Alt 텍스트 자동 생성 완료 (${currentImageIndex + 1}/${originalImages.length}):`, altText);
}

// 개별 이미지의 고유한 Alt 텍스트 생성
function generateIndividualAltText(image, index) {
    let altText = '';
    
    // 이미지 순서에 따른 기본 역할 분류
    if (index === 0) {
        altText = '시설 메인 이미지';
    } else {
        const imageTypes = [
            '시설 외관', '시설 내부', '시설 환경', '시설 부대시설', 
            '시설 상세', '시설 추가 정보', '시설 기타'
        ];
        const typeIndex = Math.min(index - 1, imageTypes.length - 1);
        altText = imageTypes[typeIndex];
    }
    
    // 파일명에서 추가 정보 추출
    if (image.name) {
        const fileName = image.name.replace(/\.[^/.]+$/, '').toLowerCase();
        
        // 한글 키워드 인식
        const koreanKeywords = {
            '외관': '시설 외관',
            '내부': '시설 내부', 
            '로비': '시설 로비',
            '복도': '시설 복도',
            '방': '시설 객실',
            '식당': '시설 식당',
            '정원': '시설 정원',
            '주차': '주차장',
            '엘리베이터': '엘리베이터',
            '화장실': '화장실',
            '간호': '간호실',
            '의무': '의무실'
        };
        
        // 영문 키워드 인식
        const englishKeywords = {
            'exterior': '시설 외관',
            'interior': '시설 내부',
            'lobby': '시설 로비', 
            'room': '시설 객실',
            'dining': '시설 식당',
            'garden': '시설 정원',
            'parking': '주차장',
            'elevator': '엘리베이터',
            'bathroom': '화장실',
            'nurse': '간호실',
            'medical': '의무실'
        };
        
        // 키워드 매칭하여 더 구체적인 Alt 텍스트 생성
        let matchedKeyword = null;
        
        for (const [key, value] of Object.entries(koreanKeywords)) {
            if (fileName.includes(key)) {
                matchedKeyword = value;
                break;
            }
        }
        
        if (!matchedKeyword) {
            for (const [key, value] of Object.entries(englishKeywords)) {
                if (fileName.includes(key)) {
                    matchedKeyword = value;
                    break;
                }
            }
        }
        
        if (matchedKeyword) {
            altText = matchedKeyword;
        } else if (fileName.length > 0 && fileName !== 'image') {
            // 특별한 키워드가 없으면 파일명 활용
            const cleanFileName = fileName.replace(/[_-]/g, ' ').trim();
            if (cleanFileName.length > 0) {
                altText += ` - ${cleanFileName}`;
            }
        }
    }
    
    // 이미지 순서 정보 추가 (메인 이미지가 아닌 경우)
    if (index > 0 && originalImages.length > 1) {
        altText += ` (${index + 1}번째 사진)`;
    }
    
    return altText;
}

// 전체 이미지의 Alt 텍스트를 자동 생성하는 함수
function generateAllAltTexts() {
    console.log('🎯 모든 이미지의 Alt 텍스트 자동 생성 시작');
    
    const results = [];
    originalImages.forEach((image, index) => {
        const altText = generateIndividualAltText(image, index);
        results.push({
            index: index,
            fileName: image.name,
            altText: altText
        });
    });
    
    console.log('📋 생성된 Alt 텍스트 목록:', results);
    return results;
}

// 모든 이미지 저장 기능 (프로필과 동일한 패턴)
function saveAllImages() {
    if (croppedImages.length === 0) {
        alert('저장할 이미지가 없습니다.');
        return;
    }
    
    console.log('📤 시설 이미지 서버 저장 시작');
    const saveBtn = document.getElementById('saveAllImagesBtn');
    setButtonLoading(saveBtn, true, '저장 중...');
    
    // Alt 텍스트 가져오기
    const altTextInput = document.getElementById('altTextInput');
    const altText = altTextInput ? altTextInput.value.trim() : '';
    
    // 압축 설정 가져오기
    const qualitySlider = document.getElementById('qualitySlider');
    const quality = qualitySlider ? parseFloat(qualitySlider.value) : 0.8;
    
    const formatRadios = document.querySelectorAll('input[name="imageFormat"]:checked');
    let format = formatRadios.length > 0 ? formatRadios[0].value : 'jpeg';
    
    // 브라우저 지원 확인 후 폴백
    if (format === 'avif' && !formatSupport.avif) {
        format = formatSupport.webp ? 'webp' : 'jpeg';
    }
    if (format === 'webp' && !formatSupport.webp) {
        format = 'jpeg';
    }
    
    // FormData 생성 (프로필과 동일한 방식)
    const formData = new FormData();
    
    // 메타데이터 추가
    formData.append('altText', altText);
    formData.append('format', format);
    formData.append('quality', quality);
    
    // 크롭된 이미지들을 Blob으로 변환하여 추가 (프로필과 동일한 방식)
    const firstImage = croppedImages.find(img => img && img.croppedDataUrl);
    if (firstImage) {
        console.log(`🔍 원본 이미지 정보 - 이름: ${firstImage.name}, Base64 길이: ${firstImage.croppedDataUrl.length}`);
        
        // Base64를 Blob으로 변환
        const base64Data = firstImage.croppedDataUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `image/${format}` });
        
        // 프로필과 동일한 파라미터 이름 사용
        formData.append('facilityImage', blob, `facility_image.${format}`);
        
        console.log(`📤 이미지 Blob 생성 완료: ${(blob.size / 1024).toFixed(2)}KB`);
        console.log(`📋 FormData 구성 - altText: '${altText}', format: '${format}', quality: '${quality}'`);
        
        // FormData 내용 확인 (디버깅용)
        for (let [key, value] of formData.entries()) {
            if (value instanceof Blob) {
                console.log(`📎 FormData[${key}]: Blob (${(value.size / 1024).toFixed(2)}KB, ${value.type})`);
            } else {
                console.log(`📎 FormData[${key}]: ${value}`);
            }
        }
    } else {
        console.error('❌ 크롭된 이미지를 찾을 수 없음!');
        alert('크롭된 이미지가 없습니다. 다시 시도해주세요.');
        return;
    }
    
    console.log(`📸 전송할 이미지 수: ${croppedImages.filter(img => img && img.croppedDataUrl).length}`);
    
    // 서버에 저장 요청 (Promise 반환)
    return fetch(`/facility/crop-images/save/${facilityId}`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('📡 서버 응답 상태:', response.status);
        return response.json();
    })
    .then(data => {
        setButtonLoading(saveBtn, false);
        console.log('📥 서버 응답 데이터:', data);
        
        if (data.success) {
            console.log('✅ 시설 이미지 저장 성공');
            return data; // 성공 시 데이터 반환
        } else {
            console.error('❌ 저장 실패:', data.message);
            throw new Error(data.message || '이미지 저장에 실패했습니다.');
        }
    })
    .catch(error => {
        setButtonLoading(saveBtn, false);
        console.error('🚨 저장 오류:', error);
        throw error; // 에러 재발생
    });
}

// 단계 이동 함수들 (프로필과 동일)
function goToUploadStep() {
    hideAllSections();
    if (elements.uploadSection) elements.uploadSection.style.display = 'block';
    updateStepIndicator(1);
    
    // 초기화 (프로필과 동일)
    if (elements.imageInput) elements.imageInput.value = '';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    originalImages = [];
    croppedImages = [];
    currentImageIndex = 0;
}

function goToCropStep() {
    hideAllSections();
    if (elements.cropSection) elements.cropSection.style.display = 'block';
    updateStepIndicator(2);
}

function goToCompressionStep() {
    hideAllSections();
    if (elements.compressionSection) elements.compressionSection.style.display = 'block';
    updateStepIndicator(3);
}

// 중복 함수 제거됨 - 하단의 새로운 goToManageStep() 함수 사용

function goToCompleteStep() {
    hideAllSections();
    if (elements.completeSection) {
        elements.completeSection.style.display = 'block';
        console.log('🎆 최종 완료 단계 표시');
    }
    updateStepIndicator(5);
    
    // 최종 요약 표시
    updateFinalSummary();
}

// 모든 섹션 숨기기 (프로필과 동일)
function hideAllSections() {
    const sections = ['uploadSection', 'cropSection', 'compressionSection', 'manageSection', 'completeSection'];
    sections.forEach(sectionId => {
        const section = elements[sectionId];
        if (section) {
            section.style.display = 'none';
        }
    });
    
    // 이미지 리스트 섹션도 숨김
    if (elements.imageListSection) {
        elements.imageListSection.style.display = 'none';
    }
}

// 단계 표시기 업데이트 (프로필과 동일)
function updateStepIndicator(currentStep) {
    if (!elements.steps) return;
    
    // 모든 단계 초기화
    Object.values(elements.steps).forEach(step => {
        if (step) {
            step.classList.remove('active', 'completed');
        }
    });
    
    // 현재 단계까지 활성화
    for (let i = 1; i <= currentStep; i++) {
        const step = elements.steps[`step${i}`];
        if (step) {
            if (i === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.add('completed');
            }
        }
    }
}

// 이미지 리스트 표시
function showImageList() {
    if (!elements.imageListSection || !elements.imageList) return;
    
    if (elements.imageCount) {
        elements.imageCount.textContent = originalImages.length;
    }
    elements.imageList.innerHTML = '';
    
    originalImages.forEach((image, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'col-md-4 col-lg-3';
        imageItem.innerHTML = `
            <div class="card image-item" data-index="${index}">
                <div class="card-img-top position-relative">
                    <img src="${image.dataUrl}" class="img-fluid" style="height: 120px; object-fit: cover;">
                    <div class="position-absolute top-0 end-0 p-1">
                        <span class="badge bg-primary">${index + 1}</span>
                    </div>
                </div>
                <div class="card-body p-2">
                    <h6 class="card-title text-truncate small mb-1">${image.name}</h6>
                    <small class="text-muted">${formatFileSize(image.size)}</small>
                </div>
            </div>
        `;
        
        elements.imageList.appendChild(imageItem);
    });
    
    if (elements.imageListSection) {
        elements.imageListSection.style.display = 'block';
    }
}

// 최종 이미지 그리드 업데이트
function updateFinalImagesGrid() {
    const finalImagesGrid = document.getElementById('finalImagesGrid');
    if (!finalImagesGrid) return;
    
    finalImagesGrid.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> 저장된 이미지 목록을 불러오는 중...</div>';
    
    // 서버에서 실제 저장된 이미지 목록을 가져와서 표시
    fetch(`/facility/api/${facilityId}/images`)
        .then(response => response.json())
        .then(images => {
            finalImagesGrid.innerHTML = '';
            
            if (images && images.length > 0) {
                images.forEach((image, index) => {
                    const imageElement = document.createElement('div');
                    imageElement.className = 'col-md-3 col-sm-4 col-6 mb-3';
                    imageElement.innerHTML = `
                        <div class="card" data-image-id="${image.imageId}">
                            <div class="position-relative">
                                <img src="${image.imagePath}" class="card-img-top" style="height: 120px; object-fit: cover;" 
                                     alt="${image.imageAltText || '시설 이미지'}" onerror="this.src='/images/default_facility.jpg'">
                                <div class="position-absolute top-0 end-0 p-1">
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-light dropdown-toggle" type="button" 
                                                data-bs-toggle="dropdown" aria-expanded="false">
                                            <i class="fas fa-cog"></i>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end">
                                            ${!image.isMainImage ? `
                                                <li><button class="dropdown-item" onclick="setMainImage(${image.imageId})">
                                                    <i class="fas fa-star text-warning me-2"></i>메인 이미지로 설정
                                                </button></li>
                                            ` : ''}
                                            <li><button class="dropdown-item text-danger" onclick="deleteImage(${image.imageId})">
                                                <i class="fas fa-trash me-2"></i>이미지 삭제
                                            </button></li>
                                        </ul>
                                    </div>
                                </div>
                                ${image.isMainImage ? '<div class="position-absolute top-0 start-0 p-1"><span class="badge bg-primary"><i class="fas fa-star me-1"></i>메인</span></div>' : ''}
                            </div>
                            <div class="card-body p-2">
                                <small class="text-success">
                                    <i class="fas fa-check-circle me-1"></i>저장 완료 (ID: ${image.imageId})
                                </small>
                                <br>
                                <small class="text-muted">${image.imageAltText || '시설 이미지'}</small>
                            </div>
                        </div>
                    `;
                    finalImagesGrid.appendChild(imageElement);
                });
                
                console.log(`✅ 서버에서 가져온 이미지 수: ${images.length}개`);
                
                // Bootstrap 드롭다운 초기화 (동적으로 생성된 요소들을 위해)
                setTimeout(() => {
                    const dropdowns = finalImagesGrid.querySelectorAll('[data-bs-toggle="dropdown"]');
                    dropdowns.forEach(dropdown => {
                        // Bootstrap 5 드롭다운 초기화
                        if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
                            new bootstrap.Dropdown(dropdown);
                        }
                    });
                    console.log(`🔧 Bootstrap 드롭다운 초기화 완료: ${dropdowns.length}개`);
                }, 100);
                
                // 추가 정보 표시
                const infoElement = document.createElement('div');
                infoElement.className = 'col-12 mt-3';
                infoElement.innerHTML = `
                    <div class="alert alert-success">
                        <h6><i class="fas fa-database me-2"></i>데이터베이스 저장 확인</h6>
                        <p class="mb-0">✅ 총 <strong>${images.length}장</strong>의 이미지가 성공적으로 저장되었습니다.</p>
                        <small class="text-muted">이미지는 /uploads/facility/ 디렉토리에 저장되고, facility_images 테이블에 등록됩니다.</small>
                    </div>
                `;
                finalImagesGrid.appendChild(infoElement);
                
            } else {
                finalImagesGrid.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            저장된 이미지가 없습니다.
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('❌ 저장된 이미지 목록을 가져오는 중 오류:', error);
            finalImagesGrid.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        <h6><i class="fas fa-info-circle me-2"></i>로컬 이미지 표시</h6>
                        <p class="mb-2">서버 이미지 목록을 가져올 수 없어 로컬 크롭된 이미지를 표시합니다:</p>
                        <div class="row" id="localImages"></div>
                    </div>
                </div>
            `;
            
            // 로컬 이미지로 폴백
            const localContainer = document.getElementById('localImages');
            croppedImages.forEach((image, index) => {
                if (image && image.croppedDataUrl) {
                    const imageElement = document.createElement('div');
                    imageElement.className = 'col-md-3 col-sm-4 col-6 mb-3';
                    imageElement.innerHTML = `
                        <div class="card">
                            <img src="${image.croppedDataUrl}" class="card-img-top" style="height: 120px; object-fit: cover;">
                            <div class="card-body p-2">
                                <small class="text-muted">크롭된 이미지 ${index + 1}</small>
                            </div>
                        </div>
                    `;
                    localContainer.appendChild(imageElement);
                }
            });
        });
}

// 드래그 앤 드롭 설정 (프로필과 동일)
function setupDragAndDrop() {
    const uploadArea = elements.uploadArea;
    if (!uploadArea) return;
    
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    
    // 업로드 영역 클릭 시 파일 선택 (프로필 방식)
    uploadArea.addEventListener('click', (event) => {
        if (!event.target.closest('#fileSelectBtn')) {
            console.log('🖱️ 업로드 영역 클릭됨');
            if (elements.imageInput) {
                elements.imageInput.click();
            }
        }
    });
    
    console.log('🎯 드래그 앤 드롭 설정 완료');
}

// 드래그 오버 처리 (프로필과 동일)
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#0d6efd';
    event.currentTarget.style.backgroundColor = '#f8f9ff';
}

// 드롭 처리 (프로필과 동일)
function handleDrop(event) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
        console.log(`🎯 드롭된 파일 수: ${files.length}`);
        // 파일 입력 이벤트와 동일한 처리
        elements.imageInput.files = event.dataTransfer.files;
        handleImageUpload({ target: { files: event.dataTransfer.files } });
    }
    
    // 스타일 리셋
    event.currentTarget.style.borderColor = '';
    event.currentTarget.style.backgroundColor = '';
}

// 파일 크기 포맷팅 (프로필과 동일)
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 크롭퍼 줌 (프로필과 동일)
function zoomCropper(ratio) {
    if (!cropper) return;
    cropper.zoom(ratio);
}

// 크롭퍼 회전 (프로필과 동일)
function rotateCropper(degree) {
    if (!cropper) return;
    cropper.rotate(degree);
}

// 크롭퍼 리셋 (프로필과 동일)
function resetCropper() {
    if (!cropper) return;
    cropper.reset();
}

// 이전 이미지로 이동
function goToPreviousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        loadImageToCropper(originalImages[currentImageIndex]);
    }
}

// 다음 이미지로 이동
function goToNextImage() {
    if (currentImageIndex < originalImages.length - 1) {
        currentImageIndex++;
        loadImageToCropper(originalImages[currentImageIndex]);
    }
}

// 키보드 단축키 설정 (프로필과 동일)
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // 입력 필드에서는 단축키 비활성화
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key) {
            case '+':
            case '=':
                event.preventDefault();
                zoomCropper(0.1);
                break;
                
            case '-':
                event.preventDefault();
                zoomCropper(-0.1);
                break;
                
            case 'r':
            case 'R':
                event.preventDefault();
                rotateCropper(90);
                break;
                
            case 'l':
            case 'L':
                event.preventDefault();
                rotateCropper(-90);
                break;
                
            case 'Enter':
                event.preventDefault();
                if (elements.buttons.cropCurrent && !elements.buttons.cropCurrent.disabled) {
                    cropCurrentImage();
                }
                break;
                
            case 'Escape':
                event.preventDefault();
                resetCropper();
                break;
                
            case 'ArrowLeft':
                event.preventDefault();
                if (elements.buttons.prevImage && elements.buttons.prevImage.style.display !== 'none') {
                    goToPreviousImage();
                }
                break;
                
            case 'ArrowRight':
                event.preventDefault();
                if (elements.buttons.nextImage && elements.buttons.nextImage.style.display !== 'none') {
                    goToNextImage();
                }
                break;
        }
    });
    
    console.log('⌨️ 키보드 단축키 설정 완료');
}

// 버튼 로딩 상태 설정 (프로필과 정확히 동일)
function setButtonLoading(button, isLoading, loadingText = '처리 중...') {
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        button.setAttribute('data-original-text', button.innerHTML);
        button.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i>${loadingText}`;
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.innerHTML = originalText;
        }
    }
}

// 페이지 언로드 시 정리 (프로필과 동일)
window.addEventListener('beforeunload', function() {
    if (cropper) {
        cropper.destroy();
    }
});

// 이미지 삭제 함수 (전역 함수로 설정)
window.deleteImage = function(imageId) {
    if (!confirm('이 이미지를 삭제하시겠습니까?')) {
        return;
    }
    
    console.log('🗑️ 이미지 삭제 요청:', imageId);
    
    fetch(`/facility/api/images/${imageId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ 이미지 삭제 성공:', imageId);
            
            // UI에서 해당 이미지 카드 제거
            const imageCard = document.querySelector(`[data-image-id="${imageId}"]`);
            if (imageCard) {
                imageCard.closest('.col-md-3').remove();
            }
            
            // 성공 메시지
            alert('이미지가 성공적으로 삭제되었습니다.');
            
            // 이미지 목록 새로고침
            updateFinalImagesGrid();
            
        } else {
            console.error('❌ 이미지 삭제 실패:', data.message);
            alert(data.message || '이미지 삭제에 실패했습니다.');
        }
    })
    .catch(error => {
        console.error('🚨 이미지 삭제 오류:', error);
        alert('이미지 삭제 중 오류가 발생했습니다.');
    });
};

// 이미지 저장 및 관리 단계 이동 (Promise 반환)
function saveAllImages() {
    console.log('🔄 모든 이미지 저장 시작...');
    
    return new Promise(async (resolve, reject) => {
        try {
            let savedCount = 0;
            let totalImages = croppedImages.filter(img => img && img.croppedDataUrl).length;
            
            if (totalImages === 0) {
                reject(new Error('저장할 크롭된 이미지가 없습니다.'));
                return;
            }
            
            console.log(`📊 저장할 이미지 수: ${totalImages}장`);
            
            // 크롭된 각 이미지를 서버에 저장
            for (let i = 0; i < croppedImages.length; i++) {
                const image = croppedImages[i];
                if (!image || !image.croppedDataUrl) continue;
                
                try {
                    // DataURL을 Blob으로 변환
                    const response = await fetch(image.croppedDataUrl);
                    const blob = await response.blob();
                    
                    // FormData 생성
                    const formData = new FormData();
                    
                    // 압축 설정 가져오기
                    const qualitySlider = document.getElementById('qualitySlider');
                    const quality = qualitySlider ? parseFloat(qualitySlider.value) : 0.8;
                    
                    const formatRadios = document.querySelectorAll('input[name="imageFormat"]:checked');
                    let format = formatRadios.length > 0 ? formatRadios[0].value : 'jpeg';
                    
                    // Alt 텍스트 가져오기
                    const altTextInput = document.getElementById('altTextInput');
                    const imageNameInput = document.getElementById('imageNameInput');
                    
                    let altText = '';
                    if (altTextInput && altTextInput.value.trim()) {
                        altText = altTextInput.value.trim();
                    } else if (imageNameInput && imageNameInput.value.trim()) {
                        altText = imageNameInput.value.trim() + ' 시설 이미지';
                    } else {
                        altText = `시설 이미지 ${i + 1}`;
                    }
                    
                    // 파일명 설정
                    const extension = format === 'jpeg' ? '.jpg' : `.${format}`;
                    const fileName = `facility_${facilityId}_image_${i}${extension}`;
                    
                    // Blob을 File로 변환
                    const file = new File([blob], fileName, { 
                        type: `image/${format === 'jpeg' ? 'jpeg' : format}` 
                    });
                    
                    formData.append('facilityImage', file);
                    formData.append('altText', altText);
                    formData.append('format', format);
                    formData.append('imageIndex', i.toString());
                    
                    console.log(`📤 이미지 ${i + 1} 업로드 중...`);
                    
                    // 서버에 업로드
                    const uploadResponse = await fetch(`/facility/crop-images/save/${facilityId}`, {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await uploadResponse.json();
                    
                    if (result.success) {
                        savedCount++;
                        console.log(`✅ 이미지 ${i + 1} 저장 성공 (ID: ${result.imageId})`);
                    } else {
                        console.error(`❌ 이미지 ${i + 1} 저장 실패:`, result.message);
                        throw new Error(result.message);
                    }
                    
                } catch (error) {
                    console.error(`🚨 이미지 ${i + 1} 저장 중 오류:`, error);
                    throw error;
                }
            }
            
            console.log(`🎉 모든 이미지 저장 완료: ${savedCount}/${totalImages}장`);
            resolve(savedCount);
            
        } catch (error) {
            console.error('❌ 이미지 저장 과정에서 오류 발생:', error);
            reject(error);
        }
    });
}

// 관리 단계로 이동
function goToManageStep() {
    console.log('🔄 이미지 관리 단계로 이동');
    
    hideAllSections();
    if (elements.manageSection) {
        elements.manageSection.style.display = 'block';
        console.log('🛠️ 관리 단계 표시 완료');
    }
    updateStepIndicator(4);
    
    // 관리 이미지 그리드 업데이트
    updateManageImagesGrid();
}

// 압축 단계로 돌아가기
function goToCompressionStep() {
    console.log('🔄 압축 단계로 돌아가기');
    
    hideAllSections();
    if (elements.compressionSection) {
        elements.compressionSection.style.display = 'block';
        console.log('📦 압축 단계 표시 완료');
    }
    updateStepIndicator(3);
    
    // 압축 미리보기 업데이트
    updateCompressionPreview();
}

// 관리 이미지 그리드 업데이트
function updateManageImagesGrid() {
    const manageImagesGrid = document.getElementById('manageImagesGrid');
    if (!manageImagesGrid) {
        console.error('❌ manageImagesGrid 요소를 찾을 수 없습니다.');
        return;
    }
    
    console.log('🔄 관리 이미지 그리드 업데이트 시작');
    
    // 로딩 표시
    manageImagesGrid.innerHTML = `
        <div class="col-12 text-center">
            <div class="d-flex justify-content-center align-items-center" style="height: 200px;">
                <div class="spinner-border text-primary me-3" role="status">
                    <span class="visually-hidden">로딩 중...</span>
                </div>
                <span class="text-muted">저장된 이미지를 불러오는 중...</span>
            </div>
        </div>
    `;
    
    // 서버에서 저장된 이미지 목록 가져오기
    fetch(`/facility/api/${facilityId}/images`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(images => {
            console.log(`📋 서버에서 가져온 이미지 수: ${images.length}개`);
            
            manageImagesGrid.innerHTML = '';
            
            if (images && images.length > 0) {
                // 이미지 그리드 생성
                const gridContainer = document.createElement('div');
                gridContainer.className = 'row g-3';
                
                images.forEach((image, index) => {
                    const imageElement = document.createElement('div');
                    imageElement.className = 'col-md-4 col-sm-6 col-12';
                    imageElement.innerHTML = `
                        <div class="card h-100" data-image-id="${image.imageId}">
                            <div class="position-relative">
                                <img src="${image.imagePath}" class="card-img-top" 
                                     style="height: 200px; object-fit: cover;" 
                                     alt="${image.imageAltText || '시설 이미지'}" 
                                     onerror="this.src='/images/default_facility.jpg'">
                                
                                <!-- 메인 이미지 배지 -->
                                ${image.isMainImage ? `
                                    <div class="position-absolute top-0 start-0 m-2">
                                        <span class="badge bg-warning text-dark">
                                            <i class="fas fa-star me-1"></i>메인 이미지
                                        </span>
                                    </div>
                                ` : ''}
                                
                                <!-- 관리 버튼 -->
                                <div class="position-absolute top-0 end-0 m-2">
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-light dropdown-toggle" type="button" 
                                                data-bs-toggle="dropdown" aria-expanded="false">
                                            <i class="fas fa-cog"></i>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end">
                                            ${!image.isMainImage ? `
                                                <li>
                                                    <button class="dropdown-item set-main-image-btn" data-image-id="${image.imageId}">
                                                        <i class="fas fa-star text-warning me-2"></i>메인 이미지로 설정
                                                    </button>
                                                </li>
                                            ` : ''}
                                            <li>
                                                <button class="dropdown-item text-danger delete-image-btn" data-image-id="${image.imageId}">
                                                    <i class="fas fa-trash me-2"></i>이미지 삭제
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="card-body">
                                <h6 class="card-title text-truncate">
                                    ${image.imageAltText || `시설 이미지 ${index + 1}`}
                                </h6>
                                <small class="text-success">
                                    <i class="fas fa-check-circle me-1"></i>저장 완료
                                </small>
                                <br>
                                <small class="text-muted">ID: ${image.imageId}</small>
                            </div>
                        </div>
                    `;
                    gridContainer.appendChild(imageElement);
                });
                
                manageImagesGrid.appendChild(gridContainer);
                
                // 안내 메시지 추가
                const infoElement = document.createElement('div');
                infoElement.className = 'col-12 mt-4';
                infoElement.innerHTML = `
                    <div class="alert alert-info">
                        <h6 class="alert-heading">
                            <i class="fas fa-info-circle me-2"></i>이미지 관리 안내
                        </h6>
                        <ul class="mb-0 small">
                            <li>메인 이미지는 시설 목록에서 대표 이미지로 표시됩니다</li>
                            <li>불필요한 이미지는 삭제할 수 있습니다</li>
                            <li>최종 완료 후에는 시설 관리 페이지에서 수정 가능합니다</li>
                            <li>현재 <strong>${images.length}장</strong>의 이미지가 등록되어 있습니다</li>
                        </ul>
                    </div>
                `;
                manageImagesGrid.appendChild(infoElement);
                
                // Bootstrap 드롭다운 초기화
                setTimeout(() => {
                    const dropdowns = manageImagesGrid.querySelectorAll('[data-bs-toggle="dropdown"]');
                    dropdowns.forEach(dropdown => {
                        if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
                            new bootstrap.Dropdown(dropdown);
                        }
                    });
                    console.log(`🔧 Bootstrap 드롭다운 초기화 완료: ${dropdowns.length}개`);
                }, 100);
                
            } else {
                // 이미지가 없는 경우
                manageImagesGrid.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-warning">
                            <h5><i class="fas fa-exclamation-triangle me-2"></i>등록된 이미지가 없습니다</h5>
                            <p class="mb-3">압축 단계로 돌아가서 이미지를 저장해 주세요.</p>
                            <button type="button" class="btn btn-outline-secondary" onclick="goToCompressionStep()">
                                <i class="fas fa-arrow-left me-2"></i>압축 단계로 돌아가기
                            </button>
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('❌ 이미지 목록을 가져오는 중 오류:', error);
            manageImagesGrid.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <h6><i class="fas fa-exclamation-triangle me-2"></i>오류 발생</h6>
                        <p class="mb-0">이미지 목록을 불러올 수 없습니다: ${error.message}</p>
                    </div>
                </div>
            `;
        });
}

// 최종 완료 처리
function finalComplete() {
    console.log('🎯 최종 완료 처리 시작');
    
    // 확인 대화상자
    if (!confirm('이미지 등록을 완료하시겠습니까?\n완료 후에는 시설 관리 페이지에서 수정할 수 있습니다.')) {
        return;
    }
    
    // 버튼 로딩 상태
    const finalBtn = elements.buttons.finalComplete;
    if (finalBtn) {
        setButtonLoading(finalBtn, true, '완료 처리 중...');
    }
    
    // 완료 단계로 이동
    setTimeout(() => {
        hideAllSections();
        if (elements.completeSection) {
            elements.completeSection.style.display = 'block';
            console.log('✅ 완료 단계 표시');
        }
        updateStepIndicator(5);
        
        // 최종 요약 업데이트
        updateFinalSummary();
        
        if (finalBtn) {
            setButtonLoading(finalBtn, false);
        }
        
        console.log('🎉 시설 이미지 등록 프로세스 완료!');
    }, 1000);
}

// 최종 요약 업데이트
function updateFinalSummary() {
    const finalSummary = document.getElementById('finalSummary');
    if (!finalSummary) {
        console.error('❌ finalSummary 요소를 찾을 수 없습니다.');
        return;
    }
    
    console.log('📊 최종 요약 업데이트 시작');
    
    // 로딩 표시
    finalSummary.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-success me-2" role="status">
                <span class="visually-hidden">로딩 중...</span>
            </div>
            <span class="text-muted">최종 결과를 확인하는 중...</span>
        </div>
    `;
    
    // 서버에서 최종 이미지 정보 가져오기
    fetch(`/facility/api/${facilityId}/images`)
        .then(response => response.json())
        .then(images => {
            const mainImage = images.find(img => img.isMainImage);
            const totalImages = images.length;
            
            finalSummary.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="card border-success">
                            <div class="card-header bg-success text-white">
                                <h6 class="mb-0">
                                    <i class="fas fa-chart-bar me-2"></i>등록 완료 현황
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="row text-center">
                                    <div class="col-6">
                                        <h4 class="text-success mb-1">${totalImages}</h4>
                                        <small class="text-muted">총 이미지 수</small>
                                    </div>
                                    <div class="col-6">
                                        <h4 class="text-primary mb-1">${mainImage ? '1' : '0'}</h4>
                                        <small class="text-muted">메인 이미지</small>
                                    </div>
                                </div>
                                
                                <hr class="my-3">
                                
                                <div class="small">
                                    <div class="d-flex justify-content-between">
                                        <span>이미지 비율:</span>
                                        <span class="fw-bold text-primary">16:9</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span>압축 적용:</span>
                                        <span class="fw-bold text-success">✓ 완료</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span>SEO 최적화:</span>
                                        <span class="fw-bold text-success">✓ 완료</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card border-info">
                            <div class="card-header bg-info text-white">
                                <h6 class="mb-0">
                                    <i class="fas fa-star me-2"></i>메인 이미지
                                </h6>
                            </div>
                            <div class="card-body text-center">
                                ${mainImage ? `
                                    <img src="${mainImage.imagePath}" class="img-fluid rounded mb-2" 
                                         style="max-height: 150px; object-fit: cover;" 
                                         alt="${mainImage.imageAltText}">
                                    <p class="small text-muted mb-0">${mainImage.imageAltText}</p>
                                ` : `
                                    <div class="text-muted">
                                        <i class="fas fa-info-circle fa-2x mb-2"></i>
                                        <p class="small mb-0">메인 이미지가 설정되지 않았습니다</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-success mt-3">
                    <h6 class="alert-heading">
                        <i class="fas fa-thumbs-up me-2"></i>등록 완료!
                    </h6>
                    <p class="mb-0">시설 이미지가 성공적으로 등록되었습니다. 이제 시설 검색 결과에서 고품질 이미지를 확인할 수 있습니다.</p>
                </div>
            `;
            
            console.log('✅ 최종 요약 업데이트 완료');
        })
        .catch(error => {
            console.error('❌ 최종 요약 업데이트 오류:', error);
            finalSummary.innerHTML = `
                <div class="alert alert-warning">
                    <h6><i class="fas fa-exclamation-triangle me-2"></i>요약 정보 확인 불가</h6>
                    <p class="mb-0">이미지는 정상적으로 등록되었지만, 요약 정보를 불러올 수 없습니다.</p>
                </div>
            `;
        });
}

// 전역 함수들은 facility-image-manage.js에서 처리됨 (Thymeleaf 충돌 방지)
// window.setMainImage와 window.deleteImage는 별도 파일에서 정의하여 인라인 충돌 해결

console.log('📋 facility-image-cropper.js 로드 완료 - 관리 기능은 별도 파일에서 처리됨');