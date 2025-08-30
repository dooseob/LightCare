package com.example.carelink.dao;

import com.example.carelink.dto.BoardImageDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 게시판 이미지 매퍼
 */
@Mapper
public interface BoardImageMapper {
    
    // ===== 조회 =====
    
    /**
     * 게시글의 모든 이미지 조회
     */
    List<BoardImageDTO> getImagesByBoardId(@Param("boardId") Long boardId);
    
    /**
     * 특정 이미지 조회
     */
    BoardImageDTO getImageById(@Param("imageId") Long imageId);
    
    /**
     * 게시글의 활성 이미지 개수 조회
     */
    int countActiveImagesByBoardId(@Param("boardId") Long boardId);
    
    // ===== 등록 =====
    
    /**
     * 이미지 등록
     */
    int insertImage(BoardImageDTO imageDTO);
    
    /**
     * 다중 이미지 일괄 등록
     */
    int insertImages(@Param("images") List<BoardImageDTO> images);
    
    // ===== 수정 =====
    
    /**
     * 이미지 정보 수정
     */
    int updateImage(BoardImageDTO imageDTO);
    
    /**
     * 이미지 순서 변경
     */
    int updateImageOrder(@Param("imageId") Long imageId, 
                         @Param("imageOrder") Integer imageOrder);
    
    /**
     * 이미지 대체 텍스트 수정
     */
    int updateImageAltText(@Param("imageId") Long imageId, 
                          @Param("altText") String altText);
    
    // ===== 삭제 =====
    
    /**
     * 이미지 삭제 (물리적)
     */
    int deleteImage(@Param("imageId") Long imageId);
    
    /**
     * 이미지 비활성화 (논리적)
     */
    int deactivateImage(@Param("imageId") Long imageId);
    
    /**
     * 게시글의 모든 이미지 삭제
     */
    int deleteImagesByBoardId(@Param("boardId") Long boardId);
    
    // ===== 통계 =====
    
    /**
     * 게시판별 이미지 통계
     */
    int getTotalImageCountByBoardType(@Param("boardType") String boardType);
    
    /**
     * 전체 이미지 용량 합계
     */
    Long getTotalImageSize();
}