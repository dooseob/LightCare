-- PostgreSQL용 더미 데이터

-- 회원 데이터 (비밀번호: 'password123')
INSERT INTO member (username, password, name, email, phone, role) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '관리자', 'admin@lightcare.com', '010-1234-5678', 'ADMIN'),
('facility1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '행복요양원 관리자', 'happy@care.com', '010-1111-2222', 'FACILITY'),
('facility2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '대전요양원 관리자', 'daejeon@care.com', '010-3333-4444', 'FACILITY'),
('user1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '김철수', 'kim@user.com', '010-5555-6666', 'USER'),
('user2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '박민수', 'park@user.com', '010-7777-8888', 'USER'),
('user3', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '이영희', 'lee@user.com', '010-9999-0000', 'USER');

-- 시설 데이터
INSERT INTO facility (name, address, phone, description, capacity, current_residents, latitude, longitude, member_id) VALUES
('행복요양원', '서울시 강남구 테헤란로 123', '02-1234-5678', '가족같은 따뜻함을 제공하는 프리미엄 요양원입니다. 전문 의료진과 함께하는 안전한 돌봄 서비스를 제공합니다.', 50, 35, 37.5665, 126.9780, 2),
('대전요양원', '대전시 유성구 대학로 456', '042-2345-6789', '자연친화적 환경에서 어르신들의 건강한 생활을 지원하는 요양원입니다. 다양한 여가활동과 재활치료 프로그램을 운영합니다.', 80, 60, 36.3504, 127.3845, 3),
('팔달요양원', '수원시 팔달구 행궁로 789', '031-3456-7890', '수원 화성 인근의 쾌적한 환경에 위치한 요양원으로, 개인별 맞춤 케어를 제공합니다.', 60, 42, 37.2636, 127.0286, 2);

-- 시설 이미지 데이터
INSERT INTO facility_images (facility_id, image_url, image_name, is_main) VALUES
(1, '/static/images/facilities/행복요양원.png', '행복요양원 메인', true),
(1, '/static/images/facilities/행복요양원_개인공간.png', '행복요양원 개인공간', false),
(1, '/static/images/facilities/행복요양원_내부라운지.png', '행복요양원 내부라운지', false),
(1, '/static/images/facilities/행복요양원_영양관리.png', '행복요양원 영양관리', false),
(1, '/static/images/facilities/행복요양원_재활.png', '행복요양원 재활실', false),
(2, '/static/images/facilities/대전요양원.png', '대전요양원 메인', true),
(3, '/static/images/facilities/팔달요양원.png', '팔달요양원 메인', true);

-- 구인공고 데이터
INSERT INTO job_posting (title, content, salary, work_schedule, requirements, facility_id) VALUES
('간병사 모집 - 행복요양원', 
 E'행복요양원에서 성실하고 책임감 있는 간병사를 모집합니다.\n\n업무내용:\n- 어르신 일상생활 지원\n- 식사 및 투약 보조\n- 위생관리 및 안전관리\n\n근무조건:\n- 3교대 근무\n- 주 5일 근무\n- 4대보험 완비\n- 퇴직금 지급', 
 '월급 280만원~350만원', '3교대 (주간/저녁/야간)', '간병사 자격증 소지자 우대\n성실하고 책임감 있는 분', 1),
('요양보호사 정규직 채용', 
 E'대전요양원에서 요양보호사를 모집합니다.\n\n자격요건:\n- 요양보호사 자격증 필수\n- 경력 1년 이상 우대\n\n복리후생:\n- 4대보험 완비\n- 식사 제공\n- 정기 건강검진\n- 직무교육 지원', 
 '월급 300만원~380만원', '주간근무 (09:00~18:00)', '요양보호사 자격증 필수\n어르신을 정성으로 모시는 마음가짐', 2),
('물리치료사 모집', 
 E'팔달요양원 재활치료실에서 근무할 물리치료사를 모집합니다.\n\n업무내용:\n- 어르신 물리치료 및 재활운동\n- 치료계획 수립 및 실행\n- 가족 상담 및 교육\n\n우대조건:\n- 노인재활 경험자\n- 관련 자격증 소지자', 
 '연봉 4000만원~4800만원', '주간근무 (09:00~18:00)', '물리치료사 면허 필수\n노인재활 경험 1년 이상 우대', 3);

-- 리뷰 데이터
INSERT INTO review (facility_id, reviewer_id, rating, title, content, view_count, like_count, dislike_count) VALUES
(1, 4, 5, '어머니를 모시기에 최고의 선택이었습니다', 
 E'어머니께서 치매 초기 증상으로 요양원을 찾게 되었는데, 행복요양원은 정말 가족같이 돌봐주십니다. 간병사분들도 친절하시고 시설도 깨끗합니다. 특히 개인 공간이 넓어서 어머니께서 편안해하십니다.', 
 156, 23, 1),
(1, 5, 4, '시설은 좋지만 비용이 아쉬워요', 
 E'시설 자체는 정말 좋습니다. 깨끗하고 직원분들도 전문적이세요. 다만 다른 곳에 비해 비용이 조금 높은 편이라 경제적 부담이 있습니다. 그래도 아버지께서 만족해하시니 다행입니다.', 
 89, 15, 3),
(2, 6, 5, '자연 환경이 너무 좋아요', 
 E'대전요양원은 주변 환경이 너무 좋습니다. 산책로도 잘 되어있고 공기도 맑아서 어르신들께 좋은 것 같아요. 재활치료 프로그램도 다양하고 직원분들의 전문성도 높습니다.', 
 134, 28, 0),
(2, 4, 4, '프로그램이 다양해서 좋아요', 
 E'할머니께서 지루해하실까 걱정했는데, 여기는 프로그램이 정말 다양합니다. 원예치료, 음악치료, 미술치료 등등... 할머니께서 활력을 찾으신 것 같아 기쁩니다.', 
 67, 12, 1),
(3, 5, 3, '위치는 좋지만 시설이 조금 오래되었어요', 
 E'팔달요양원은 위치가 정말 좋습니다. 화성 근처라 경치도 좋고 교통도 편리해요. 다만 시설이 조금 오래된 느낌이 있어서 리모델링이 필요할 것 같습니다.', 
 45, 8, 5);

-- 게시판 데이터
INSERT INTO board (title, content, category, author_id, view_count) VALUES
('요양원 선택 시 확인해야 할 체크리스트', 
 E'부모님을 위한 요양원을 선택할 때 반드시 확인해야 할 항목들을 정리했습니다.\n\n1. 시설 인가 및 등급\n2. 직원 대 어르신 비율\n3. 의료진 상주 여부\n4. 개인실/다인실 선택 가능 여부\n5. 식단 관리 현황\n6. 안전시설 구비 상황\n7. 면회 및 외박 정책\n8. 비용 구조의 투명성\n\n직접 방문해서 확인하시는 것을 추천드립니다.', 
 'INFO', 1, 234),
('요양보호사 자격증 취득 후기', 
 E'50대에 요양보호사 자격증을 취득한 후기를 공유합니다.\n\n교육기간: 240시간 (이론 80시간, 실습 160시간)\n교육비용: 약 50만원\n준비기간: 3개월\n\n중년에 새로운 도전이었지만, 보람찬 일을 할 수 있게 되어 기쁩니다. 어르신들을 돌보는 일은 정말 의미있는 일인 것 같아요.', 
 'EXPERIENCE', 4, 167),
('치매 예방을 위한 일상 습관', 
 E'치매 예방에 도움이 되는 일상 습관들을 소개합니다.\n\n1. 규칙적인 운동 (하루 30분 이상)\n2. 독서와 퍼즐 게임\n3. 사회활동 참여\n4. 금연과 적당한 음주\n5. 규칙적인 수면 패턴\n6. 균형잡힌 식단\n7. 스트레스 관리\n\n작은 습관의 변화가 큰 차이를 만들 수 있습니다.', 
 'HEALTH', 6, 445),
('요양원 면회 시 주의사항', 
 E'코로나19 이후 달라진 요양원 면회 규정을 정리했습니다.\n\n- 사전 예약 필수\n- 건강상태 확인서 제출\n- 마스크 착용 의무\n- 면회 시간 제한 (1시간 내외)\n- 선물 반입 제한 품목 확인\n\n가족분들께서 참고하시기 바랍니다.', 
 'NOTICE', 1, 89);

-- 지원 데이터
INSERT INTO job_application (job_posting_id, applicant_id, status) VALUES
(1, 4, 'PENDING'),
(1, 5, 'APPROVED'),
(2, 6, 'PENDING'),
(3, 4, 'REJECTED');

-- 리뷰 이미지 데이터 (선택적)
INSERT INTO review_images (review_id, image_url, image_name) VALUES
(1, '/static/images/reviews/review1_1.jpg', '행복요양원 식당'),
(1, '/static/images/reviews/review1_2.jpg', '행복요양원 정원'),
(3, '/static/images/reviews/review3_1.jpg', '대전요양원 산책로');