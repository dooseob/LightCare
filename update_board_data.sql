-- 기존 게시글 데이터의 is_active 필드 업데이트
-- NULL인 is_active를 true로 설정

UPDATE board 
SET is_active = true 
WHERE is_active IS NULL;

-- 확인을 위한 조회 쿼리
SELECT 
    COUNT(*) as total_count,
    SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_count,
    SUM(CASE WHEN is_active IS NULL THEN 1 ELSE 0 END) as null_count,
    SUM(CASE WHEN is_deleted = true THEN 1 ELSE 0 END) as deleted_count
FROM board;

-- 최근 게시글 5개 확인
SELECT 
    board_id, 
    title, 
    is_active, 
    is_deleted, 
    created_at 
FROM board 
ORDER BY created_at DESC 
LIMIT 5; 