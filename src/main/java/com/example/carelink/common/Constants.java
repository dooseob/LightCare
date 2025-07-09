package com.example.carelink.common;

/**
 * 프로젝트 전체에서 사용하는 공통 상수 정의
 * 팀원 간 일관성 유지를 위한 상수 클래스
 */
public class Constants {
    
    // 회원 관련 상수
    public static final String SESSION_MEMBER = "loginMember";
    public static final int MAX_LOGIN_ATTEMPTS = 5;
    public static final String MEMBER_ROLE_USER = "USER";
    public static final String MEMBER_ROLE_FACILITY = "FACILITY";
    public static final String MEMBER_ROLE_ADMIN = "ADMIN";
    
    // 페이징 관련 상수
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int DEFAULT_PAGE_BLOCK = 5;
    
    // 파일 업로드 관련 상수
    public static final String UPLOAD_BASE_PATH = "C:/carelink-uploads/";
    public static final String FACILITY_UPLOAD_PATH = UPLOAD_BASE_PATH + "facility/";
    public static final String PROFILE_UPLOAD_PATH = UPLOAD_BASE_PATH + "profile/";
    public static final String TEMP_UPLOAD_PATH = UPLOAD_BASE_PATH + "temp/";
    public static final String TEST_IMAGES_PATH = "/test-images/";
    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    // 이미지 관련 상수
    public static final int MAX_FACILITY_IMAGES = 5; // 시설 이미지 최대 5장
    public static final int MAX_PROFILE_IMAGES = 1;  // 프로필 이미지 최대 1장
    public static final String[] ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"};
    
    // 구인구직 관련 상수
    public static final String JOB_TYPE_RECRUIT = "RECRUIT"; // 구인
    public static final String JOB_TYPE_SEARCH = "SEARCH";   // 구직
    public static final String JOB_STATUS_ACTIVE = "ACTIVE";
    public static final String JOB_STATUS_CLOSED = "CLOSED";
    
    // 시설 관련 상수
    public static final String FACILITY_TYPE_NURSING_HOME = "NURSING_HOME";     // 요양원
    public static final String FACILITY_TYPE_HOSPITAL = "HOSPITAL";             // 병원
    public static final String FACILITY_TYPE_DAY_CARE = "DAY_CARE";            // 주간보호센터
    
    // 응답 메시지 상수
    public static final String SUCCESS = "success";
    public static final String ERROR = "error";
    public static final String DUPLICATE_ID = "duplicate_id";
    public static final String LOGIN_REQUIRED = "login_required";
} 