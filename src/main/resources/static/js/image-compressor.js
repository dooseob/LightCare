/**
 * 이미지 압축 공통 라이브러리
 * SEO 최적화를 위한 이미지 용량 줄이기 기능
 */
class ImageCompressor {
    constructor(options = {}) {
        this.options = {
            quality: options.quality || 0.8,
            maxWidth: options.maxWidth || 1920,
            maxHeight: options.maxHeight || 1080,
            outputFormat: options.outputFormat || 'image/jpeg',
            enableResize: options.enableResize !== false,
            showProgress: options.showProgress !== false,
            ...options
        };
    }

    /**
     * 파일을 압축합니다
     * @param {File} file - 압축할 파일
     * @param {Object} customOptions - 사용자 정의 옵션
     * @returns {Promise<{file: File, originalSize: number, compressedSize: number, compressionRatio: number}>}
     */
    async compressFile(file, customOptions = {}) {
        const options = { ...this.options, ...customOptions };
        
        if (!this.isValidImageFile(file)) {
            throw new Error('지원되지 않는 이미지 파일입니다.');
        }

        const originalSize = file.size;
        
        try {
            const compressedFile = await this.compress(file, options);
            const compressedSize = compressedFile.size;
            const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);
            
            return {
                file: compressedFile,
                originalSize,
                compressedSize,
                compressionRatio
            };
        } catch (error) {
            console.error('이미지 압축 중 오류 발생:', error);
            throw error;
        }
    }

    /**
     * 여러 파일을 압축합니다
     * @param {FileList|Array} files - 압축할 파일 목록
     * @param {Object} customOptions - 사용자 정의 옵션
     * @returns {Promise<Array>}
     */
    async compressFiles(files, customOptions = {}) {
        const fileArray = Array.from(files);
        const results = [];
        
        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            try {
                const result = await this.compressFile(file, customOptions);
                results.push(result);
                
                if (this.options.showProgress && this.onProgress) {
                    this.onProgress(i + 1, fileArray.length, result);
                }
            } catch (error) {
                console.error(`파일 ${file.name} 압축 실패:`, error);
                results.push({ error: error.message, file });
            }
        }
        
        return results;
    }

    /**
     * 실제 압축 로직
     * @private
     */
    async compress(file, options) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                try {
                    // 리사이즈 계산
                    const { width, height } = this.calculateDimensions(
                        img.width, 
                        img.height, 
                        options.maxWidth, 
                        options.maxHeight,
                        options.enableResize
                    );
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // 이미지 그리기
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Blob으로 변환
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: options.outputFormat,
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            reject(new Error('압축 실패'));
                        }
                    }, options.outputFormat, options.quality);
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => reject(new Error('이미지 로드 실패'));
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * 리사이즈 치수 계산
     * @private
     */
    calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight, enableResize) {
        if (!enableResize) {
            return { width: originalWidth, height: originalHeight };
        }

        let { width, height } = { width: originalWidth, height: originalHeight };
        
        // 최대 너비 제한
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
        
        // 최대 높이 제한
        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
        
        return { width: Math.round(width), height: Math.round(height) };
    }

    /**
     * 유효한 이미지 파일인지 확인
     * @private
     */
    isValidImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        return validTypes.includes(file.type);
    }

    /**
     * 파일 크기를 읽기 쉬운 형태로 변환
     * @param {number} bytes - 바이트 수
     * @returns {string}
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 진행 상황 콜백 설정
     * @param {Function} callback - 진행 상황 콜백 함수
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
    }
}

/**
 * 이미지 압축 UI 헬퍼
 */
class ImageCompressorUI {
    constructor(inputSelector, options = {}) {
        this.input = document.querySelector(inputSelector);
        this.compressor = new ImageCompressor(options);
        this.originalFiles = [];
        this.compressedFiles = [];
        
        this.init();
    }

    init() {
        if (!this.input) {
            console.error('이미지 입력 요소를 찾을 수 없습니다.');
            return;
        }

        this.createUI();
        this.bindEvents();
    }

    createUI() {
        // 기존 input을 숨기고 새로운 UI 생성
        this.input.style.display = 'none';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'image-compressor-wrapper';
        wrapper.innerHTML = `
            <div class="image-upload-area border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div class="upload-icon mb-3">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <p class="text-sm text-gray-600 mb-2">이미지를 드래그하여 업로드하거나 클릭하여 선택하세요</p>
                <p class="text-xs text-gray-500">JPG, PNG, WEBP 파일만 지원됩니다</p>
                <input type="file" class="hidden" accept="image/*" multiple>
            </div>
            
            <div class="compression-settings mt-4 hidden">
                <h4 class="text-sm font-semibold mb-3">압축 설정</h4>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs text-gray-700 mb-1">품질 (${Math.round(this.compressor.options.quality * 100)}%)</label>
                        <input type="range" class="quality-slider w-full" min="0.1" max="1" step="0.1" value="${this.compressor.options.quality}">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-700 mb-1">최대 너비 (px)</label>
                        <input type="number" class="max-width-input w-full px-2 py-1 border rounded text-sm" value="${this.compressor.options.maxWidth}">
                    </div>
                </div>
                <div class="mt-3">
                    <button type="button" class="compress-btn bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600">
                        이미지 압축하기
                    </button>
                </div>
            </div>
            
            <div class="file-preview mt-4 hidden">
                <h4 class="text-sm font-semibold mb-3">파일 미리보기</h4>
                <div class="preview-list"></div>
            </div>
            
            <div class="alt-tags-section mt-4 hidden">
                <h4 class="text-sm font-semibold mb-3">
                    <i class="fas fa-tag me-1"></i>SEO 최적화 - 이미지 설명 (Alt 태그)
                </h4>
                <div class="alt-tags-list"></div>
                <div class="mt-2">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="autoGenerateAlt" checked>
                        <label class="form-check-label text-xs text-gray-600" for="autoGenerateAlt">
                            <i class="fas fa-magic me-1"></i>설명이 비어있으면 자동으로 생성
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="compression-progress mt-4 hidden">
                <div class="progress-bar bg-gray-200 rounded-full h-2">
                    <div class="progress-fill bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                <p class="text-sm text-gray-600 mt-2">압축 진행 중...</p>
            </div>
        `;
        
        this.input.parentNode.insertBefore(wrapper, this.input);
        this.wrapper = wrapper;
        this.fileInput = wrapper.querySelector('input[type="file"]');
        this.uploadArea = wrapper.querySelector('.image-upload-area');
        this.settingsArea = wrapper.querySelector('.compression-settings');
        this.previewArea = wrapper.querySelector('.file-preview');
        this.altTagsSection = wrapper.querySelector('.alt-tags-section');
        this.progressArea = wrapper.querySelector('.compression-progress');
    }

    bindEvents() {
        // 파일 선택 이벤트
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // 드래그 앤 드롭 이벤트
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('border-blue-400', 'bg-blue-50');
        });

        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
            this.handleFiles(e.dataTransfer.files);
        });

        // 압축 설정 이벤트
        this.wrapper.querySelector('.quality-slider').addEventListener('input', (e) => {
            const quality = parseFloat(e.target.value);
            this.compressor.options.quality = quality;
            e.target.previousElementSibling.textContent = `품질 (${Math.round(quality * 100)}%)`;
        });

        this.wrapper.querySelector('.max-width-input').addEventListener('input', (e) => {
            this.compressor.options.maxWidth = parseInt(e.target.value);
        });

        // 압축 실행 이벤트
        this.wrapper.querySelector('.compress-btn').addEventListener('click', () => {
            this.compressImages();
        });
    }

    handleFiles(files) {
        if (files.length === 0) return;

        this.originalFiles = Array.from(files);
        this.showPreview(files);
        this.showAltTagInputs(files);
        this.settingsArea.classList.remove('hidden');
        this.previewArea.classList.remove('hidden');
        this.altTagsSection.classList.remove('hidden');
    }

    showPreview(files) {
        const previewList = this.wrapper.querySelector('.preview-list');
        previewList.innerHTML = '';

        Array.from(files).forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item flex items-center justify-between p-3 border rounded mb-2';
            
            const reader = new FileReader();
            reader.onload = (e) => {
                previewItem.innerHTML = `
                    <div class="flex items-center space-x-3">
                        <img src="${e.target.result}" class="w-12 h-12 object-cover rounded" alt="미리보기">
                        <div>
                            <p class="text-sm font-medium">${file.name}</p>
                            <p class="text-xs text-gray-500">원본: ${ImageCompressor.formatFileSize(file.size)}</p>
                        </div>
                    </div>
                    <div class="compression-result hidden">
                        <p class="text-xs text-green-600">압축 완료!</p>
                        <p class="text-xs text-gray-500">압축 후: <span class="compressed-size"></span></p>
                        <p class="text-xs text-gray-500">압축률: <span class="compression-ratio"></span>%</p>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
            
            previewList.appendChild(previewItem);
        });
    }

    async compressImages() {
        if (this.originalFiles.length === 0) return;

        this.progressArea.classList.remove('hidden');
        const progressFill = this.wrapper.querySelector('.progress-fill');
        const progressText = this.wrapper.querySelector('.compression-progress p');

        this.compressor.setProgressCallback((current, total, result) => {
            const percentage = Math.round((current / total) * 100);
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `압축 진행 중... (${current}/${total})`;

            // 개별 파일 결과 업데이트
            this.updatePreviewResult(current - 1, result);
        });

        try {
            const results = await this.compressor.compressFiles(this.originalFiles);
            this.compressedFiles = results.map(result => result.file).filter(file => file);
            
            // 원본 input에 압축된 파일 설정
            this.updateOriginalInput();
            
            progressText.textContent = '압축 완료!';
            
            // 총 압축 결과 표시
            this.showCompressionSummary(results);
            
        } catch (error) {
            console.error('압축 중 오류 발생:', error);
            progressText.textContent = '압축 중 오류가 발생했습니다.';
        }
    }

    updatePreviewResult(index, result) {
        const previewItems = this.wrapper.querySelectorAll('.preview-item');
        if (previewItems[index]) {
            const resultDiv = previewItems[index].querySelector('.compression-result');
            if (resultDiv && !result.error) {
                resultDiv.querySelector('.compressed-size').textContent = ImageCompressor.formatFileSize(result.compressedSize);
                resultDiv.querySelector('.compression-ratio').textContent = result.compressionRatio;
                resultDiv.classList.remove('hidden');
            }
        }
    }

    updateOriginalInput() {
        // DataTransfer 객체를 사용하여 압축된 파일을 원본 input에 설정
        const dt = new DataTransfer();
        this.compressedFiles.forEach(file => {
            dt.items.add(file);
        });
        this.input.files = dt.files;
        
        // change 이벤트 발생
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    showCompressionSummary(results) {
        const totalOriginal = results.reduce((sum, result) => sum + (result.originalSize || 0), 0);
        const totalCompressed = results.reduce((sum, result) => sum + (result.compressedSize || 0), 0);
        const totalRatio = Math.round((1 - totalCompressed / totalOriginal) * 100);

        const summary = document.createElement('div');
        summary.className = 'compression-summary mt-4 p-4 bg-green-50 border border-green-200 rounded-lg';
        summary.innerHTML = `
            <h4 class="text-sm font-semibold text-green-800 mb-2">압축 완료!</h4>
            <div class="text-xs text-green-700">
                <p>원본 용량: ${ImageCompressor.formatFileSize(totalOriginal)}</p>
                <p>압축 후 용량: ${ImageCompressor.formatFileSize(totalCompressed)}</p>
                <p>총 압축률: ${totalRatio}%</p>
                <p class="mt-1 font-medium">SEO 최적화를 위해 용량이 ${ImageCompressor.formatFileSize(totalOriginal - totalCompressed)} 줄어들었습니다!</p>
            </div>
        `;
        
        this.wrapper.appendChild(summary);
    }

    showAltTagInputs(files) {
        const altTagsList = this.wrapper.querySelector('.alt-tags-list');
        altTagsList.innerHTML = '';

        Array.from(files).forEach((file, index) => {
            const altTagItem = document.createElement('div');
            altTagItem.className = 'alt-tag-item mb-3 p-3 border rounded bg-light';
            
            const fileName = file.name;
            const autoGeneratedAlt = this.generateAutoAltText(fileName);
            
            altTagItem.innerHTML = `
                <div class="d-flex align-items-start gap-3">
                    <div class="flex-shrink-0">
                        <div class="file-icon bg-primary text-white rounded p-2">
                            <i class="fas fa-image"></i>
                        </div>
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="mb-2 text-sm font-medium">${fileName}</h6>
                        <div class="mb-2">
                            <label class="form-label text-xs">이미지 설명 (Alt 태그)</label>
                            <textarea 
                                class="form-control form-control-sm alt-text-input" 
                                data-file-index="${index}"
                                rows="2" 
                                placeholder="SEO 최적화를 위한 이미지 설명을 입력하세요..."
                                maxlength="125"
                            ></textarea>
                            <div class="form-text text-xs">
                                <span class="text-muted">검색엔진 최적화를 위해 이미지 내용을 설명해주세요 (최대 125자)</span>
                                <span class="char-count float-end">0/125</span>
                            </div>
                        </div>
                        <div class="auto-suggestion ${autoGeneratedAlt ? '' : 'hidden'}">
                            <small class="text-muted">
                                <i class="fas fa-lightbulb text-warning me-1"></i>
                                자동 제안: <span class="auto-alt-text">${autoGeneratedAlt}</span>
                                <button type="button" class="btn btn-link btn-sm p-0 ms-2 use-suggestion" data-file-index="${index}">
                                    <i class="fas fa-check text-success"></i> 사용
                                </button>
                            </small>
                        </div>
                    </div>
                </div>
            `;
            
            altTagsList.appendChild(altTagItem);
        });

        // 이벤트 리스너 추가
        this.bindAltTagEvents();
    }

    bindAltTagEvents() {
        // 글자 수 카운터
        this.wrapper.querySelectorAll('.alt-text-input').forEach(input => {
            const charCount = input.closest('.alt-tag-item').querySelector('.char-count');
            
            input.addEventListener('input', () => {
                const length = input.value.length;
                charCount.textContent = `${length}/125`;
                charCount.className = length > 100 ? 'char-count float-end text-warning' : 'char-count float-end text-muted';
            });
        });

        // 자동 제안 사용 버튼
        this.wrapper.querySelectorAll('.use-suggestion').forEach(button => {
            button.addEventListener('click', () => {
                const fileIndex = button.dataset.fileIndex;
                const altInput = this.wrapper.querySelector(`.alt-text-input[data-file-index="${fileIndex}"]`);
                const suggestedText = button.closest('.auto-suggestion').querySelector('.auto-alt-text').textContent;
                
                altInput.value = suggestedText;
                altInput.dispatchEvent(new Event('input'));
                
                // 사용된 제안 표시
                button.innerHTML = '<i class="fas fa-check text-success"></i> 적용됨';
                button.disabled = true;
            });
        });
    }

    generateAutoAltText(fileName) {
        // 파일명 기반 자동 alt 텍스트 생성
        const cleanName = fileName
            .replace(/\.[^/.]+$/, '') // 확장자 제거
            .replace(/[_-]/g, ' ')    // 언더스코어, 하이픈을 공백으로
            .replace(/\d+/g, '')      // 숫자 제거
            .trim();

        if (!cleanName) return '';

        // 한글인지 확인
        const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(cleanName);
        
        if (isKorean) {
            // 한글 파일명 처리
            if (cleanName.includes('시설') || cleanName.includes('요양원')) {
                return `${cleanName} 시설 사진`;
            } else if (cleanName.includes('프로필') || cleanName.includes('증명')) {
                return `${cleanName} 이미지`;
            } else {
                return `${cleanName} 사진`;
            }
        } else {
            // 영문 파일명 처리
            const words = cleanName.toLowerCase().split(/\s+/).filter(word => word.length > 0);
            
            if (words.length === 0) return '';
            
            // 시설 관련 키워드
            if (words.some(word => ['facility', 'nursing', 'care', 'hospital'].includes(word))) {
                return `${this.capitalizeWords(cleanName)} facility image`;
            }
            // 프로필 관련 키워드  
            else if (words.some(word => ['profile', 'avatar', 'user', 'member'].includes(word))) {
                return `${this.capitalizeWords(cleanName)} profile picture`;
            }
            // 일반적인 경우
            else {
                return `${this.capitalizeWords(cleanName)} image`;
            }
        }
    }

    capitalizeWords(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }

    getAltTexts() {
        const altTexts = [];
        const inputs = this.wrapper.querySelectorAll('.alt-text-input');
        const autoGenerate = this.wrapper.querySelector('#autoGenerateAlt').checked;
        
        inputs.forEach((input, index) => {
            let altText = input.value.trim();
            
            // 자동 생성이 활성화되고 입력값이 없으면 자동 생성
            if (!altText && autoGenerate && this.originalFiles[index]) {
                altText = this.generateAutoAltText(this.originalFiles[index].name);
            }
            
            altTexts.push(altText);
        });
        
        return altTexts;
    }

    // 압축된 파일과 함께 alt 텍스트도 반환하도록 수정
    async compressImages() {
        if (this.originalFiles.length === 0) return;

        this.progressArea.classList.remove('hidden');
        const progressFill = this.wrapper.querySelector('.progress-fill');
        const progressText = this.wrapper.querySelector('.compression-progress p');

        const altTexts = this.getAltTexts();

        this.compressor.setProgressCallback((current, total, result) => {
            const percentage = Math.round((current / total) * 100);
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `압축 진행 중... (${current}/${total})`;

            // 개별 파일 결과 업데이트
            this.updatePreviewResult(current - 1, result);
        });

        try {
            const results = await this.compressor.compressFiles(this.originalFiles);
            this.compressedFiles = results.map(result => result.file).filter(file => file);
            
            // 압축된 파일에 alt 텍스트 메타데이터 추가
            this.compressedFiles.forEach((file, index) => {
                if (altTexts[index]) {
                    file.altText = altTexts[index];
                }
            });
            
            // 원본 input에 압축된 파일 설정
            this.updateOriginalInput();
            
            // alt 텍스트를 히든 필드에 저장
            this.updateAltTextHiddenFields(altTexts);
            
            progressText.textContent = '압축 완료!';
            
            // 총 압축 결과 표시
            this.showCompressionSummary(results);
            
        } catch (error) {
            console.error('압축 중 오류 발생:', error);
            progressText.textContent = '압축 중 오류가 발생했습니다.';
        }
    }

    updateAltTextHiddenFields(altTexts) {
        // 기존 히든 필드들 제거
        this.wrapper.querySelectorAll('input[name*="altText"]').forEach(input => input.remove());
        
        // 새로운 히든 필드들 생성
        altTexts.forEach((altText, index) => {
            if (altText) {
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = `${this.input.name}_altText_${index}`;
                hiddenInput.value = altText;
                this.wrapper.appendChild(hiddenInput);
            }
        });

        // 단일 파일인 경우 기본 이름으로도 생성
        if (altTexts.length === 1 && altTexts[0]) {
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = `${this.input.name.replace('File', 'AltText')}`;
            hiddenInput.value = altTexts[0];
            this.wrapper.appendChild(hiddenInput);
        }
    }
}

// 전역 사용을 위한 함수
window.ImageCompressor = ImageCompressor;
window.ImageCompressorUI = ImageCompressorUI;

// 자동 초기화 (data-image-compressor 속성이 있는 input들에 대해)
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input[type="file"][data-image-compressor]');
    inputs.forEach(input => {
        const options = input.dataset.imageCompressor ? JSON.parse(input.dataset.imageCompressor) : {};
        new ImageCompressorUI(`#${input.id}`, options);
    });
});