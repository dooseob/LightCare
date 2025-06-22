package com.example.carelink.common;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 모든 DTO 클래스가 상속받을 기본 클래스
 * 공통 필드(생성일시, 수정일시, 삭제여부)를 포함
 */
@Data
public class BaseDTO {
    
    private LocalDateTime createdAt;  // 생성일시
    private LocalDateTime updatedAt;  // 수정일시
    private boolean isDeleted;        // 삭제 여부 (논리 삭제용)
    
    // 페이징 관련 필드
    private int page = 1;             // 현재 페이지
    private int pageSize = Constants.DEFAULT_PAGE_SIZE; // 페이지 크기
    private int offset;               // 조회 시작 위치
    private int size;                 // 조회할 레코드 수 (pageSize와 동일한 의미)
    
    /**
     * 페이징 처리를 위한 offset 계산
     */
    public int getOffset() {
        return (page - 1) * pageSize;
    }
    
    /**
     * 페이징을 위한 size 설정 (MyBatis용)
     */
    public void setSize(int size) {
        this.size = size;
        this.pageSize = size;
    }
    
    /**
     * 페이징을 위한 page 설정 (offset 자동 계산)
     */
    public void setPage(int page) {
        this.page = page;
        this.offset = getOffset();  // offset 자동 계산
    }
} 