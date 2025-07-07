-- ================================================
-- 시설 이미지 데이터만 초기화 (문제 해결용)
-- 실행 방법: mysql -u root -p mysql < reset_facility_images.sql
-- ================================================

USE carelink;

-- 1. 시설 이미지 테이블 데이터 삭제
DELETE FROM facility_images;

-- 2. AUTO_INCREMENT 리셋
ALTER TABLE facility_images AUTO_INCREMENT = 1;

-- 3. 시설 테이블의 이미지 관련 필드 초기화
UPDATE facility 
SET facility_image = NULL, 
    facility_image_alt_text = NULL, 
    image_count = 0;

-- 4. 확인용 쿼리
SELECT 'facility_images 테이블 초기화 완료' AS status;
SELECT COUNT(*) AS remaining_images FROM facility_images;
SELECT facility_id, facility_name, facility_image, image_count FROM facility;

COMMIT;