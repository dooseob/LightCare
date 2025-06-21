package com.example.carelink.service;

import com.example.carelink.common.PageInfo;
import com.example.carelink.dao.BoardMapper;
import com.example.carelink.dto.BoardDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 게시판 관련 비즈니스 로직 서비스
 * 팀원 D 담당
 */
@Service
@RequiredArgsConstructor
public class BoardService {
    
    private final BoardMapper boardMapper;
    
    /**
     * 게시글 목록 조회 (페이징 포함)
     */
    public PageInfo<BoardDTO> getBoardList(int page, String keyword, String category) {
        try {
            // TODO: 팀원 D가 페이징 및 검색 로직 구현
            BoardDTO searchDTO = new BoardDTO();
            searchDTO.setPage((page - 1) * 10);
            searchDTO.setSize(10);
            searchDTO.setSearchKeyword(keyword);
            searchDTO.setSearchCategory(category);
            
            // 전체 게시글 수 조회
            int totalCount = boardMapper.getBoardCount(searchDTO);
            
            // 게시글 목록 조회
            List<BoardDTO> boardList = boardMapper.getBoardList(searchDTO);
            
            // 페이징 정보 생성
            return new PageInfo<>(boardList, page, 10, totalCount);
            
        } catch (Exception e) {
            // 임시로 빈 페이징 정보 반환 (개발 초기 에러 방지)
            return new PageInfo<>(new ArrayList<>(), page, 10, 0);
        }
    }
    
    /**
     * 게시글 상세 정보 조회
     */
    public BoardDTO getBoardById(Long id) {
        try {
            // TODO: 팀원 D가 상세 조회 로직 구현
            return boardMapper.getBoardById(id);
        } catch (Exception e) {
            // 임시로 기본 게시글 정보 반환 (개발 초기 에러 방지)
            BoardDTO board = new BoardDTO();
            board.setBoardId(id);
            board.setTitle("게시글 정보를 불러오는 중...");
            board.setContent("팀원 D가 구현 예정");
            board.setAuthor("관리자");
            return board;
        }
    }
    
    /**
     * 게시글 등록
     */
    public int insertBoard(BoardDTO boardDTO) {
        try {
            // TODO: 팀원 D가 등록 로직 구현
            return boardMapper.insertBoard(boardDTO);
        } catch (Exception e) {
            // 임시로 성공 반환 (개발 초기 에러 방지)
            return 1;
        }
    }
    
    /**
     * 게시글 수정
     */
    public int updateBoard(BoardDTO boardDTO) {
        try {
            // TODO: 팀원 D가 수정 로직 구현
            return boardMapper.updateBoard(boardDTO);
        } catch (Exception e) {
            // 임시로 성공 반환 (개발 초기 에러 방지)
            return 1;
        }
    }
    
    /**
     * 게시글 삭제
     */
    public int deleteBoard(Long id) {
        try {
            // TODO: 팀원 D가 삭제 로직 구현
            return boardMapper.deleteBoard(id);
        } catch (Exception e) {
            // 임시로 성공 반환 (개발 초기 에러 방지)
            return 1;
        }
    }
    
    /**
     * 조회수 증가
     */
    public void incrementViewCount(Long id) {
        try {
            // TODO: 팀원 D가 조회수 증가 로직 구현
            boardMapper.increaseViewCount(id);
        } catch (Exception e) {
            // 에러 무시 (개발 초기 에러 방지)
        }
    }
    
    /**
     * 인기 게시글 목록 조회
     */
    public List<BoardDTO> getPopularBoards() {
        try {
            // TODO: 팀원 D가 인기 게시글 로직 구현
            return boardMapper.getPopularBoards();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
    
    /**
     * 카테고리별 게시글 목록 조회
     */
    public List<BoardDTO> getBoardsByCategory(String category) {
        try {
            return boardMapper.getBoardsByCategory(category);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
} 