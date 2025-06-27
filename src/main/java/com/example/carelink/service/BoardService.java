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
     * 게시글 목록 조회 (페이징)
     */
    public PageInfo<BoardDTO> getBoardList(int page, String keyword, String category) {
        log.info("게시글 목록 조회 시작 - page: {}, keyword: {}, category: {}", page, keyword, category);
        
        try {
            // 검색 조건 설정
            BoardDTO searchDTO = new BoardDTO();
            searchDTO.setPage(page);
            searchDTO.setSize(DEFAULT_PAGE_SIZE);
            searchDTO.setOffset((page - 1) * DEFAULT_PAGE_SIZE);
            
            if (keyword != null && !keyword.trim().isEmpty()) {
                searchDTO.setSearchKeyword(keyword.trim());
            }
            if (category != null && !category.trim().isEmpty() && !"all".equals(category)) {
                searchDTO.setCategory(category.trim());
            }
            
            log.info("검색 조건 - searchDTO: page={}, size={}, offset={}, keyword={}, category={}", 
                searchDTO.getPage(), searchDTO.getSize(), searchDTO.getOffset(), 
                searchDTO.getSearchKeyword(), searchDTO.getCategory());
            
            // 전체 게시글 수 조회
            int totalCount = boardMapper.getBoardCount(searchDTO);
            log.info("전체 게시글 수: {}", totalCount);
            
            // 게시글 목록 조회
            List<BoardDTO> boardList = boardMapper.getBoardList(searchDTO);
            log.info("조회된 게시글 수: {}", boardList != null ? boardList.size() : 0);
            
            if (boardList != null && !boardList.isEmpty()) {
                log.info("첫 번째 게시글 정보 - ID: {}, 제목: {}, 작성자: {}, is_active: {}, is_deleted: {}", 
                    boardList.get(0).getBoardId(), 
                    boardList.get(0).getTitle(), 
                    boardList.get(0).getMemberName(),
                    boardList.get(0).getIsActive(),
                    boardList.get(0).getIsDeleted());
            } else {
                log.warn("조회된 게시글이 없습니다.");
            }
            
            // 페이징 정보 생성
            PageInfo<BoardDTO> pageInfo = new PageInfo<>(boardList, page, DEFAULT_PAGE_SIZE, totalCount);
            log.info("페이징 정보 - 현재페이지: {}, 전체페이지: {}, 전체건수: {}", 
                pageInfo.getCurrentPage(), pageInfo.getTotalPages(), pageInfo.getTotalCount());
            
            return pageInfo;
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
     * 게시글 상세 조회 (삭제된 것 포함)
     */
    public BoardDTO getBoardByIdIncludeDeleted(Long id) {
        log.info("게시글 상세 조회 (삭제 포함) 시작 - boardId: {}", id);
        
        try {
            BoardDTO board = boardMapper.getBoardByIdIncludeDeleted(id);
            if (board != null) {
                log.info("게시글 상세 조회 (삭제 포함) 완료 - boardId: {}, title: {}, is_deleted: {}", 
                    id, board.getTitle(), board.getIsDeleted());
            } else {
                log.warn("존재하지 않는 게시글 조회 시도 (삭제 포함) - boardId: {}", id);
            }
            return board;
        } catch (Exception e) {
            log.error("게시글 상세 조회 (삭제 포함) 중 오류 발생 - boardId: {}", id, e);
            throw new RuntimeException("게시글을 불러오는 중 오류가 발생했습니다.", e);
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
            
            // priority 기본값 설정 (null이면 기본값 0)
            if (boardDTO.getPriority() == null) {
                boardDTO.setPriority(0);
            }
            
            // 댓글 관련 필드 기본값 설정
            if (boardDTO.getReplyDepth() == null) {
                boardDTO.setReplyDepth(0);
            }
            if (boardDTO.getReplyOrder() == null) {
                boardDTO.setReplyOrder(0);
            }
            
            // Boolean 필드 기본값 설정
            if (boardDTO.getIsNotice() == null) {
                boardDTO.setIsNotice(false);
            }
            if (boardDTO.getIsSecret() == null) {
                boardDTO.setIsSecret(false);
            }
            if (boardDTO.getIsActive() == null) {
                boardDTO.setIsActive(true);  // 활성 상태로 기본 설정
            }
            if (boardDTO.getIsDeleted() == null) {
                boardDTO.setIsDeleted(false);
            }
            if (boardDTO.getIsPinned() == null) {
                boardDTO.setIsPinned(false);
            }
            
            // 카테고리에 따라 공지사항 여부 설정
            if (boardDTO.getCategory() != null && "NOTICE".equals(boardDTO.getCategory())) {
                boardDTO.setIsNotice(true);
            }
            
            if (boardDTO.getBoardType() == null) {
                // 카테고리에 따라 boardType 설정
                String category = boardDTO.getCategory();
                if ("NOTICE".equals(category)) {
                    boardDTO.setBoardType("NOTICE");
                } else if ("INFO".equals(category)) {
                    boardDTO.setBoardType("INFO");
                } else if ("QNA".equals(category)) {
                    boardDTO.setBoardType("QNA");
                } else if ("FAQ".equals(category)) {
                    boardDTO.setBoardType("FAQ");
                } else {
                    boardDTO.setBoardType("GENERAL");
                }
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
    @Transactional(rollbackFor = Exception.class)
    public int deleteBoard(Long id) {
        log.info("게시글 삭제 시작 - boardId: {}", id);
        
        try {
            // 삭제 전 게시글 상태 확인 (삭제된 것도 포함하여 조회)
            BoardDTO existingBoard = boardMapper.getBoardByIdIncludeDeleted(id);
            if (existingBoard != null) {
                log.info("삭제 전 게시글 상태 - boardId: {}, is_deleted: {}, status: {}", 
                    id, existingBoard.getIsDeleted(), existingBoard.getStatus());
                
                // 이미 삭제된 게시글인지 확인
                if (existingBoard.getIsDeleted() != null && existingBoard.getIsDeleted()) {
                    log.warn("이미 삭제된 게시글입니다. boardId: {}", id);
                    return 0; // 이미 삭제된 상태이므로 실패로 처리 (중복 삭제 방지)
                }
            } else {
                log.warn("삭제 요청된 게시글을 찾을 수 없습니다. ID: {}", id);
                return 0;
            }
            
            // 삭제 쿼리 실행 (삭제되지 않은 게시글만 대상)
            log.info("삭제 쿼리 실행 시작 - boardId: {}", id);
            int result = boardMapper.deleteBoard(id);
            log.info("삭제 쿼리 실행 완료 - boardId: {}, 영향받은 행: {}", id, result);
            
            // 즉시 플러시하여 실제 데이터베이스에 반영
            log.info("트랜잭션 플러시 실행 - boardId: {}", id);
            
            // 삭제 결과 확인
            if (result > 0) {
                // 삭제 후 상태 재확인 (삭제된 것도 포함하여 조회)
                BoardDTO deletedBoard = boardMapper.getBoardByIdIncludeDeleted(id);
                if (deletedBoard != null) {
                    log.info("삭제 후 게시글 상태 - boardId: {}, is_deleted: {}, status: {}", 
                        id, deletedBoard.getIsDeleted(), deletedBoard.getStatus());
                    
                    // 삭제 성공 여부 확인
                    if (deletedBoard.getIsDeleted() != null && deletedBoard.getIsDeleted()) {
                        log.info("게시글 삭제 성공 확인 - boardId: {}", id);
                        return 1; // 성공
                    } else {
                        log.error("삭제 쿼리 실행되었으나 게시글이 여전히 활성 상태입니다. boardId: {}", id);
                        throw new RuntimeException("삭제 처리가 정상적으로 완료되지 않았습니다.");
                    }
                } else {
                    log.error("삭제 후 게시글 조회 실패 - boardId: {}", id);
                    throw new RuntimeException("삭제 후 상태 확인에 실패했습니다.");
                }
            } else {
                log.error("삭제 쿼리 실행되었으나 영향받은 행이 0개입니다. boardId: {}", id);
                throw new RuntimeException("삭제 대상 게시글을 찾을 수 없거나 이미 삭제되었습니다.");
            }
        } catch (Exception e) {
            log.error("게시글 삭제 중 오류 발생 - boardId: {}", id, e);
            throw new RuntimeException("게시글 삭제 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 조회수 증가
     */
    @Transactional
    public void incrementViewCount(Long id) {
        log.info("조회수 증가 시작 - boardId: {}", id);
        
        try {
            boardMapper.incrementViewCount(id);
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
            searchDTO.setCategory("NOTICE");
            searchDTO.setSize(5); // 최신 5개만
            searchDTO.setPage(1); // 1페이지부터 시작
            
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
    
    /**
     * 카테고리별 인기 게시글 목록 조회
     */
    public List<BoardDTO> getPopularBoardsByCategory(String category) {
        log.info("카테고리별 인기 게시글 목록 조회 시작 - category: {}", category);
        
        try {
            List<BoardDTO> popularBoards;
            if (category == null || category.trim().isEmpty()) {
                popularBoards = boardMapper.getPopularBoards();
            } else {
                popularBoards = boardMapper.getPopularBoardsByCategory(category);
            }
            log.info("카테고리별 인기 게시글 목록 조회 완료 - 조회된 건수: {}", popularBoards.size());
            
            return popularBoards;
        } catch (Exception e) {
            log.error("카테고리별 인기 게시글 목록 조회 중 오류 발생", e);
            throw new RuntimeException("인기 게시글을 불러오는 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 이전 게시글 조회
     */
    public BoardDTO getPreviousBoard(Long currentId) {
        log.info("이전 게시글 조회 시작 - currentId: {}", currentId);
        
        try {
            BoardDTO prevBoard = boardMapper.getPreviousBoard(currentId);
            log.info("이전 게시글 조회 완료 - prevBoardId: {}", prevBoard != null ? prevBoard.getBoardId() : "없음");
            
            return prevBoard;
        } catch (Exception e) {
            log.error("이전 게시글 조회 중 오류 발생", e);
            return null; // 이전 게시글이 없거나 오류가 발생한 경우 null 반환
        }
    }
    
    /**
     * 다음 게시글 조회
     */
    public BoardDTO getNextBoard(Long currentId) {
        log.info("다음 게시글 조회 시작 - currentId: {}", currentId);
        
        try {
            BoardDTO nextBoard = boardMapper.getNextBoard(currentId);
            log.info("다음 게시글 조회 완료 - nextBoardId: {}", nextBoard != null ? nextBoard.getBoardId() : "없음");
            
            return nextBoard;
        } catch (Exception e) {
            log.error("다음 게시글 조회 중 오류 발생", e);
            return null; // 다음 게시글이 없거나 오류가 발생한 경우 null 반환
        }
    }
    
    /**
     * 게시글 추천수 증가
     */
    @Transactional
    public void incrementLikeCount(Long id) {
        log.info("게시글 추천수 증가 시작 - boardId: {}", id);
        
        try {
            boardMapper.incrementLikeCount(id);
            log.info("게시글 추천수 증가 완료 - boardId: {}", id);
        } catch (Exception e) {
            log.error("게시글 추천수 증가 중 오류 발생 - boardId: {}", id, e);
            throw new RuntimeException("추천 처리 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 게시글 추천수 감소
     */
    @Transactional
    public void decrementLikeCount(Long id) {
        log.info("게시글 추천수 감소 시작 - boardId: {}", id);
        
        try {
            boardMapper.decrementLikeCount(id);
            log.info("게시글 추천수 감소 완료 - boardId: {}", id);
        } catch (Exception e) {
            log.error("게시글 추천수 감소 중 오류 발생 - boardId: {}", id, e);
            throw new RuntimeException("추천 취소 처리 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 전체 게시글 수 조회 (홈페이지 통계용)
     */
    public int getBoardCount() {
        log.info("전체 게시글 수 조회 시작");
        
        try {
            BoardDTO searchDTO = new BoardDTO();
            int count = boardMapper.getBoardCount(searchDTO);
            log.info("전체 게시글 수 조회 완료 - 총 {}건", count);
            
            return count;
        } catch (Exception e) {
            log.error("전체 게시글 수 조회 중 오류 발생", e);
            return 0; // 오류 시 0 반환
        }
    }
    
    /**
     * 모든 게시글 상태 조회 (개발용 - 삭제된 것 포함)
     */
    public List<BoardDTO> getAllBoardsWithStatus() {
        log.info("모든 게시글 상태 조회 시작 (개발용)");
        
        try {
            List<BoardDTO> allBoards = boardMapper.getAllBoardsWithStatus();
            log.info("모든 게시글 상태 조회 완료 - 총 {}건", allBoards.size());
            
            return allBoards;
        } catch (Exception e) {
            log.error("모든 게시글 상태 조회 중 오류 발생", e);
            return List.of();
        }
    }

    /**
     * 기존 데이터의 is_active 필드 업데이트 (임시 - 개발용)
     */
    @Transactional
    public int updateExistingDataActiveStatus() {
        log.info("기존 데이터 is_active 필드 업데이트 시작");
        
        try {
            int updatedCount = boardMapper.updateExistingDataActiveStatus();
            log.info("기존 데이터 is_active 필드 업데이트 완료 - 업데이트된 행: {}", updatedCount);
            
            return updatedCount;
        } catch (Exception e) {
            log.error("기존 데이터 is_active 필드 업데이트 중 오류 발생", e);
            throw new RuntimeException("기존 데이터 업데이트 중 오류가 발생했습니다.", e);
        }
    }
} 