package com.example.carelink.service;

import com.example.carelink.common.PageInfo;
import com.example.carelink.dao.BoardMapper;
import com.example.carelink.dto.BoardDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 게시판 관련 비즈니스 로직 서비스
 * 팀원 D 담당
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BoardService {
    
    private final BoardMapper boardMapper;
    
    private static final int DEFAULT_PAGE_SIZE = 10;
    
    /**
     * 게시글 목록 조회 (페이징 포함)
     */
    public PageInfo<BoardDTO> getBoardList(int page, String keyword, String category) {
        log.info("게시글 목록 조회 시작 - page: {}, keyword: {}, category: {}", page, keyword, category);
        
        try {
            // 검색 조건 설정
            BoardDTO searchDTO = new BoardDTO();
            searchDTO.setPage((page - 1) * DEFAULT_PAGE_SIZE); // 페이지 번호를 offset으로 변환
            searchDTO.setSize(DEFAULT_PAGE_SIZE);
            
            if (keyword != null && !keyword.trim().isEmpty()) {
                searchDTO.setSearchKeyword(keyword.trim());
            }
            
            if (category != null && !category.trim().isEmpty()) {
                searchDTO.setSearchCategory(category.trim());
            }
            
            // 전체 게시글 수 조회
            int totalCount = boardMapper.getBoardCount(searchDTO);
            
            // 게시글 목록 조회
            List<BoardDTO> boardList = boardMapper.getBoardList(searchDTO);
            
            log.info("게시글 목록 조회 완료 - 조회된 건수: {}, 전체: {}", boardList.size(), totalCount);
            
            // 페이징 정보 생성
            return new PageInfo<>(boardList, page, DEFAULT_PAGE_SIZE, totalCount);
            
        } catch (Exception e) {
            log.error("게시글 목록 조회 중 오류 발생", e);
            throw new RuntimeException("게시글 목록을 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 게시글 상세 정보 조회
     */
    @Transactional
    public BoardDTO getBoardById(Long id) {
        log.info("게시글 상세 조회 시작 - boardId: {}", id);
        
        try {
            BoardDTO board = boardMapper.getBoardById(id);
            if (board == null) {
                throw new RuntimeException("해당 게시글을 찾을 수 없습니다. ID: " + id);
            }
            
            log.info("게시글 상세 조회 완료 - boardId: {}, title: {}", id, board.getTitle());
            return board;
        } catch (Exception e) {
            log.error("게시글 상세 조회 중 오류 발생 - boardId: {}", id, e);
            throw new RuntimeException("게시글 상세 정보를 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 게시글 등록
     */
    @Transactional
    public int insertBoard(BoardDTO boardDTO) {
        log.info("게시글 등록 시작 - title: {}, memberId: {}", boardDTO.getTitle(), boardDTO.getMemberId());
        
        try {
            // 필수 값 검증
            validateBoardData(boardDTO);
            
            // 기본값 설정
            if (boardDTO.getStatus() == null) {
                boardDTO.setStatus("ACTIVE");
            }
            if (boardDTO.getBoardType() == null) {
                boardDTO.setBoardType("GENERAL");
            }
            
            int result = boardMapper.insertBoard(boardDTO);
            log.info("게시글 등록 완료 - boardId: {}", boardDTO.getBoardId());
            
            return result;
        } catch (Exception e) {
            log.error("게시글 등록 중 오류 발생", e);
            throw new RuntimeException("게시글 등록 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 게시글 수정
     */
    @Transactional
    public int updateBoard(BoardDTO boardDTO) {
        log.info("게시글 수정 시작 - boardId: {}, title: {}", boardDTO.getBoardId(), boardDTO.getTitle());
        
        try {
            // 게시글 존재 확인
            BoardDTO existingBoard = boardMapper.getBoardById(boardDTO.getBoardId());
            if (existingBoard == null) {
                throw new RuntimeException("수정할 게시글을 찾을 수 없습니다. ID: " + boardDTO.getBoardId());
            }
            
            // 필수 값 검증
            validateBoardData(boardDTO);
            
            int result = boardMapper.updateBoard(boardDTO);
            log.info("게시글 수정 완료 - boardId: {}", boardDTO.getBoardId());
            
            return result;
        } catch (Exception e) {
            log.error("게시글 수정 중 오류 발생 - boardId: {}", boardDTO.getBoardId(), e);
            throw new RuntimeException("게시글 수정 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 게시글 삭제
     */
    @Transactional
    public int deleteBoard(Long id) {
        log.info("게시글 삭제 시작 - boardId: {}", id);
        
        try {
            // 게시글 존재 확인
            BoardDTO existingBoard = boardMapper.getBoardById(id);
            if (existingBoard == null) {
                throw new RuntimeException("삭제할 게시글을 찾을 수 없습니다. ID: " + id);
            }
            
            int result = boardMapper.deleteBoard(id);
            log.info("게시글 삭제 완료 - boardId: {}", id);
            
            return result;
        } catch (Exception e) {
            log.error("게시글 삭제 중 오류 발생 - boardId: {}", id, e);
            throw new RuntimeException("게시글 삭제 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 조회수 증가
     */
    @Transactional
    public void incrementViewCount(Long id) {
        log.info("조회수 증가 시작 - boardId: {}", id);
        
        try {
            boardMapper.increaseViewCount(id);
            log.info("조회수 증가 완료 - boardId: {}", id);
        } catch (Exception e) {
            log.warn("조회수 증가 중 오류 발생 - boardId: {} (무시하고 진행)", id, e);
            // 조회수 증가 실패는 치명적이지 않으므로 예외를 던지지 않음
        }
    }
    
    /**
     * 인기 게시글 목록 조회
     */
    public List<BoardDTO> getPopularBoards() {
        log.info("인기 게시글 목록 조회 시작");
        
        try {
            List<BoardDTO> popularBoards = boardMapper.getPopularBoards();
            log.info("인기 게시글 목록 조회 완료 - 조회된 건수: {}", popularBoards.size());
            
            return popularBoards;
        } catch (Exception e) {
            log.error("인기 게시글 목록 조회 중 오류 발생", e);
            throw new RuntimeException("인기 게시글을 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 카테고리별 게시글 목록 조회
     */
    public List<BoardDTO> getBoardsByCategory(String category) {
        log.info("카테고리별 게시글 목록 조회 시작 - category: {}", category);
        
        try {
            List<BoardDTO> boards = boardMapper.getBoardsByCategory(category);
            log.info("카테고리별 게시글 목록 조회 완료 - category: {}, 조회된 건수: {}", category, boards.size());
            
            return boards;
        } catch (Exception e) {
            log.error("카테고리별 게시글 목록 조회 중 오류 발생 - category: {}", category, e);
            throw new RuntimeException("카테고리별 게시글을 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 공지사항 목록 조회
     */
    public List<BoardDTO> getNoticeBoards() {
        log.info("공지사항 목록 조회 시작");
        
        try {
            BoardDTO searchDTO = new BoardDTO();
            searchDTO.setNotice(true);
            searchDTO.setPage(0);
            searchDTO.setSize(5); // 최신 5개만
            
            List<BoardDTO> notices = boardMapper.getBoardList(searchDTO);
            log.info("공지사항 목록 조회 완료 - 조회된 건수: {}", notices.size());
            
            return notices;
        } catch (Exception e) {
            log.error("공지사항 목록 조회 중 오류 발생", e);
            throw new RuntimeException("공지사항을 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 게시글 데이터 유효성 검증
     */
    private void validateBoardData(BoardDTO boardDTO) {
        if (boardDTO.getMemberId() == null) {
            throw new IllegalArgumentException("작성자 ID는 필수입니다.");
        }
        if (boardDTO.getTitle() == null || boardDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("게시글 제목은 필수입니다.");
        }
        if (boardDTO.getContent() == null || boardDTO.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("게시글 내용은 필수입니다.");
        }
        if (boardDTO.getTitle().length() > 200) {
            throw new IllegalArgumentException("게시글 제목은 200자를 초과할 수 없습니다.");
        }
    }
} 