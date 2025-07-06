-- ================================================
-- 요양원 구인구직 사이트 데이터베이스 스키마
-- 4인 팀 프로젝트 전용 (개선 반영 버전)
-- ================================================

-- 데이터베이스 생성 (필요 시)
CREATE DATABASE carelink DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE carelink;

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
    detail_address TEXT COMMENT '상세 주소',
    profile_image VARCHAR(255) COMMENT '프로필 이미지 경로',
    profile_image_alt_text VARCHAR(255) COMMENT '프로필 이미지 alt 텍스트 (SEO 최적화용)',
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
    facility_image VARCHAR(255) COMMENT '시설 메인 이미지 경로 (레거시 호환성용)',
    facility_image_alt_text VARCHAR(255) COMMENT '시설 이미지 alt 텍스트 (SEO 최적화용)',
    homepage VARCHAR(255) COMMENT '홈페이지 URL',
    capacity INT COMMENT '수용 인원',
    current_occupancy INT COMMENT '현재 입소자 수',
    operating_hours VARCHAR(100) COMMENT '운영 시간',
    features TEXT COMMENT '시설 특징',
    average_rating FLOAT DEFAULT 0 COMMENT '평균 평점',
    review_count INT DEFAULT 0 COMMENT '리뷰 수',
    grade_rating INT COMMENT '시설 등급 (1-5등급, 1등급이 최고)',
    image_count INT DEFAULT 0 COMMENT '시설 이미지 개수 (facility_images 테이블 기준)',
    main_image_path VARCHAR(500) COMMENT '메인 이미지 경로 (다중 이미지 시스템)',
    registered_member_id BIGINT NOT NULL COMMENT '등록한 회원 ID',
    is_approved BOOLEAN NOT NULL DEFAULT FALSE COMMENT '승인 여부',
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '승인 상태 (PENDING, APPROVED, REJECTED)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    FOREIGN KEY (registered_member_id) REFERENCES member(member_id)
) COMMENT='시설 정보';

-- ================================================
-- 3. 시설 이미지 테이블 (다중 이미지 지원 - 최대 5장)
-- ================================================
CREATE TABLE facility_images (
    image_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '이미지 ID',
    facility_id BIGINT NOT NULL COMMENT '시설 ID',
    image_path VARCHAR(500) NOT NULL COMMENT '이미지 경로',
    image_alt_text VARCHAR(200) COMMENT '이미지 alt 텍스트 (SEO 최적화용)',
    image_order INT DEFAULT 0 COMMENT '이미지 순서 (0부터 시작)',
    is_main_image BOOLEAN DEFAULT FALSE COMMENT '메인 이미지 여부',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '업로드일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (facility_id) REFERENCES facility(facility_id) ON DELETE CASCADE,
    INDEX idx_facility_images_facility_id (facility_id),
    INDEX idx_facility_images_main (facility_id, is_main_image),
    INDEX idx_facility_images_order (facility_id, image_order)
) COMMENT='시설 이미지 (최대 5장 지원)';

-- ================================================
-- 4. 구인구직 게시글 테이블 (팀원 C 담당)
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
-- 5. 시설 리뷰 테이블 (팀원 D 담당)
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
-- 6. 정보 게시판 테이블 (팀원 D 담당)
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

-- 시설 이미지 테이블 인덱스
CREATE INDEX idx_facility_images_facility_id ON facility_images(facility_id);
CREATE INDEX idx_facility_images_order ON facility_images(facility_id, image_order);

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
INSERT INTO member (
    user_id,
    password,
    name,
    email,
    phone,
    role,
    address,
    is_active,
    login_fail_count,
    created_at,
    updated_at,
    is_deleted
) VALUES
    ('admin', 'admin123', '관리자', 'admin@carelink.com', '02-1234-5678', 'ADMIN', '서울시 종로구 세종대로 1', TRUE, 0, NOW(), NOW(), FALSE),
    ('user01', 'user123', '김철수', 'kim.cs@example.com', '010-1111-2222', 'USER', '서울시 강남구 테헤란로 123', TRUE, 0, NOW(), NOW(), FALSE),
    ('user02', 'user123', '이영희', 'lee.yh@example.com', '010-2222-3333', 'USER', '부산시 해운대구 센텀중앙로 79', TRUE, 0, NOW(), NOW(), FALSE),
    ('user03', 'user123', '박민수', 'park.ms@example.com', '010-3333-4444', 'USER', '대구시 중구 동성로 1', TRUE, 0, NOW(), NOW(), FALSE),
    ('user04', 'user123', '최지은', 'choi.je@example.com', '010-4444-5555', 'USER', '인천시 남동구 구월동 1234', TRUE, 0, NOW(), NOW(), FALSE),
    ('facility01', 'facility123', '서울요양원장', 'seoul.admin@example.com', '02-5555-6666', 'FACILITY', '서울시 서초구 서초대로 123', TRUE, 0, NOW(), NOW(), FALSE),
    ('facility02', 'facility123', '부산실버타운장', 'busan.admin@example.com', '051-7777-8888', 'FACILITY', '부산시 부산진구 서면로 456', TRUE, 0, NOW(), NOW(), FALSE);

-- 시설 데이터
INSERT INTO facility (facility_name, facility_type, address, detail_address, phone, latitude, longitude, description, capacity, current_occupancy, operating_hours, features, average_rating, review_count, grade_rating, registered_member_id, is_approved, approval_status, created_at, updated_at, is_deleted) VALUES
    ('서울 행복요양원', 'NURSING_HOME', '서울시 강남구 테헤란로 123', '2층 201호', '02-1111-2222', 37.500913, 127.037149, '24시간 전문 간병 서비스를 제공하는 프리미엄 요양원입니다.', 50, 35, '24시간 운영', '24시간 간병서비스, 물리치료실, 인지치료 프로그램', 4.5, 8, 1, 6, TRUE, 'APPROVED', NOW(), NOW(), FALSE),
    ('부산 바다뷰 실버타운', 'NURSING_HOME', '부산시 해운대구 센텀중앙로 79', '1층', '051-3333-4444', 35.169188, 129.132800, '바다가 보이는 아름다운 환경의 실버타운입니다.', 80, 60, '08:00-22:00', '바다뷰, 실버카페, 도서관, 수영장', 4.2, 12, 2, 7, TRUE, 'APPROVED', NOW(), NOW(), FALSE),
    ('대전 건강 데이케어센터', 'DAY_CARE', '대전시 유성구 과학로 123', 'B1층', '042-5555-6666', 36.350411, 127.384548, '주간보호 전문 센터로 다양한 프로그램을 운영합니다.', 30, 20, '09:00-18:00', '송영버스, 급식서비스, 건강관리 프로그램', 4.0, 6, 3, 6, TRUE, 'APPROVED', NOW(), NOW(), FALSE),
    ('인천 평안 요양병원', 'HOSPITAL', '인천시 남동구 구월동 1234', '3-5층', '032-7777-8888', 37.456256, 126.731536, '의료진이 상주하는 전문 요양병원입니다.', 100, 75, '24시간 운영', '의료진 상주, 응급실, 재활치료실, 검사실', 4.3, 15, 1, 6, TRUE, 'APPROVED', NOW(), NOW(), FALSE),
    ('경기 사랑 재가센터', 'DAY_CARE', '경기도 수원시 팔달구 중부대로 123', '1층', '031-9999-0000', 37.283897, 127.009121, '재가 요양 서비스 전문 센터입니다.', 25, 18, '08:00-20:00', '재가방문, 목욕서비스, 간병서비스', 3.8, 4, 4, 6, TRUE, 'APPROVED', NOW(), NOW(), FALSE);

-- 구인구직 데이터
INSERT INTO job_posting (title, content, job_type, work_type, position, recruit_count, salary_type, salary_min, salary_max, salary_description, work_location, work_hours, experience, education, qualifications, benefits, start_date, end_date, contact_name, contact_phone, contact_email, status, member_id, facility_id, priority, is_highlight, created_at, updated_at, is_deleted) VALUES
    ('[서울 행복요양원] 요양보호사 정규직 모집', '경력 3년 이상 요양보호사를 모집합니다. 성실하고 책임감 있는 분을 찾습니다.', 'RECRUIT', 'FULL_TIME', '요양보호사', 3, 'MONTHLY', 2800000, 3200000, '경력에 따라 차등 지급', '서울시 강남구', '3교대 (08:00-16:00, 16:00-24:00, 24:00-08:00)', '3년 이상', '고등학교 졸업 이상', '요양보호사 자격증 필수', '4대보험, 퇴직금, 명절상여금, 교육비 지원', '2024-01-15', '2024-02-15', '김과장', '02-1111-2222', 'recruit@seoul-happy.com', 'ACTIVE', 6, 1, 5, FALSE, NOW(), NOW(), FALSE),
    ('[부산 바다뷰 실버타운] 간호사 모집', '실버타운에서 근무할 간호사를 모집합니다. 노인 간호 경험자 우대', 'RECRUIT', 'FULL_TIME', '간호사', 2, 'MONTHLY', 3500000, 4000000, '야간근무수당 별도', '부산시 해운대구', '2교대 (09:00-21:00, 21:00-09:00)', '1년 이상', '간호대학 졸업', '간호사 면허증 필수', '4대보험, 퇴직금, 야간수당, 주말수당', '2024-01-20', '2024-02-20', '이팀장', '051-3333-4444', 'hr@busan-silver.com', 'ACTIVE', 7, 2, 3, TRUE, NOW(), NOW(), FALSE),
    ('[경력직 요양보호사] 좋은 근무환경 찾습니다', '10년 경력의 요양보호사입니다. 야간근무 가능하며 성실히 근무하겠습니다.', 'SEARCH', 'FULL_TIME', '요양보호사', 1, 'MONTHLY', 2500000, 3000000, '야간수당 포함 희망', '서울/경기 지역', '3교대 가능', '10년', '고등학교 졸업', '요양보호사 1급 자격증', '4대보험, 퇴직금', '2024-01-10', '2024-03-10', '홍길동', '010-1234-5678', 'hong@example.com', 'ACTIVE', 2, NULL, 0, FALSE, NOW(), NOW(), FALSE),
    ('대전 데이케어센터 사회복지사 모집', '데이케어센터에서 근무할 사회복지사를 모집합니다.', 'RECRUIT', 'FULL_TIME', '사회복지사', 1, 'MONTHLY', 2600000, 2800000, '기본급 + 수당', '대전시 유성구', '09:00-18:00 (월-토)', '신입 가능', '사회복지학과 졸업', '사회복지사 2급 이상', '4대보험, 퇴직금, 교육비 지원', '2024-01-25', '2024-02-25', '박실장', '042-5555-6666', 'welfare@daejeon.com', 'ACTIVE', 6, 3, 2, FALSE, NOW(), NOW(), FALSE),
    ('물리치료사 파트타임 구직합니다', '물리치료 경력 5년으로 파트타임으로 근무하고 싶습니다.', 'SEARCH', 'PART_TIME', '물리치료사', 1, 'HOURLY', 25000, 30000, '시간당 희망', '수도권 지역', '주 3일 이내', '5년', '물리치료학과 졸업', '물리치료사 면허증', '4대보험', '2024-01-12', '2024-02-12', '김물리', '010-9999-8888', 'pt.kim@example.com', 'ACTIVE', 3, NULL, 0, FALSE, NOW(), NOW(), FALSE);

-- 리뷰 데이터
INSERT INTO review (facility_id, member_id, title, content, rating, service_rating, facility_rating, staff_rating, price_rating, like_count, dislike_count, view_count, is_visible, status, parent_review_id, reply_count, reply_depth, created_at, updated_at, is_deleted) VALUES
    (1, 2, '서울 행복요양원 이용 후기', '어머니를 모시고 있는데 시설도 깨끗하고 직원분들이 정말 친절합니다. 특히 간병서비스가 24시간 제공되어 안심이 됩니다. 추천합니다!', 5, 5, 4, 5, 4, 8, 0, 45, TRUE, 'ACTIVE', NULL, 0, 0, NOW(), NOW(), FALSE),
    (1, 3, '만족스러운 요양원', '아버지가 편안하게 지내고 계세요. 물리치료 프로그램도 잘 되어 있고 식사도 맛있다고 하십니다.', 4, 4, 4, 4, 4, 5, 0, 32, TRUE, 'ACTIVE', NULL, 0, 0, NOW(), NOW(), FALSE),
    (1, 4, '좋은 선택이었습니다', '처음엔 망설였는데 가족 모두 만족하고 있습니다. 인지치료 프로그램이 특히 좋네요.', 4, 4, 4, 5, 3, 3, 0, 28, TRUE, 'ACTIVE', NULL, 0, 0, NOW(), NOW(), FALSE),
    (2, 2, '부산 바다뷰 실버타운 추천', '바다가 보이는 뷰가 정말 좋아요. 할머니가 매일 바다를 보며 산책하신다고 하니 마음이 놓입니다.', 5, 4, 5, 4, 4, 12, 1, 67, TRUE, 'ACTIVE', NULL, 0, 0, NOW(), NOW(), FALSE),
    (2, 3, '시설이 현대적이에요', '최신 시설로 잘 갖춰져 있고 수영장도 있어서 좋습니다. 다만 비용이 좀 있는 편이에요.', 4, 4, 5, 4, 3, 6, 0, 39, TRUE, 'ACTIVE', NULL, 0, 0, NOW(), NOW(), FALSE),
    (2, 4, '실버카페가 인상적', '실버카페에서 다른 어르신들과 대화하며 시간을 보내신다고 하네요. 사회활동에 도움이 됩니다.', 4, 4, 4, 4, 4, 4, 0, 25, TRUE, 'ACTIVE', NULL, 0, 0, NOW(), NOW(), FALSE),
    (3, 2, '대전 데이케어센터 이용기', '주간보호로 이용하고 있는데 프로그램이 다양해서 좋습니다. 송영버스도 편리하고요.', 4, 4, 4, 4, 4, 7, 0, 41, TRUE, 'ACTIVE', NULL, 0, 0, NOW(), NOW(), FALSE),
    (3, 5, '건강관리 프로그램 만족', '건강관리 프로그램이 체계적으로 잘 되어 있어요. 혈압, 혈당 관리도 꼼꼼히 해주십니다.', 4, 5, 3, 4, 4, 5, 0, 33, TRUE, 'ACTIVE', NULL, 0, 0, NOW(), NOW(), FALSE),
    (4, 3, '인천 평안 요양병원 후기', '의료진이 상주해서 안심이 됩니다. 응급상황에도 빠르게 대응해주셔서 감사했습니다.', 5, 5, 4, 5, 4, 9, 0, 52, TRUE, 'ACTIVE', NULL, 0, 0, NOW(), NOW(), FALSE),
    (4, 4, '전문적인 의료서비스', '재활치료실 시설이 좋고 물리치료 선생님들이 전문적으로 치료해주십니다.', 4, 4, 4, 4, 4, 6, 0, 37, TRUE, 'ACTIVE', NULL, 0, 0, NOW(), NOW(), FALSE),
    (5, 2, '경기 사랑 재가센터 이용 후기', '재가 서비스로 이용하고 있는데 방문 시간도 정확하고 서비스 품질이 좋습니다.', 4, 4, 4, 4, 4, 4, 0, 29, TRUE, 'ACTIVE', NULL, 0, 0, NOW(), NOW(), FALSE),
    (1, 5, '감사합니다', '직원 분들의 세심한 배려에 감사드립니다. 어머니가 많이 좋아지셨어요.', 5, 5, 4, 5, 4, 2, 0, 18, TRUE, 'ACTIVE', NULL, 0, 0, NOW(), NOW(), FALSE);

-- 게시판 데이터
INSERT INTO board (board_type, title, content, member_id, view_count, like_count, comment_count, is_notice, is_secret, is_active, status, category, sub_category, priority, is_pinned, parent_board_id, reply_depth, reply_order, tags, meta_description, meta_keywords, created_at, updated_at, is_deleted) VALUES
    ('NOTICE', '라이트케어 서비스 오픈 안내', '안녕하세요. 라이트케어 요양원 구인구직 플랫폼이 정식 오픈되었습니다. 많은 이용 부탁드립니다.', 1, 125, 15, 3, TRUE, FALSE, TRUE, 'ACTIVE', 'NOTICE', '서비스', 10, TRUE, NULL, 0, 0, '오픈,안내,서비스', '라이트케어 서비스 오픈 안내', '라이트케어,오픈,서비스,요양원', NOW(), NOW(), FALSE),
    ('INFO', '요양원 선택 시 고려사항', '좋은 요양원을 선택하기 위해 고려해야 할 중요한 사항들을 정리해드립니다. 1. 시설 환경 2. 직원의 전문성 3. 의료 서비스 4. 프로그램 다양성 5. 비용 투명성', 1, 89, 12, 5, FALSE, FALSE, TRUE, 'ACTIVE', 'INFO', '가이드', 5, FALSE, NULL, 0, 0, '요양원,선택,가이드', '요양원 선택 가이드', '요양원,선택,가이드,시설', NOW(), NOW(), FALSE),
    ('QNA', '요양보험 적용 관련 문의', '국민건강보험공단에서 시행하는 요양보험이 어떤 시설에 적용되는지 궁금합니다.', 2, 67, 3, 2, FALSE, FALSE, TRUE, 'ACTIVE', 'QNA', '보험', 0, FALSE, NULL, 0, 0, '요양보험,문의', '요양보험 적용 관련 문의', '요양보험,건강보험,적용', NOW(), NOW(), FALSE),
    ('FAQ', '자주 묻는 질문 모음', 'Q1. 입소 절차는 어떻게 되나요? A1. 상담 → 견학 → 서류 제출 → 입소 계약 순으로 진행됩니다. Q2. 면회 시간은 언제인가요? A2. 평일 오후 2시~6시, 주말 오전 10시~오후 6시입니다.', 1, 156, 8, 1, FALSE, FALSE, TRUE, 'ACTIVE', 'FAQ', '일반', 3, FALSE, NULL, 0, 0, 'FAQ,자주묻는질문', '자주 묻는 질문 모음', 'FAQ,질문,답변,입소', NOW(), NOW(), FALSE),
    ('INFO', '노인장기요양보험 제도 안내', '노인장기요양보험 제도에 대해 자세히 설명드립니다. 신청 방법, 등급 판정, 급여 내용 등을 포함합니다.', 1, 98, 7, 4, FALSE, FALSE, TRUE, 'ACTIVE', 'INFO', '제도', 2, FALSE, NULL, 0, 0, '장기요양보험,제도,안내', '노인장기요양보험 제도 안내', '장기요양보험,노인,제도,신청', NOW(), NOW(), FALSE),
    ('QNA', '월 이용료는 얼마인가요?', '부모님 모실 요양원을 찾고 있는데 일반적인 월 이용료가 궁금합니다.', 3, 134, 2, 6, FALSE, FALSE, TRUE, 'ACTIVE', 'QNA', '비용', 0, FALSE, NULL, 0, 0, '이용료,비용,문의', '월 이용료 문의', '이용료,비용,요양원,월비용', NOW(), NOW(), FALSE),
    ('INFO', '어르신 건강관리 팁', '어르신들의 건강한 생활을 위한 일상 관리 팁을 공유합니다. 식사, 운동, 수면, 정신건강 관리 방법을 포함합니다.', 1, 76, 11, 3, FALSE, FALSE, TRUE, 'ACTIVE', 'INFO', '건강', 1, FALSE, NULL, 0, 0, '건강관리,어르신,팁', '어르신 건강관리 팁', '건강관리,어르신,노인,건강,팁', NOW(), NOW(), FALSE),
    ('QNA', '면회 시간과 규정이 궁금해요', '코로나19 이후 면회 시간이나 규정이 어떻게 바뀌었는지 알고 싶습니다.', 4, 45, 1, 1, FALSE, FALSE, TRUE, 'ACTIVE', 'QNA', '면회', 0, FALSE, NULL, 0, 0, '면회,시간,규정', '면회 시간 규정 문의', '면회,시간,규정,코로나', NOW(), NOW(), FALSE),
    ('INFO', '재활 프로그램 종류와 효과', '요양원에서 제공하는 다양한 재활 프로그램들과 그 효과에 대해 알아봅시다.', 1, 63, 9, 2, FALSE, FALSE, TRUE, 'ACTIVE', 'INFO', '재활', 1, FALSE, NULL, 0, 0, '재활,프로그램,효과', '재활 프로그램 안내', '재활,프로그램,물리치료,작업치료', NOW(), NOW(), FALSE),
    ('QNA', '식사 메뉴는 어떻게 제공되나요?', '요양원의 식사 메뉴 구성과 특별식 제공 여부가 궁금합니다.', 5, 58, 4, 3, FALSE, FALSE, TRUE, 'ACTIVE', 'QNA', '식사', 0, FALSE, NULL, 0, 0, '식사,메뉴,급식', '식사 메뉴 문의', '식사,메뉴,급식,요양원', NOW(), NOW(), FALSE);

-- ================================================
-- 완료 메시지
-- ================================================
SELECT '라이트케어 데이터베이스 초기화가 완료되었습니다!' as message;