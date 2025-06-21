-- ================================================
-- 요양원 구인구직 사이트 데이터베이스 스키마
-- 4인 팀 프로젝트 전용
-- ================================================

-- 데이터베이스 생성 (필요 시)
-- CREATE DATABASE carelink DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE carelink;

-- ================================================
-- 1. 회원 테이블 (팀원 A 담당)
-- ================================================
CREATE TABLE member (
    member_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '회원 ID',
    user_id VARCHAR(20) NOT NULL UNIQUE COMMENT '사용자 ID (로그인용)',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호',
    name VARCHAR(50) NOT NULL COMMENT '이름',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '이메일',
    phone VARCHAR(20) COMMENT '휴대폰 번호',
    role VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT '역할 (USER, FACILITY, ADMIN)',
    address TEXT COMMENT '주소',
    profile_image VARCHAR(255) COMMENT '프로필 이미지 경로',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '계정 활성화 여부',
    login_fail_count INT NOT NULL DEFAULT 0 COMMENT '로그인 실패 횟수',
    last_login_at DATETIME COMMENT '마지막 로그인 시간',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부'
) COMMENT='회원 정보';

-- ================================================
-- 2. 시설 테이블 (팀원 B 담당)
-- ================================================
CREATE TABLE facility (
    facility_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '시설 ID',
    facility_name VARCHAR(100) NOT NULL COMMENT '시설명',
    facility_type VARCHAR(20) NOT NULL COMMENT '시설 유형 (NURSING_HOME, HOSPITAL, DAY_CARE)',
    address TEXT NOT NULL COMMENT '주소',
    detail_address TEXT COMMENT '상세 주소',
    phone VARCHAR(20) NOT NULL COMMENT '전화번호',
    latitude DECIMAL(10, 8) COMMENT '위도',
    longitude DECIMAL(11, 8) COMMENT '경도',
    description TEXT COMMENT '시설 설명',
    facility_image VARCHAR(255) COMMENT '시설 이미지 경로',
    homepage VARCHAR(255) COMMENT '홈페이지 URL',
    capacity INT COMMENT '수용 인원',
    current_occupancy INT COMMENT '현재 입소자 수',
    operating_hours VARCHAR(100) COMMENT '운영 시간',
    features TEXT COMMENT '시설 특징',
    average_rating FLOAT DEFAULT 0 COMMENT '평균 평점',
    review_count INT DEFAULT 0 COMMENT '리뷰 수',
    registered_member_id BIGINT NOT NULL COMMENT '등록한 회원 ID',
    is_approved BOOLEAN NOT NULL DEFAULT FALSE COMMENT '승인 여부',
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '승인 상태 (PENDING, APPROVED, REJECTED)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    FOREIGN KEY (registered_member_id) REFERENCES member(member_id)
) COMMENT='시설 정보';

-- ================================================
-- 3. 구인구직 게시글 테이블 (팀원 C 담당)
-- ================================================
CREATE TABLE job_posting (
    job_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '구인구직 ID',
    title VARCHAR(200) NOT NULL COMMENT '제목',
    content TEXT NOT NULL COMMENT '내용',
    job_type VARCHAR(20) NOT NULL COMMENT '구인구직 유형 (RECRUIT: 구인, SEARCH: 구직)',
    work_type VARCHAR(20) NOT NULL COMMENT '근무 형태 (FULL_TIME, PART_TIME, TEMPORARY)',
    position VARCHAR(50) COMMENT '모집 직종',
    recruit_count INT COMMENT '모집 인원',
    salary_type VARCHAR(20) COMMENT '급여 유형 (HOURLY, MONTHLY, ANNUAL)',
    salary_min DECIMAL(10, 0) COMMENT '최소 급여',
    salary_max DECIMAL(10, 0) COMMENT '최대 급여',
    salary_description TEXT COMMENT '급여 설명',
    work_location VARCHAR(100) COMMENT '근무 지역',
    work_hours VARCHAR(100) COMMENT '근무 시간',
    experience VARCHAR(50) COMMENT '경력 조건',
    education VARCHAR(50) COMMENT '학력 조건',
    qualifications TEXT COMMENT '자격 요건',
    benefits TEXT COMMENT '복리후생',
    start_date DATE COMMENT '모집 시작일',
    end_date DATE COMMENT '모집 마감일',
    contact_name VARCHAR(50) COMMENT '담당자 이름',
    contact_phone VARCHAR(20) COMMENT '담당자 연락처',
    contact_email VARCHAR(100) COMMENT '담당자 이메일',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '게시글 상태 (ACTIVE, CLOSED, DRAFT)',
    view_count INT NOT NULL DEFAULT 0 COMMENT '조회수',
    apply_count INT NOT NULL DEFAULT 0 COMMENT '지원자 수',
    member_id BIGINT NOT NULL COMMENT '작성자 ID',
    facility_id BIGINT COMMENT '관련 시설 ID',
    attachment_path VARCHAR(255) COMMENT '첨부파일 경로',
    attachment_name VARCHAR(255) COMMENT '첨부파일 원본명',
    priority INT NOT NULL DEFAULT 0 COMMENT '우선순위',
    is_highlight BOOLEAN NOT NULL DEFAULT FALSE COMMENT '강조 표시 여부',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    FOREIGN KEY (member_id) REFERENCES member(member_id),
    FOREIGN KEY (facility_id) REFERENCES facility(facility_id)
) COMMENT='구인구직 게시글';

-- ================================================
-- 4. 시설 리뷰 테이블 (팀원 D 담당)
-- ================================================
CREATE TABLE review (
    review_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '리뷰 ID',
    facility_id BIGINT NOT NULL COMMENT '시설 ID',
    member_id BIGINT NOT NULL COMMENT '작성자 ID',
    title VARCHAR(200) NOT NULL COMMENT '리뷰 제목',
    content TEXT NOT NULL COMMENT '리뷰 내용',
    rating INT NOT NULL COMMENT '평점 (1-5점)',
    service_rating INT COMMENT '서비스 평점',
    facility_rating INT COMMENT '시설 평점',
    staff_rating INT COMMENT '직원 평점',
    price_rating INT COMMENT '가격 평점',
    review_image1 VARCHAR(255) COMMENT '리뷰 이미지 1',
    review_image2 VARCHAR(255) COMMENT '리뷰 이미지 2',
    review_image3 VARCHAR(255) COMMENT '리뷰 이미지 3',
    like_count INT NOT NULL DEFAULT 0 COMMENT '추천 수',
    dislike_count INT NOT NULL DEFAULT 0 COMMENT '비추천 수',
    view_count INT NOT NULL DEFAULT 0 COMMENT '조회수',
    is_visible BOOLEAN NOT NULL DEFAULT TRUE COMMENT '표시 여부',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '상태 (ACTIVE, HIDDEN, REPORTED)',
    parent_review_id BIGINT COMMENT '부모 리뷰 ID (답글인 경우)',
    reply_count INT NOT NULL DEFAULT 0 COMMENT '답글 수',
    reply_depth INT NOT NULL DEFAULT 0 COMMENT '답글 깊이',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    FOREIGN KEY (facility_id) REFERENCES facility(facility_id),
    FOREIGN KEY (member_id) REFERENCES member(member_id),
    FOREIGN KEY (parent_review_id) REFERENCES review(review_id)
) COMMENT='시설 리뷰';

-- ================================================
-- 5. 정보 게시판 테이블 (팀원 D 담당)
-- ================================================
CREATE TABLE board (
    board_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '게시글 ID',
    board_type VARCHAR(20) NOT NULL COMMENT '게시판 유형 (NOTICE, INFO, QNA, FAQ)',
    title VARCHAR(200) NOT NULL COMMENT '제목',
    content TEXT NOT NULL COMMENT '내용',
    member_id BIGINT NOT NULL COMMENT '작성자 ID',
    view_count INT NOT NULL DEFAULT 0 COMMENT '조회수',
    like_count INT NOT NULL DEFAULT 0 COMMENT '추천수',
    comment_count INT NOT NULL DEFAULT 0 COMMENT '댓글수',
    attachment_path VARCHAR(255) COMMENT '첨부파일 경로',
    attachment_name VARCHAR(255) COMMENT '첨부파일 원본명',
    attachment_size BIGINT COMMENT '첨부파일 크기',
    is_notice BOOLEAN NOT NULL DEFAULT FALSE COMMENT '공지사항 여부',
    is_secret BOOLEAN NOT NULL DEFAULT FALSE COMMENT '비밀글 여부',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성 상태',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '상태 (ACTIVE, HIDDEN, DELETED)',
    category VARCHAR(50) COMMENT '카테고리',
    sub_category VARCHAR(50) COMMENT '서브 카테고리',
    priority INT NOT NULL DEFAULT 0 COMMENT '우선순위',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE COMMENT '상단 고정 여부',
    parent_board_id BIGINT COMMENT '부모 게시글 ID (답글인 경우)',
    reply_depth INT NOT NULL DEFAULT 0 COMMENT '답글 깊이',
    reply_order INT NOT NULL DEFAULT 0 COMMENT '답글 순서',
    tags VARCHAR(500) COMMENT '태그 (콤마로 구분)',
    meta_description TEXT COMMENT '메타 설명',
    meta_keywords VARCHAR(500) COMMENT '메타 키워드',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    FOREIGN KEY (member_id) REFERENCES member(member_id),
    FOREIGN KEY (parent_board_id) REFERENCES board(board_id)
) COMMENT='정보 게시판';

-- ================================================
-- 인덱스 생성
-- ================================================

-- 회원 테이블 인덱스
CREATE INDEX idx_member_user_id ON member(user_id);
CREATE INDEX idx_member_email ON member(email);
CREATE INDEX idx_member_role ON member(role);
CREATE INDEX idx_member_created_at ON member(created_at);

-- 시설 테이블 인덱스
CREATE INDEX idx_facility_type ON facility(facility_type);
CREATE INDEX idx_facility_location ON facility(latitude, longitude);
CREATE INDEX idx_facility_member_id ON facility(registered_member_id);
CREATE INDEX idx_facility_created_at ON facility(created_at);

-- 구인구직 테이블 인덱스
CREATE INDEX idx_job_type ON job_posting(job_type);
CREATE INDEX idx_job_work_type ON job_posting(work_type);
CREATE INDEX idx_job_member_id ON job_posting(member_id);
CREATE INDEX idx_job_facility_id ON job_posting(facility_id);
CREATE INDEX idx_job_created_at ON job_posting(created_at);

-- 리뷰 테이블 인덱스
CREATE INDEX idx_review_facility_id ON review(facility_id);
CREATE INDEX idx_review_member_id ON review(member_id);
CREATE INDEX idx_review_created_at ON review(created_at);

-- 게시판 테이블 인덱스
CREATE INDEX idx_board_type ON board(board_type);
CREATE INDEX idx_board_member_id ON board(member_id);
CREATE INDEX idx_board_created_at ON board(created_at);
CREATE INDEX idx_board_category ON board(category);

-- ================================================
-- 기본 데이터 삽입 (테스트용)
-- ================================================

-- 관리자 계정 생성
INSERT INTO member (user_id, password, name, email, role, is_active) VALUES
('admin', 'admin123', '관리자', 'admin@carelink.com', 'ADMIN', TRUE);

-- 샘플 시설 유형별 데이터
INSERT INTO member (user_id, password, name, email, phone, role, address, is_active) VALUES
('facility01', 'facility123', '수원요양원', 'suwon@example.com', '031-123-4567', 'FACILITY', '경기도 수원시', TRUE),
('user01', 'user123', '김철수', 'user01@example.com', '010-1234-5678', 'USER', '서울시 강남구', TRUE),
('user02', 'user123', '이영희', 'user02@example.com', '010-2345-6789', 'USER', '서울시 서초구', TRUE);

-- 샘플 시설 데이터
INSERT INTO facility (facility_name, facility_type, address, phone, latitude, longitude, description, registered_member_id, is_approved, approval_status) VALUES
('수원요양원', 'NURSING_HOME', '경기도 수원시 영통구', '031-123-4567', 37.2636, 127.0286, '쾌적하고 안전한 요양 환경을 제공합니다.', 2, TRUE, 'APPROVED');

-- 샘플 구인구직 데이터
INSERT INTO job_posting (title, content, job_type, work_type, position, member_id, facility_id, status) VALUES
('요양보호사 모집', '경력 요양보호사를 모집합니다.', 'RECRUIT', 'FULL_TIME', '요양보호사', 2, 1, 'ACTIVE'),
('간병인 구직', '성실한 간병인입니다.', 'SEARCH', 'PART_TIME', '간병인', 3, NULL, 'ACTIVE'); 