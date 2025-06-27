package com.example.carelink.common;

import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
/**
 * 모든 DTO 클래스가 상속받을 기본 클래스
 * 공통 필드(생성일시, 수정일시, 삭제여부)를 포함
 */

@Data
public class BaseDTO {

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;  // 생성일시

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;  // 수정일시
    private boolean isDeleted;        // 삭제 여부

    // 페이징 관련 필드 타입을 Integer로 변경
    private Integer page;               // 현재 페이지 (기본값은 필요에 따라 생성자에서 설정)
    private Integer pageSize;           // 페이지 크기
    private Integer offset;             // 조회 시작 위치
    private Integer size;               // 조회할 레코드 수 (pageSize와 동일한 의미)

    // 필요하다면 초기값 설정을 위한 생성자를 추가할 수 있습니다.
    public BaseDTO() {
        this.page = 1;
        this.pageSize = Constants.DEFAULT_PAGE_SIZE;
        this.offset = (this.page - 1) * this.pageSize; // 초기 offset 계산
        this.size = this.pageSize;
    }

    /*
    *//**
     * 페이징 처리를 위한 offset 계산
     *//*
    public int getOffset() {
        return (page - 1) * pageSize;
    }
    
    *//**
     * 페이징을 위한 size 설정 (MyBatis용)
     *//*
    public void setSize(int size) {
        this.size = size;
        this.pageSize = size;
    }
    
    *//**
     * 페이징을 위한 page 설정 (offset 자동 계산)
     *//*
    public void setPage(int page) {
        this.page = page;
        this.offset = getOffset();  // offset 자동 계산
    }
    */

} 