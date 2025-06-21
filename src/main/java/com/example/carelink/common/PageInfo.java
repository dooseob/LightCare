package com.example.carelink.common;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 페이징 처리를 위한 정보 클래스
 * 모든 목록 조회에서 사용하는 페이징 정보
 */
@Getter
@Setter
public class PageInfo<T> {
    
    private List<T> list;           // 데이터 목록
    private int currentPage;        // 현재 페이지
    private int pageSize;           // 페이지당 데이터 수
    private int totalCount;         // 전체 데이터 수
    private int totalPages;         // 전체 페이지 수
    private int startPage;          // 시작 페이지 번호
    private int endPage;            // 끝 페이지 번호
    private boolean hasPrevious;    // 이전 페이지 존재 여부
    private boolean hasNext;        // 다음 페이지 존재 여부
    
    /**
     * 페이징 정보 생성
     * @param list 데이터 목록
     * @param currentPage 현재 페이지
     * @param pageSize 페이지당 데이터 수
     * @param totalCount 전체 데이터 수
     */
    public PageInfo(List<T> list, int currentPage, int pageSize, int totalCount) {
        this.list = list;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalCount = totalCount;
        
        // 전체 페이지 수 계산
        this.totalPages = (int) Math.ceil((double) totalCount / pageSize);
        
        // 페이지 네비게이션 범위 계산 (시작, 끝 페이지)
        this.startPage = Math.max(1, currentPage - 4);
        this.endPage = Math.min(totalPages, currentPage + 4);
        
        // 이전/다음 페이지 존재 여부
        this.hasPrevious = currentPage > 1;
        this.hasNext = currentPage < totalPages;
    }
    
    /**
     * 페이지 오프셋 계산
     */
    public int getOffset() {
        return (currentPage - 1) * pageSize;
    }
    
    /**
     * 현재 페이지가 첫 페이지인지 확인
     */
    public boolean isFirstPage() {
        return currentPage == 1;
    }
    
    /**
     * 현재 페이지가 마지막 페이지인지 확인
     */
    public boolean isLastPage() {
        return currentPage == totalPages;
    }
} 