-- 🚀 LightCare 프로젝트 성능 최적화 인덱스
-- 기존 데이터에 영향 없이 검색 성능만 향상시킴

-- 리뷰 검색 성능 향상
CREATE INDEX IF NOT EXISTS idx_reviews_title ON reviews(title);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_facility_id ON reviews(facility_id);

-- 게시판 검색 성능 향상
CREATE INDEX IF NOT EXISTS idx_boards_category ON boards(category);
CREATE INDEX IF NOT EXISTS idx_boards_created_at ON boards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_boards_title ON boards(title);
CREATE INDEX IF NOT EXISTS idx_boards_status ON boards(is_active, is_deleted);

-- 구인구직 검색 성능 향상
CREATE INDEX IF NOT EXISTS idx_jobs_type ON job_postings(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON job_postings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_salary ON job_postings(salary);

-- 시설 검색 성능 향상
CREATE INDEX IF NOT EXISTS idx_facilities_name ON facilities(facility_name);
CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_facilities_type ON facilities(facility_type);

-- 회원 관련 성능 향상
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);

-- 복합 인덱스 (자주 함께 사용되는 조건들)
CREATE INDEX IF NOT EXISTS idx_reviews_facility_rating ON reviews(facility_id, rating);
CREATE INDEX IF NOT EXISTS idx_boards_category_active ON boards(category, is_active, is_deleted);
CREATE INDEX IF NOT EXISTS idx_jobs_type_status ON job_postings(job_type, status);

-- 인덱스 생성 완료 확인용 쿼리 (실행 후 확인)
-- SHOW INDEX FROM reviews;
-- SHOW INDEX FROM boards;
-- SHOW INDEX FROM job_postings;
-- SHOW INDEX FROM facilities;