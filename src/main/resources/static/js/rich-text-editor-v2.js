/**
 * 라이트케어 전용 리치 텍스트 에디터 v2.0
 * 보안 강화 및 성능 최적화 버전
 * - 이미지 업로드 기능 제거로 보안 강화
 * - 간소화된 툴바로 사용성 개선
 * - 메모리 사용량 최적화
 */
class RichTextEditorV2 {
    constructor(selector, options = {}) {
        this.element = document.querySelector(selector);
        if (!this.element) {
            console.error('RichTextEditorV2: Element not found:', selector);
            return;
        }

        // 기본 옵션 설정
        this.options = {
            height: options.height || '300px',
            placeholder: options.placeholder || '내용을 입력하세요...',
            enableTable: options.enableTable !== false,
            enableLink: options.enableLink !== false,
            maxLength: options.maxLength || 10000,
            // 이미지 업로드 기능 완전 제거
            enableImage: false,
            // 보안상 위험한 기능들 제거
            enableSourceCode: false,
            enableFullscreen: false,
            // 단순화된 툴바
            toolbar: options.toolbar || [
                'bold', 'italic', 'underline',
                '|',
                'fontSize', 'color',
                '|',
                'alignLeft', 'alignCenter', 'alignRight',
                '|',
                'orderedList', 'unorderedList',
                '|',
                'link', 'table',
                '|',
                'blockquote',
                '|',
                'undo', 'redo'
            ],
            ...options
        };

        this.init();
    }

    init() {
        this.createEditor();
        this.bindEvents();
        this.initializeContent();
        this.setupAccessibility();
    }

    createEditor() {
        // 기존 textarea 숨기기
        this.element.style.display = 'none';

        // 에디터 컨테이너 생성
        this.container = document.createElement('div');
        this.container.className = 'rich-text-editor-v2';
        this.container.setAttribute('role', 'textbox');
        this.container.setAttribute('aria-label', '리치 텍스트 에디터');
        
        this.container.innerHTML = `
            <div class="rte-toolbar" role="toolbar" aria-label="편집 도구">
                ${this.generateToolbar()}
            </div>
            <div class="rte-content" 
                 contenteditable="true" 
                 style="height: ${this.options.height}"
                 role="textbox"
                 aria-multiline="true"
                 aria-label="텍스트 입력 영역">
                ${this.options.placeholder ? `<p class="rte-placeholder">${this.options.placeholder}</p>` : ''}
            </div>
            <div class="rte-statusbar">
                <span class="rte-char-count">글자 수: 0 / ${this.options.maxLength}</span>
                <span class="rte-word-count">단어 수: 0</span>
            </div>
        `;

        // textarea 다음에 에디터 삽입
        this.element.parentNode.insertBefore(this.container, this.element.nextSibling);

        // 에디터 요소들 참조 저장
        this.toolbar = this.container.querySelector('.rte-toolbar');
        this.content = this.container.querySelector('.rte-content');
        this.statusbar = this.container.querySelector('.rte-statusbar');
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
            'bold': '<button type="button" class="rte-btn" data-command="bold" title="굵게 (Ctrl+B)" aria-label="굵게"><i class="fas fa-bold"></i></button>',
            'italic': '<button type="button" class="rte-btn" data-command="italic" title="기울임 (Ctrl+I)" aria-label="기울임"><i class="fas fa-italic"></i></button>',
            'underline': '<button type="button" class="rte-btn" data-command="underline" title="밑줄 (Ctrl+U)" aria-label="밑줄"><i class="fas fa-underline"></i></button>',
            
            'fontSize': `<select class="rte-select" data-command="fontSize" title="글자 크기" aria-label="글자 크기">
                <option value="">크기</option>
                <option value="1">매우 작게</option>
                <option value="2">작게</option>
                <option value="3">보통</option>
                <option value="4">크게</option>
                <option value="5">매우 크게</option>
            </select>`,
            
            'color': '<input type="color" class="rte-color" data-command="foreColor" title="글자 색상" aria-label="글자 색상" value="#000000">',
            
            'alignLeft': '<button type="button" class="rte-btn" data-command="justifyLeft" title="왼쪽 정렬" aria-label="왼쪽 정렬"><i class="fas fa-align-left"></i></button>',
            'alignCenter': '<button type="button" class="rte-btn" data-command="justifyCenter" title="가운데 정렬" aria-label="가운데 정렬"><i class="fas fa-align-center"></i></button>',
            'alignRight': '<button type="button" class="rte-btn" data-command="justifyRight" title="오른쪽 정렬" aria-label="오른쪽 정렬"><i class="fas fa-align-right"></i></button>',
            
            'orderedList': '<button type="button" class="rte-btn" data-command="insertOrderedList" title="번호 목록" aria-label="번호 목록"><i class="fas fa-list-ol"></i></button>',
            'unorderedList': '<button type="button" class="rte-btn" data-command="insertUnorderedList" title="글머리 목록" aria-label="글머리 목록"><i class="fas fa-list-ul"></i></button>',
            
            'link': '<button type="button" class="rte-btn" data-command="createLink" title="링크 삽입" aria-label="링크 삽입"><i class="fas fa-link"></i></button>',
            'table': '<button type="button" class="rte-btn" data-command="insertTable" title="테이블 삽입" aria-label="테이블 삽입"><i class="fas fa-table"></i></button>',
            
            'blockquote': '<button type="button" class="rte-btn" data-command="blockquote" title="인용문" aria-label="인용문"><i class="fas fa-quote-left"></i></button>',
            
            'undo': '<button type="button" class="rte-btn" data-command="undo" title="실행 취소 (Ctrl+Z)" aria-label="실행 취소"><i class="fas fa-undo"></i></button>',
            'redo': '<button type="button" class="rte-btn" data-command="redo" title="다시 실행 (Ctrl+Y)" aria-label="다시 실행"><i class="fas fa-redo"></i></button>'
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
            this.validateLength();
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

        // 붙여넣기 이벤트 - 보안 강화
        this.content.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });
    }

    executeCommand(command, value = null) {
        this.content.focus();

        switch (command) {
            case 'createLink':
                this.insertLink();
                break;
            case 'insertTable':
                this.insertTable();
                break;
            case 'blockquote':
                this.insertBlockquote();
                break;
            case 'fontSize':
                if (value) {
                    document.execCommand('fontSize', false, value);
                }
                break;
            case 'foreColor':
                document.execCommand(command, false, value);
                break;
            default:
                document.execCommand(command, false, value);
        }

        this.updateOriginalTextarea();
    }

    insertLink() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        // URL 입력 다이얼로그
        const url = prompt('링크 URL을 입력하세요:', 'https://');
        if (!url || url === 'https://') return;

        // URL 검증 (보안 강화)
        if (!this.isValidUrl(url)) {
            alert('올바른 URL 형식이 아닙니다.');
            return;
        }
        
        const linkText = selectedText || prompt('링크 텍스트를 입력하세요:', url);
        if (linkText) {
            // XSS 방지를 위한 HTML 인코딩
            const safeUrl = this.escapeHtml(url);
            const safeLinkText = this.escapeHtml(linkText);
            const link = `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeLinkText}</a>`;
            this.insertHTML(link);
        }
    }

    insertTable() {
        const rows = prompt('행 수를 입력하세요:', '3');
        const cols = prompt('열 수를 입력하세요:', '3');
        
        if (rows && cols && !isNaN(rows) && !isNaN(cols)) {
            const numRows = Math.min(parseInt(rows), 20); // 최대 20행으로 제한
            const numCols = Math.min(parseInt(cols), 10); // 최대 10열로 제한
            
            let table = '<table class="rte-table table table-bordered"><tbody>';
            
            for (let i = 0; i < numRows; i++) {
                table += '<tr>';
                for (let j = 0; j < numCols; j++) {
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
        const selectedText = selection.toString().trim();
        
        if (selectedText) {
            const safeText = this.escapeHtml(selectedText);
            const blockquote = `<blockquote class="blockquote">${safeText}</blockquote>`;
            this.insertHTML(blockquote);
        } else {
            const blockquote = '<blockquote class="blockquote">인용문을 입력하세요...</blockquote>';
            this.insertHTML(blockquote);
        }
    }

    insertHTML(html) {
        if (document.queryCommandSupported('insertHTML')) {
            document.execCommand('insertHTML', false, html);
        } else {
            // IE 호환성을 위한 대안
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                const div = document.createElement('div');
                div.innerHTML = html;
                const frag = document.createDocumentFragment();
                while (div.firstChild) {
                    frag.appendChild(div.firstChild);
                }
                range.insertNode(frag);
            }
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
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.executeCommand('redo');
                    } else {
                        e.preventDefault();
                        this.executeCommand('undo');
                    }
                    break;
                case 'y':
                    e.preventDefault();
                    this.executeCommand('redo');
                    break;
            }
        }
    }

    handlePaste(e) {
        e.preventDefault();
        
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedData = clipboardData.getData('text/plain');
        
        // 텍스트만 허용하고 HTML 태그 제거 (보안 강화)
        const cleanText = this.stripHtml(pastedData);
        const safeText = this.escapeHtml(cleanText);
        
        this.insertHTML(safeText);
    }

    updateOriginalTextarea() {
        // HTML 내용을 원본 textarea에 업데이트
        let content = this.content.innerHTML;
        
        // 플레이스홀더 제거
        if (content === `<p class="rte-placeholder">${this.options.placeholder}</p>`) {
            content = '';
        }
        
        this.element.value = content;
        
        // change 이벤트 발생
        const event = new Event('change', { bubbles: true });
        this.element.dispatchEvent(event);
    }

    updateStatusBar() {
        const text = this.content.textContent || this.content.innerText || '';
        const charCount = text.length;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        const charCountElement = this.statusbar.querySelector('.rte-char-count');
        const wordCountElement = this.statusbar.querySelector('.rte-word-count');
        
        if (charCountElement) {
            charCountElement.textContent = `글자 수: ${charCount} / ${this.options.maxLength}`;
            
            // 글자 수 초과 시 경고 표시
            if (charCount > this.options.maxLength) {
                charCountElement.classList.add('text-danger');
            } else {
                charCountElement.classList.remove('text-danger');
            }
        }
        
        if (wordCountElement) {
            wordCountElement.textContent = `단어 수: ${wordCount}`;
        }
    }

    handlePlaceholder() {
        const text = this.content.textContent || this.content.innerText || '';
        const hasPlaceholder = this.content.querySelector('.rte-placeholder');
        
        if (text.trim() === '' && !hasPlaceholder) {
            this.content.innerHTML = `<p class="rte-placeholder">${this.options.placeholder}</p>`;
        } else if (text.trim() !== '' && hasPlaceholder) {
            hasPlaceholder.remove();
        }
    }

    validateLength() {
        const text = this.content.textContent || this.content.innerText || '';
        
        if (text.length > this.options.maxLength) {
            // 글자 수 초과 시 내용 자르기
            const truncatedText = text.substring(0, this.options.maxLength);
            this.content.textContent = truncatedText;
            
            // 커서를 마지막으로 이동
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(this.content);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // 경고 메시지 표시
            this.showWarning(`최대 ${this.options.maxLength}자까지 입력 가능합니다.`);
        }
    }

    setupAccessibility() {
        // 에디터에 ARIA 속성 추가
        this.content.setAttribute('aria-label', '리치 텍스트 에디터 내용 영역');
        this.content.setAttribute('aria-describedby', 'rte-help-text');
        
        // 도움말 텍스트 추가
        const helpText = document.createElement('div');
        helpText.id = 'rte-help-text';
        helpText.className = 'sr-only';
        helpText.textContent = '리치 텍스트 에디터입니다. 텍스트 서식을 지정할 수 있습니다.';
        this.container.appendChild(helpText);
    }

    initializeContent() {
        if (this.element.value) {
            // 기존 값이 있으면 에디터에 설정
            const safeContent = this.sanitizeContent(this.element.value);
            this.content.innerHTML = safeContent;
        }
        
        this.handlePlaceholder();
        this.updateStatusBar();
    }

    // 보안 관련 유틸리티 메서드들
    isValidUrl(url) {
        try {
            const urlObject = new URL(url);
            return ['http:', 'https:', 'mailto:'].includes(urlObject.protocol);
        } catch {
            return false;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    sanitizeContent(content) {
        // 허용된 태그만 남기고 나머지 제거
        const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ol', 'ul', 'li', 'blockquote', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'a'];
        const div = document.createElement('div');
        div.innerHTML = content;
        
        // 허용되지 않은 태그 제거
        const allElements = div.querySelectorAll('*');
        allElements.forEach(el => {
            if (!allowedTags.includes(el.tagName.toLowerCase())) {
                el.remove();
            }
        });
        
        return div.innerHTML;
    }

    showWarning(message) {
        // 간단한 경고 메시지 표시
        const warning = document.createElement('div');
        warning.className = 'rte-warning alert alert-warning alert-dismissible fade show';
        warning.style.position = 'fixed';
        warning.style.top = '20px';
        warning.style.right = '20px';
        warning.style.zIndex = '9999';
        warning.style.maxWidth = '300px';
        warning.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(warning);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (warning.parentNode) {
                warning.remove();
            }
        }, 3000);
    }

    // 공개 API 메서드들
    getContent() {
        return this.content.innerHTML;
    }

    setContent(html) {
        const safeContent = this.sanitizeContent(html);
        this.content.innerHTML = safeContent;
        this.updateOriginalTextarea();
        this.updateStatusBar();
        this.handlePlaceholder();
    }

    getTextContent() {
        return this.content.textContent || this.content.innerText || '';
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
window.RichTextEditorV2 = RichTextEditorV2;

// 자동 초기화 (data-rich-editor 속성이 있는 textarea들에 대해)
document.addEventListener('DOMContentLoaded', () => {
    const textareas = document.querySelectorAll('textarea[data-rich-editor]');
    textareas.forEach(textarea => {
        try {
            const options = textarea.dataset.richEditor ? JSON.parse(textarea.dataset.richEditor) : {};
            
            // 이미지 업로드 기능 강제 비활성화
            options.enableImage = false;
            
            // 최대 길이 설정
            if (textarea.maxLength > 0) {
                options.maxLength = textarea.maxLength;
            }
            
            new RichTextEditorV2(`#${textarea.id}`, options);
        } catch (error) {
            console.error('RichTextEditorV2 초기화 실패:', error);
            // 실패 시 기본 textarea 사용
        }
    });
});

console.log('✅ RichTextEditorV2 로드 완료 - 보안 강화 버전');