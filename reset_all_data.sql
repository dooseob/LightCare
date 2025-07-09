-- ================================================
-- 전체 데이터베이스 초기화 (완전 초기화용)
-- 주의: 모든 데이터가 삭제됩니다!
-- 실행 방법: mysql -u root -p mysql < reset_all_data.sql
-- ================================================

USE carelink;

-- 외래키 제약조건 비활성화
SET FOREIGN_KEY_CHECKS = 0;

-- 모든 테이블 데이터 삭제 (순서 중요)
DELETE FROM facility_images;
DELETE FROM review;
DELETE FROM board;
DELETE FROM job_posting;
DELETE FROM facility;
DELETE FROM member WHERE user_id != 'admin'; -- admin 계정은 유지

-- AUTO_INCREMENT 리셋
ALTER TABLE facility_images AUTO_INCREMENT = 1;
ALTER TABLE review AUTO_INCREMENT = 1;
ALTER TABLE board AUTO_INCREMENT = 1;
ALTER TABLE job_posting AUTO_INCREMENT = 1;
ALTER TABLE facility AUTO_INCREMENT = 1;
-- ALTER TABLE member AUTO_INCREMENT = 1; -- admin 계정 유지를 위해 주석

-- 외래키 제약조건 재활성화
SET FOREIGN_KEY_CHECKS = 1;

-- 확인용 쿼리
SELECT 'Database reset completed' AS status;
SELECT TABLE_NAME, TABLE_ROWS 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'carelink' 
  AND TABLE_TYPE = 'BASE TABLE';

COMMIT;