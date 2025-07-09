/**
 * 라이트케어 전용 리치 텍스트 에디터
 * 테이블, 이미지, 링크 등 고급 서식 기능 지원
 */
class RichTextEditor {
    constructor(selector, options = {}) {
        this.element = document.querySelector(selector);
        if (!this.element) {
            console.error('RichTextEditor: Element not found:', selector);
            return;
        }

        this.options = {
            height: options.height || '300px',
            placeholder: options.placeholder || '내용을 입력하세요...',
            enableImage: options.enableImage !== false,
            enableTable: options.enableTable !== false,
            enableLink: options.enableLink !== false,
            imageUploadUrl: options.imageUploadUrl || '/api/upload/image',
            maxImageSize: options.maxImageSize || 5 * 1024 * 1024, // 5MB
            allowedImageTypes: options.allowedImageTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            toolbar: options.toolbar || [
                'bold', 'italic', 'underline', 'strikethrough',
                '|',
                'fontSize', 'color', 'backgroundColor',
                '|',
                'alignLeft', 'alignCenter', 'alignRight', 'alignJustify',
                '|',
                'orderedList', 'unorderedList', 'indent', 'outdent',
                '|',
                'link', 'image', 'table',
                '|',
                'blockquote', 'codeBlock',
                '|',
                'undo', 'redo',
                '|',
                'fullscreen', 'sourceCode'
            ],
            ...options
        };

        this.init();
    }

    init() {
        this.createEditor();
        this.bindEvents();
        this.initializeContent();
    }

    createEditor() {
        // 기존 textarea 숨기기
        this.element.style.display = 'none';

        // 에디터 컨테이너 생성
        this.container = document.createElement('div');
        this.container.className = 'rich-text-editor';
        this.container.innerHTML = `
            <div class="rte-toolbar">
                ${this.generateToolbar()}
            </div>
            <div class="rte-content" contenteditable="true" style="height: ${this.options.height}">
                ${this.options.placeholder ? `<p class="rte-placeholder">${this.options.placeholder}</p>` : ''}
            </div>
            <div class="rte-statusbar">
                <span class="rte-word-count">단어 수: 0</span>
                <span class="rte-char-count">글자 수: 0</span>
            </div>
        `;

        // textarea 다음에 에디터 삽입
        this.element.parentNode.insertBefore(this.container, this.element.nextSibling);

        // 에디터 요소들 참조 저장
        this.toolbar = this.container.querySelector('.rte-toolbar');
        this.content = this.container.querySelector('.rte-content');
        this.statusbar = this.container.querySelector('.rte-statusbar');

        // 히든 파일 입력 생성 (이미지 업로드용)
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = this.options.allowedImageTypes.join(',');
        this.fileInput.style.display = 'none';
        this.container.appendChild(this.fileInput);
    }

    generateToolbar() {
        const toolbarGroups = [];
        let currentGroup = [];

        this.options.toolbar.forEach(tool => {
            if (tool === '|') {
                if (currentGroup.length > 0) {
                    toolbarGroups.push(currentGroup);
                    currentGroup = [];
                }
            } else {
                currentGroup.push(tool);
            }
        });

        if (currentGroup.length > 0) {
            toolbarGroups.push(currentGroup);
        }

        return toolbarGroups.map(group => 
            `<div class="rte-toolbar-group">
                ${group.map(tool => this.generateToolButton(tool)).join('')}
            </div>`
        ).join('');
    }

    generateToolButton(tool) {
        const buttons = {
            'bold': '<button type="button" class="rte-btn" data-command="bold" title="굵게 (Ctrl+B)"><i class="fas fa-bold"></i></button>',
            'italic': '<button type="button" class="rte-btn" data-command="italic" title="기울임 (Ctrl+I)"><i class="fas fa-italic"></i></button>',
            'underline': '<button type="button" class="rte-btn" data-command="underline" title="밑줄 (Ctrl+U)"><i class="fas fa-underline"></i></button>',
            'strikethrough': '<button type="button" class="rte-btn" data-command="strikeThrough" title="취소선"><i class="fas fa-strikethrough"></i></button>',
            
            'fontSize': `<select class="rte-select" data-command="fontSize" title="글자 크기">
                <option value="">크기</option>
                <option value="1">매우 작게</option>
                <option value="2">작게</option>
                <option value="3">보통</option>
                <option value="4">크게</option>
                <option value="5">매우 크게</option>
                <option value="6">더 크게</option>
                <option value="7">가장 크게</option>
            </select>`,
            
            'color': '<input type="color" class="rte-color" data-command="foreColor" title="글자 색상" value="#000000">',
            'backgroundColor': '<input type="color" class="rte-color" data-command="backColor" title="배경 색상" value="#ffffff">',
            
            'alignLeft': '<button type="button" class="rte-btn" data-command="justifyLeft" title="왼쪽 정렬"><i class="fas fa-align-left"></i></button>',
            'alignCenter': '<button type="button" class="rte-btn" data-command="justifyCenter" title="가운데 정렬"><i class="fas fa-align-center"></i></button>',
            'alignRight': '<button type="button" class="rte-btn" data-command="justifyRight" title="오른쪽 정렬"><i class="fas fa-align-right"></i></button>',
            'alignJustify': '<button type="button" class="rte-btn" data-command="justifyFull" title="양쪽 정렬"><i class="fas fa-align-justify"></i></button>',
            
            'orderedList': '<button type="button" class="rte-btn" data-command="insertOrderedList" title="번호 목록"><i class="fas fa-list-ol"></i></button>',
            'unorderedList': '<button type="button" class="rte-btn" data-command="insertUnorderedList" title="글머리 목록"><i class="fas fa-list-ul"></i></button>',
            'indent': '<button type="button" class="rte-btn" data-command="indent" title="들여쓰기"><i class="fas fa-indent"></i></button>',
            'outdent': '<button type="button" class="rte-btn" data-command="outdent" title="내어쓰기"><i class="fas fa-outdent"></i></button>',
            
            'link': '<button type="button" class="rte-btn" data-command="createLink" title="링크 삽입"><i class="fas fa-link"></i></button>',
            'image': '<button type="button" class="rte-btn" data-command="insertImage" title="이미지 삽입"><i class="fas fa-image"></i></button>',
            'table': '<button type="button" class="rte-btn" data-command="insertTable" title="테이블 삽입"><i class="fas fa-table"></i></button>',
            
            'blockquote': '<button type="button" class="rte-btn" data-command="blockquote" title="인용문"><i class="fas fa-quote-left"></i></button>',
            'codeBlock': '<button type="button" class="rte-btn" data-command="code" title="코드 블록"><i class="fas fa-code"></i></button>',
            
            'undo': '<button type="button" class="rte-btn" data-command="undo" title="실행 취소 (Ctrl+Z)"><i class="fas fa-undo"></i></button>',
            'redo': '<button type="button" class="rte-btn" data-command="redo" title="다시 실행 (Ctrl+Y)"><i class="fas fa-redo"></i></button>',
            
            'fullscreen': '<button type="button" class="rte-btn" data-command="fullscreen" title="전체화면"><i class="fas fa-expand"></i></button>',
            'sourceCode': '<button type="button" class="rte-btn" data-command="sourceCode" title="소스 코드 보기"><i class="fas fa-code"></i></button>'
        };

        return buttons[tool] || '';
    }

    bindEvents() {
        // 툴바 버튼 클릭 이벤트
        this.toolbar.addEventListener('click', (e) => {
            const button = e.target.closest('.rte-btn');
            if (button) {
                e.preventDefault();
                this.executeCommand(button.dataset.command);
            }
        });

        // 셀렉트 박스 변경 이벤트
        this.toolbar.addEventListener('change', (e) => {
            if (e.target.classList.contains('rte-select')) {
                this.executeCommand(e.target.dataset.command, e.target.value);
            }
        });

        // 색상 선택 이벤트
        this.toolbar.addEventListener('input', (e) => {
            if (e.target.classList.contains('rte-color')) {
                this.executeCommand(e.target.dataset.command, e.target.value);
            }
        });

        // 에디터 내용 변경 이벤트
        this.content.addEventListener('input', () => {
            this.updateOriginalTextarea();
            this.updateStatusBar();
            this.handlePlaceholder();
        });

        // 에디터 포커스 이벤트
        this.content.addEventListener('focus', () => {
            this.handlePlaceholder();
        });

        // 에디터 블러 이벤트
        this.content.addEventListener('blur', () => {
            this.handlePlaceholder();
        });

        // 키보드 단축키
        this.content.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // 파일 입력 변경 이벤트
        this.fileInput.addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });

        // 드래그 앤 드롭 이벤트
        this.content.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.content.classList.add('rte-dragover');
        });

        this.content.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.content.classList.remove('rte-dragover');
        });

        this.content.addEventListener('drop', (e) => {
            e.preventDefault();
            this.content.classList.remove('rte-dragover');
            
            const files = Array.from(e.dataTransfer.files);
            const imageFile = files.find(file => this.options.allowedImageTypes.includes(file.type));
            
            if (imageFile) {
                this.handleImageUpload(imageFile);
            }
        });
    }

    executeCommand(command, value = null) {
        this.content.focus();

        switch (command) {
            case 'createLink':
                this.insertLink();
                break;
            case 'insertImage':
                this.insertImage();
                break;
            case 'insertTable':
                this.insertTable();
                break;
            case 'blockquote':
                this.insertBlockquote();
                break;
            case 'code':
                this.insertCodeBlock();
                break;
            case 'fullscreen':
                this.toggleFullscreen();
                break;
            case 'sourceCode':
                this.toggleSourceCode();
                break;
            case 'fontSize':
                if (value) {
                    document.execCommand('fontSize', false, value);
                }
                break;
            case 'foreColor':
            case 'backColor':
                document.execCommand(command, false, value);
                break;
            default:
                document.execCommand(command, false, value);
        }

        this.updateOriginalTextarea();
    }

    insertLink() {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        const url = prompt('링크 URL을 입력하세요:', 'https://');
        if (url && url !== 'https://') {
            const linkText = selectedText || prompt('링크 텍스트를 입력하세요:', url);
            if (linkText) {
                const link = `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
                this.insertHTML(link);
            }
        }
    }

    insertImage() {
        this.fileInput.click();
    }

    async handleImageUpload(file) {
        if (!file) return;

        // 파일 타입 검증
        if (!this.options.allowedImageTypes.includes(file.type)) {
            alert('지원되지 않는 이미지 형식입니다.');
            return;
        }

        // 파일 크기 검증
        if (file.size > this.options.maxImageSize) {
            alert(`이미지 크기는 ${this.formatFileSize(this.options.maxImageSize)} 이하여야 합니다.`);
            return;
        }

        // 로딩 표시
        const loadingImg = '<span class="rte-loading">이미지 업로드 중... <i class="fas fa-spinner fa-spin"></i></span>';
        this.insertHTML(loadingImg);

        try {
            // 이미지 압축 (이전에 만든 ImageCompressor 사용)
            if (window.ImageCompressor) {
                const compressor = new ImageCompressor({
                    quality: 0.8,
                    maxWidth: 1200,
                    maxHeight: 800
                });
                
                const result = await compressor.compressFile(file);
                file = result.file;
            }

            // 임시로 base64로 변환하여 미리보기 표시
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = `<img src="${e.target.result}" alt="업로드된 이미지" style="max-width: 100%; height: auto;" class="rte-uploaded-image">`;
                
                // 로딩 스피너 제거 후 이미지 삽입
                const loadingSpan = this.content.querySelector('.rte-loading');
                if (loadingSpan) {
                    loadingSpan.outerHTML = img;
                } else {
                    this.insertHTML(img);
                }
                
                this.updateOriginalTextarea();
            };
            reader.readAsDataURL(file);

            // 실제 서버 업로드는 폼 제출 시 처리하거나 별도 API 호출
            
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            alert('이미지 업로드에 실패했습니다.');
            
            // 로딩 스피너 제거
            const loadingSpan = this.content.querySelector('.rte-loading');
            if (loadingSpan) {
                loadingSpan.remove();
            }
        }
    }

    insertTable() {
        const rows = prompt('행 수를 입력하세요:', '3');
        const cols = prompt('열 수를 입력하세요:', '3');
        
        if (rows && cols && !isNaN(rows) && !isNaN(cols)) {
            let table = '<table class="rte-table table table-bordered"><tbody>';
            
            for (let i = 0; i < parseInt(rows); i++) {
                table += '<tr>';
                for (let j = 0; j < parseInt(cols); j++) {
                    table += '<td>&nbsp;</td>';
                }
                table += '</tr>';
            }
            
            table += '</tbody></table><p>&nbsp;</p>';
            this.insertHTML(table);
        }
    }

    insertBlockquote() {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        if (selectedText) {
            const blockquote = `<blockquote class="blockquote">${selectedText}</blockquote>`;
            this.insertHTML(blockquote);
        } else {
            const blockquote = '<blockquote class="blockquote">인용문을 입력하세요...</blockquote>';
            this.insertHTML(blockquote);
        }
    }

    insertCodeBlock() {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        if (selectedText) {
            const code = `<pre><code>${selectedText}</code></pre>`;
            this.insertHTML(code);
        } else {
            const code = '<pre><code>코드를 입력하세요...</code></pre>';
            this.insertHTML(code);
        }
    }

    insertHTML(html) {
        if (document.queryCommandSupported('insertHTML')) {
            document.execCommand('insertHTML', false, html);
        } else {
            // fallback for browsers that don't support insertHTML
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                
                const div = document.createElement('div');
                div.innerHTML = html;
                
                const fragment = document.createDocumentFragment();
                while (div.firstChild) {
                    fragment.appendChild(div.firstChild);
                }
                
                range.insertNode(fragment);
            }
        }
    }

    toggleFullscreen() {
        this.container.classList.toggle('rte-fullscreen');
        const btn = this.toolbar.querySelector('[data-command="fullscreen"] i');
        btn.className = this.container.classList.contains('rte-fullscreen') 
            ? 'fas fa-compress' 
            : 'fas fa-expand';
    }

    toggleSourceCode() {
        const isSourceMode = this.container.classList.contains('rte-source-mode');
        
        if (isSourceMode) {
            // 소스 모드에서 에디터 모드로
            const sourceTextarea = this.container.querySelector('.rte-source-textarea');
            this.content.innerHTML = sourceTextarea.value;
            sourceTextarea.remove();
            this.container.classList.remove('rte-source-mode');
        } else {
            // 에디터 모드에서 소스 모드로
            const sourceTextarea = document.createElement('textarea');
            sourceTextarea.className = 'rte-source-textarea';
            sourceTextarea.style.cssText = `
                width: 100%;
                height: ${this.options.height};
                border: none;
                outline: none;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                padding: 10px;
                resize: none;
            `;
            sourceTextarea.value = this.content.innerHTML;
            
            this.content.style.display = 'none';
            this.content.parentNode.appendChild(sourceTextarea);
            this.container.classList.add('rte-source-mode');
        }
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    this.executeCommand('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    this.executeCommand('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    this.executeCommand('underline');
                    break;
                case 'z':
                    e.preventDefault();
                    this.executeCommand('undo');
                    break;
                case 'y':
                    e.preventDefault();
                    this.executeCommand('redo');
                    break;
            }
        }
    }

    handlePlaceholder() {
        const placeholder = this.content.querySelector('.rte-placeholder');
        const isEmpty = this.content.textContent.trim() === '' || 
                       (this.content.innerHTML.trim() === '<p class="rte-placeholder">' + this.options.placeholder + '</p>');

        if (isEmpty && !placeholder) {
            this.content.innerHTML = `<p class="rte-placeholder">${this.options.placeholder}</p>`;
        } else if (!isEmpty && placeholder) {
            placeholder.remove();
        }
    }

    updateOriginalTextarea() {
        let content = this.content.innerHTML;
        
        // placeholder 제거
        if (content.includes('rte-placeholder')) {
            content = '';
        }
        
        this.element.value = content;
        
        // 변경 이벤트 발생
        this.element.dispatchEvent(new Event('input', { bubbles: true }));
        this.element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    updateStatusBar() {
        const text = this.content.textContent || '';
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        
        this.statusbar.querySelector('.rte-word-count').textContent = `단어 수: ${words}`;
        this.statusbar.querySelector('.rte-char-count').textContent = `글자 수: ${chars}`;
    }

    initializeContent() {
        if (this.element.value) {
            this.content.innerHTML = this.element.value;
        }
        this.updateStatusBar();
        this.handlePlaceholder();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 공개 API
    getContent() {
        return this.content.innerHTML;
    }

    setContent(html) {
        this.content.innerHTML = html;
        this.updateOriginalTextarea();
        this.updateStatusBar();
        this.handlePlaceholder();
    }

    focus() {
        this.content.focus();
    }

    destroy() {
        if (this.container) {
            this.container.remove();
        }
        this.element.style.display = '';
    }
}

// 전역 사용을 위한 함수
window.RichTextEditor = RichTextEditor;

// 자동 초기화 (data-rich-editor 속성이 있는 textarea들에 대해)
document.addEventListener('DOMContentLoaded', () => {
    const textareas = document.querySelectorAll('textarea[data-rich-editor]');
    textareas.forEach(textarea => {
        const options = textarea.dataset.richEditor ? JSON.parse(textarea.dataset.richEditor) : {};
        new RichTextEditor(`#${textarea.id}`, options);
    });
});