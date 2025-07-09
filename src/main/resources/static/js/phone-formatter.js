/**
 * 한국 전화번호 포맷팅 유틸리티
 * 지역번호별 정확한 형식 적용
 */
class PhoneFormatter {
    constructor() {
        // 지역번호별 패턴 정의
        this.patterns = {
            // 서울 (02): 2-3-4 또는 2-4-4
            '^02': [
                { pattern: /^(02)(\d{3})(\d{4})$/, format: '$1-$2-$3' },
                { pattern: /^(02)(\d{4})(\d{4})$/, format: '$1-$2-$3' }
            ],
            // 부산(051), 대구(053), 인천(032), 광주(062), 대전(042), 울산(052): 3-3-4
            '^(051|053|032|062|042|052)': [
                { pattern: /^(051|053|032|062|042|052)(\d{3})(\d{4})$/, format: '$1-$2-$3' }
            ],
            // 경기 지역 (031): 3-3-4 또는 3-4-4
            '^031': [
                { pattern: /^(031)(\d{3})(\d{4})$/, format: '$1-$2-$3' },
                { pattern: /^(031)(\d{4})(\d{4})$/, format: '$1-$2-$3' }
            ],
            // 강원도 (033): 3-3-4
            '^033': [
                { pattern: /^(033)(\d{3})(\d{4})$/, format: '$1-$2-$3' }
            ],
            // 충북 (043): 3-3-4
            '^043': [
                { pattern: /^(043)(\d{3})(\d{4})$/, format: '$1-$2-$3' }
            ],
            // 충남 (041): 3-3-4
            '^041': [
                { pattern: /^(041)(\d{3})(\d{4})$/, format: '$1-$2-$3' }
            ],
            // 전북 (063): 3-3-4
            '^063': [
                { pattern: /^(063)(\d{3})(\d{4})$/, format: '$1-$2-$3' }
            ],
            // 전남 (061): 3-3-4
            '^061': [
                { pattern: /^(061)(\d{3})(\d{4})$/, format: '$1-$2-$3' }
            ],
            // 경북 (054): 3-3-4
            '^054': [
                { pattern: /^(054)(\d{3})(\d{4})$/, format: '$1-$2-$3' }
            ],
            // 경남 (055): 3-3-4
            '^055': [
                { pattern: /^(055)(\d{3})(\d{4})$/, format: '$1-$2-$3' }
            ],
            // 제주 (064): 3-3-4
            '^064': [
                { pattern: /^(064)(\d{3})(\d{4})$/, format: '$1-$2-$3' }
            ],
            // 휴대폰 (010, 011, 016, 017, 018, 019): 3-4-4
            '^(010|011|016|017|018|019)': [
                { pattern: /^(010|011|016|017|018|019)(\d{4})(\d{4})$/, format: '$1-$2-$3' }
            ],
            // 인터넷 전화 (070): 3-4-4
            '^070': [
                { pattern: /^(070)(\d{4})(\d{4})$/, format: '$1-$2-$3' }
            ],
            // 기타 4자리 지역번호: 4-3-4
            '^(0\d{3})': [
                { pattern: /^(0\d{3})(\d{3})(\d{4})$/, format: '$1-$2-$3' }
            ]
        };
    }

    /**
     * 전화번호를 지역번호에 맞게 포맷팅
     * @param {string} phone - 포맷팅할 전화번호
     * @returns {string} 포맷팅된 전화번호
     */
    format(phone) {
        if (!phone) return '';
        
        // 숫자만 추출
        const cleaned = phone.replace(/\D/g, '');
        
        // 빈 문자열이거나 너무 짧으면 그대로 반환
        if (!cleaned || cleaned.length < 8) {
            return cleaned;
        }

        // 각 패턴에 대해 매칭 시도
        for (const [areaCodePattern, formatRules] of Object.entries(this.patterns)) {
            const areaRegex = new RegExp(areaCodePattern);
            
            if (areaRegex.test(cleaned)) {
                // 해당 지역번호의 포맷 규칙들을 시도
                for (const rule of formatRules) {
                    if (rule.pattern.test(cleaned)) {
                        return cleaned.replace(rule.pattern, rule.format);
                    }
                }
            }
        }

        // 매칭되지 않는 경우 기본 포맷 적용
        return this.applyDefaultFormat(cleaned);
    }

    /**
     * 기본 포맷 적용 (매칭되지 않는 번호용)
     * @param {string} cleaned - 숫자만 있는 전화번호
     * @returns {string} 기본 포맷팅된 전화번호
     */
    applyDefaultFormat(cleaned) {
        if (cleaned.length === 10) {
            // 10자리: 3-3-4
            return cleaned.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');
        } else if (cleaned.length === 11) {
            // 11자리: 3-4-4 (휴대폰) 또는 4-3-4 (일부 지역번호)
            if (cleaned.startsWith('010') || cleaned.startsWith('070')) {
                return cleaned.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3');
            } else {
                return cleaned.replace(/^(\d{4})(\d{3})(\d{4})$/, '$1-$2-$3');
            }
        } else if (cleaned.length === 9) {
            // 9자리: 2-3-4 (서울 일부)
            return cleaned.replace(/^(\d{2})(\d{3})(\d{4})$/, '$1-$2-$3');
        }
        
        return cleaned;
    }

    /**
     * 전화번호 유효성 검사
     * @param {string} phone - 검사할 전화번호
     * @returns {object} 검사 결과
     */
    validate(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const result = {
            isValid: false,
            type: '',
            message: '',
            formatted: ''
        };

        if (!cleaned) {
            result.message = '전화번호를 입력해주세요.';
            return result;
        }

        if (cleaned.length < 8) {
            result.message = '전화번호가 너무 짧습니다.';
            return result;
        }

        if (cleaned.length > 11) {
            result.message = '전화번호가 너무 깁니다.';
            return result;
        }

        // 휴대폰 번호 검사
        if (/^(010|011|016|017|018|019)\d{8}$/.test(cleaned)) {
            result.isValid = true;
            result.type = '휴대폰';
            result.formatted = this.format(cleaned);
            result.message = '올바른 휴대폰 번호입니다.';
            return result;
        }

        // 인터넷 전화 검사
        if (/^070\d{8}$/.test(cleaned)) {
            result.isValid = true;
            result.type = '인터넷전화';
            result.formatted = this.format(cleaned);
            result.message = '올바른 인터넷전화 번호입니다.';
            return result;
        }

        // 일반 전화 검사
        for (const [areaCodePattern, formatRules] of Object.entries(this.patterns)) {
            const areaRegex = new RegExp(areaCodePattern);
            
            if (areaRegex.test(cleaned)) {
                for (const rule of formatRules) {
                    if (rule.pattern.test(cleaned)) {
                        result.isValid = true;
                        result.type = '일반전화';
                        result.formatted = this.format(cleaned);
                        result.message = '올바른 전화번호입니다.';
                        return result;
                    }
                }
            }
        }

        result.message = '올바르지 않은 전화번호 형식입니다.';
        return result;
    }

    /**
     * 실시간 포맷팅을 위한 입력 핸들러
     * @param {HTMLElement} input - 입력 필드
     */
    attachToInput(input) {
        if (!input) return;

        const self = this;
        let lastValue = '';

        // 입력 이벤트 핸들러
        input.addEventListener('input', function(e) {
            const currentValue = e.target.value;
            const cursorPosition = e.target.selectionStart;
            const formatted = self.format(currentValue);
            
            // 포맷팅된 값이 다르면 업데이트
            if (formatted !== currentValue) {
                e.target.value = formatted;
                
                // 커서 위치 조정
                const diff = formatted.length - currentValue.length;
                e.target.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
            }
            
            lastValue = formatted;
        });

        // 포커스 아웃 시 유효성 검사
        input.addEventListener('blur', function(e) {
            const validation = self.validate(e.target.value);
            
            // 유효성 검사 결과에 따른 UI 업데이트
            const feedbackElement = input.parentNode.querySelector('.phone-feedback');
            if (feedbackElement) {
                feedbackElement.remove();
            }

            if (e.target.value.trim() !== '') {
                const feedback = document.createElement('div');
                feedback.className = `phone-feedback small mt-1 ${validation.isValid ? 'text-success' : 'text-danger'}`;
                feedback.innerHTML = `<i class="fas ${validation.isValid ? 'fa-check-circle' : 'fa-exclamation-circle'} me-1"></i>${validation.message}`;
                
                input.parentNode.appendChild(feedback);
                
                if (validation.isValid) {
                    input.classList.remove('is-invalid');
                    input.classList.add('is-valid');
                } else {
                    input.classList.remove('is-valid');
                    input.classList.add('is-invalid');
                }
            } else {
                input.classList.remove('is-valid', 'is-invalid');
            }
        });

        // 키보드 이벤트 (숫자와 하이픈만 허용)
        input.addEventListener('keypress', function(e) {
            const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', 'Backspace', 'Delete', 'Tab', 'Enter'];
            
            if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
            }
        });
    }
}

// 전역에서 사용할 수 있도록 인스턴스 생성
window.phoneFormatter = new PhoneFormatter();

// DOM이 로드되면 자동으로 전화번호 필드에 적용
document.addEventListener('DOMContentLoaded', function() {
    // 전화번호 입력 필드 자동 감지 및 적용
    const phoneInputs = document.querySelectorAll('input[type="tel"], input[name*="phone"], input[id*="phone"]');
    
    phoneInputs.forEach(input => {
        window.phoneFormatter.attachToInput(input);
    });
});