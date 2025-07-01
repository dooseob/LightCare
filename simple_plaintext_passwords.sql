-- 개발용 평문 비밀번호로 업데이트
USE carelink;

-- 현재 상태 확인
SELECT user_id, password, is_active, login_fail_count FROM member;

-- 평문 비밀번호로 업데이트 (개발용)
UPDATE member SET password = 'admin123' WHERE user_id = 'admin';
UPDATE member SET password = 'user123' WHERE user_id IN ('user01', 'user02', 'user03', 'user04');
UPDATE member SET password = 'facility123' WHERE user_id IN ('facility01', 'facility02');

-- 계정 상태 정상화
UPDATE member SET login_fail_count = 0, is_active = TRUE, is_deleted = FALSE;

-- 결과 확인
SELECT user_id, password, is_active, login_fail_count FROM member;

SELECT '평문 비밀번호 업데이트 완료! 이제 로그인 테스트하세요!' as status;