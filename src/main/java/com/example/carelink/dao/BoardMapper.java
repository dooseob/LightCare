<<<<<<< HEAD
package com.example.carelink.dao;

import com.example.carelink.dto.BoardDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 게시판 관련 데이터 액세스 매퍼
 * 팀원 D 담당
 */
@Mapper
public interface BoardMapper {
    
    /**
     * 게시글 목록 조회
     */
    List<BoardDTO> getBoardList(BoardDTO searchDTO);
    
    /**
     * 게시글 상세 정보 조회
     */
    BoardDTO getBoardById(@Param("boardId") Long boardId);
    
    /**
     * 게시글 상세 정보 조회 (삭제된 것 포함)
     */
    BoardDTO getBoardByIdIncludeDeleted(@Param("boardId") Long boardId);
    
    /**
     * 게시글 등록
     */
    int insertBoard(BoardDTO boardDTO);
    
    /**
     * 게시글 수정
     */
    int updateBoard(BoardDTO boardDTO);
    
    /**
     * 게시글 삭제
     */
    int deleteBoard(@Param("boardId") Long boardId);
    
    /**
     * 조회수 증가
     */
    void increaseViewCount(@Param("boardId") Long boardId);
    
    /**
     * 조회수 증가 (별칭)
     */
    void incrementViewCount(@Param("boardId") Long boardId);
    
    /**
     * 인기 게시글 목록 조회
     */
    List<BoardDTO> getPopularBoards();
    
    /**
     * 카테고리별 게시글 목록 조회
     */
    List<BoardDTO> getBoardsByCategory(@Param("category") String category);
    
    /**
     * 게시글 총 개수 조회
     */
    int getBoardCount(BoardDTO searchDTO);
    
    /**
     * 카테고리별 인기 게시글 목록 조회
     */
    List<BoardDTO> getPopularBoardsByCategory(@Param("category") String category);
    

    
    /**
     * 게시글 추천수 증가
     */
    void incrementLikeCount(@Param("boardId") Long boardId);
    
    /**
     * 게시글 추천수 감소
     */
    void decrementLikeCount(@Param("boardId") Long boardId);

    /**
     * 이전 게시글 조회
     */
    BoardDTO getPreviousBoard(@Param("boardId") Long boardId);

    /**
     * 다음 게시글 조회
     */
    BoardDTO getNextBoard(@Param("boardId") Long boardId);
    

=======
package com.example.carelink.dao;

import com.example.carelink.dto.BoardDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 게시판 관련 데이터 액세스 매퍼
 * 팀원 D 담당
 */
@Mapper
public interface BoardMapper {
    
    /**
     * 게시글 목록 조회
     */
    List<BoardDTO> getBoardList(BoardDTO searchDTO);
    
    /**
     * 게시글 상세 정보 조회
     */
    BoardDTO getBoardById(@Param("boardId") Long boardId);
    
    /**
     * 게시글 상세 정보 조회 (삭제된 것 포함)
     */
    BoardDTO getBoardByIdIncludeDeleted(@Param("boardId") Long boardId);
    
    /**
     * 게시글 등록
     */
    int insertBoard(BoardDTO boardDTO);
    
    /**
     * 게시글 수정
     */
    int updateBoard(BoardDTO boardDTO);
    
    /**
     * 게시글 삭제
     */
    int deleteBoard(@Param("boardId") Long boardId);
    
    /**
     * 조회수 증가
     */
    void increaseViewCount(@Param("boardId") Long boardId);
    
    /**
     * 조회수 증가 (별칭)
     */
    void incrementViewCount(@Param("boardId") Long boardId);
    
    /**
     * 인기 게시글 목록 조회
     */
    List<BoardDTO> getPopularBoards();
    
    /**
     * 카테고리별 게시글 목록 조회
     */
    List<BoardDTO> getBoardsByCategory(@Param("category") String category);
    
    /**
     * 게시글 총 개수 조회
     */
    int getBoardCount(BoardDTO searchDTO);
    
    /**
     * 카테고리별 인기 게시글 목록 조회
     */
    List<BoardDTO> getPopularBoardsByCategory(@Param("category") String category);
    

    
    /**
     * 게시글 추천수 증가
     */
    void incrementLikeCount(@Param("boardId") Long boardId);
    
    /**
     * 게시글 추천수 감소
     */
    void decrementLikeCount(@Param("boardId") Long boardId);

    /**
     * 이전 게시글 조회
     */
    BoardDTO getPreviousBoard(@Param("boardId") Long boardId);

    /**
     * 다음 게시글 조회
     */
    BoardDTO getNextBoard(@Param("boardId") Long boardId);
    
    /**
     * 모든 게시글 상태 조회 (개발용 - 삭제된 것 포함)
     */
    List<BoardDTO> getAllBoardsWithStatus();
    
    /**
     * 기존 데이터의 is_active 필드 업데이트 (임시 - 개발용)
     */
    int updateExistingDataActiveStatus();
>>>>>>> main
} 