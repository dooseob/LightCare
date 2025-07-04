package com.example.carelink.controller;

import com.example.carelink.common.PageInfo;
import com.example.carelink.common.Constants;
import com.example.carelink.dto.BoardDTO;
import com.example.carelink.dto.MemberDTO;
import com.example.carelink.service.BoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * 정보 게시판 컨트롤러
 * 팀원 D 담당 - 완전 개선 버전
 */
@Slf4j
@Controller
@RequestMapping("/board")
@RequiredArgsConstructor
public class BoardController {
    
    private final BoardService boardService;
    
    // 게시판 타입별 정보 매핑
    private final Map<String, Map<String, String>> boardTypeInfo = Map.of(
        "notice", Map.of("title", "공지사항", "description", "중요한 공지사항을 확인하세요", "category", "NOTICE"),
        "info", Map.of("title", "정보공유", "description", "유용한 정보를 공유하고 함께 나누세요", "category", "INFO"),
        "qna", Map.of("title", "Q&A", "description", "궁금한 점을 질문하고 답변을 받아보세요", "category", "QNA"),
        "faq", Map.of("title", "자주묻는질문", "description", "자주 묻는 질문과 답변을 확인하세요", "category", "FAQ"),
        "all", Map.of("title", "전체 게시판", "description", "모든 게시판의 글을 한번에 확인하세요", "category", "")
    );
    
    /**
     * 게시판 목록 페이지 (타입별 구분 지원)
     */
    @GetMapping
    public String listPage(Model model,
                          @RequestParam(defaultValue = "1") int page,
                          @RequestParam(defaultValue = "") String keyword,
                          @RequestParam(defaultValue = "") String category,
                          @RequestParam(defaultValue = "all") String type,
                          HttpServletResponse response) {
        
        // 캐시 방지 헤더 설정
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
        
        // 게시판 타입 정보 설정
        Map<String, String> currentBoardInfo = boardTypeInfo.getOrDefault(type, boardTypeInfo.get("all"));
        String actualCategory = currentBoardInfo.get("category");
        
        // category 파라미터가 있으면 우선 사용, 없으면 type에서 가져온 category 사용
        if (category.isEmpty() && !actualCategory.isEmpty()) {
            category = actualCategory;
        }
        
        try {
            // 게시글 목록 조회 (페이징 포함)
            PageInfo<BoardDTO> pageInfo = boardService.getBoardList(page, keyword, category);
            
            // 인기 게시글 목록 조회 (해당 카테고리 내에서)
            List<BoardDTO> popularBoards = boardService.getPopularBoardsByCategory(category);
            
            // Model에 데이터 추가
            model.addAttribute("pageInfo", pageInfo);
            model.addAttribute("boardList", pageInfo.getList());
            model.addAttribute("popularBoards", popularBoards != null ? popularBoards : List.of());
            model.addAttribute("keyword", keyword != null ? keyword : "");
            model.addAttribute("category", category != null ? category : "");
            model.addAttribute("type", type);
            model.addAttribute("currentPage", page);
        } catch (Exception e) {
            // 에러 발생 시 빈 페이지 정보 전달
            model.addAttribute("pageInfo", new PageInfo<>(List.of(), page, 10, 0));
            model.addAttribute("boardList", List.of());
            model.addAttribute("popularBoards", List.of());
            model.addAttribute("keyword", keyword != null ? keyword : "");
            model.addAttribute("category", category != null ? category : "");
            model.addAttribute("type", type);
            model.addAttribute("currentPage", page);
            model.addAttribute("error", "게시글을 불러오는 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        // 게시판 타입별 정보
        model.addAttribute("boardTitle", currentBoardInfo.get("title"));
        model.addAttribute("boardDescription", currentBoardInfo.get("description"));
        model.addAttribute("pageTitle", currentBoardInfo.get("title"));
        
        // 카테고리별 전용 템플릿 사용
        if ("faq".equals(type)) {
            return "board/faq-list";
        } else if ("notice".equals(type)) {
            return "board/notice-list";
        } else if ("qna".equals(type)) {
            return "board/qna-list";
        }
        
        return "board/list";
    }
    
    /**
     * 게시글 작성 페이지
     */
    @GetMapping("/write")
    public String writePage(Model model, 
                          @RequestParam(defaultValue = "all") String type,
                          HttpSession session,
                          RedirectAttributes redirectAttributes) {
        
        // 로그인 체크
        Long memberId = (Long) session.getAttribute("memberId");
        if (memberId == null) {
            redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
            return "redirect:/member/login";
        }
        
        // 권한 체크 - 공지사항과 FAQ는 관리자만 작성 가능
        MemberDTO loginMember = (MemberDTO) session.getAttribute("loginMember");
        if (("notice".equals(type) || "faq".equals(type)) && 
            (loginMember == null || !"ADMIN".equals(loginMember.getRole()))) {
            redirectAttributes.addFlashAttribute("error", "해당 게시판에 글을 작성할 권한이 없습니다.");
            return "redirect:/board?type=" + type;
        }
        
        BoardDTO boardDTO = new BoardDTO();
        boardDTO.setMemberId(memberId); // 세션에서 가져온 사용자 ID 설정
        
        // 게시판 타입에 따라 기본 카테고리 설정
        Map<String, String> currentBoardInfo = boardTypeInfo.getOrDefault(type, boardTypeInfo.get("all"));
        String defaultCategory = currentBoardInfo.get("category");
        if (!defaultCategory.isEmpty()) {
            boardDTO.setCategory(defaultCategory);
        }
        
        model.addAttribute("boardDTO", boardDTO);
        model.addAttribute("type", type);
        model.addAttribute("boardTitle", currentBoardInfo.get("title"));
        model.addAttribute("pageTitle", currentBoardInfo.get("title") + " 작성");
        
        // 타입별 전용 작성 템플릿 사용
        if ("faq".equals(type)) {
            return "board/faq-write";
        } else if ("notice".equals(type)) {
            return "board/write";  // 공지사항은 일반 작성 폼 사용
        } else if ("qna".equals(type)) {
            return "board/write";  // Q&A는 일반 작성 폼 사용  
        } else if ("info".equals(type)) {
            return "board/write";  // 정보공유는 일반 작성 폼 사용
        }
        
        return "board/write";
    }
    
    /**
     * 게시글 등록 처리
     */
    @PostMapping("/write")
    public String writeBoard(@ModelAttribute BoardDTO boardDTO, 
                           @RequestParam(defaultValue = "all") String type,
                           HttpSession session,
                           RedirectAttributes redirectAttributes) {
        try {
            // 로그인 체크
            Long memberId = (Long) session.getAttribute("memberId");
            if (memberId == null) {
                redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
                return "redirect:/member/login";
            }
            
            // 권한 체크 - 공지사항과 FAQ는 관리자만 작성 가능
            MemberDTO loginMember = (MemberDTO) session.getAttribute("loginMember");
            if (("notice".equals(type) || "faq".equals(type)) && 
                (loginMember == null || !"ADMIN".equals(loginMember.getRole()))) {
                redirectAttributes.addFlashAttribute("error", "해당 게시판에 글을 작성할 권한이 없습니다.");
                return "redirect:/board?type=" + type;
            }
            
            // 세션에서 가져온 사용자 ID 설정 (보안 강화)
            boardDTO.setMemberId(memberId);
            
            // 기본값 설정
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
                boardDTO.setIsDeleted(false);  // 삭제되지 않은 상태로 기본 설정
            }
            
            boardService.insertBoard(boardDTO);
            redirectAttributes.addFlashAttribute("message", "게시글이 성공적으로 등록되었습니다.");
            
            // 원래 게시판 타입으로 돌아가기
            if ("all".equals(type)) {
                return "redirect:/board";
            } else {
                return "redirect:/board?type=" + type;
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "게시글 등록 중 오류가 발생했습니다: " + e.getMessage());
            return "redirect:/board/write?type=" + type;
        }
    }
    
    /**
     * 게시글 상세보기
     */
    @GetMapping("/detail/{id}")
    public String detailPage(@PathVariable Long id, 
                           @RequestParam(defaultValue = "all") String type,
                           @RequestParam(defaultValue = "1") int page,
                           Model model,
                           RedirectAttributes redirectAttributes) {
        try {
            BoardDTO board = boardService.getBoardById(id);
            // 조회수 증가
            boardService.incrementViewCount(id);
            
            // 이전글/다음글 조회
            BoardDTO prevBoard = boardService.getPreviousBoard(id);
            BoardDTO nextBoard = boardService.getNextBoard(id);
            
            model.addAttribute("board", board);
            model.addAttribute("prevBoard", prevBoard);
            model.addAttribute("nextBoard", nextBoard);
            model.addAttribute("type", type);
            model.addAttribute("page", page);
            model.addAttribute("pageTitle", board.getTitle());
            
            // 카테고리별 상세보기 템플릿 분기 (현재는 모두 동일한 템플릿 사용)
            // 향후 카테고리별 특화 상세보기가 필요한 경우 여기서 분기 처리
            return "board/detail";
        } catch (Exception e) {
            log.error("게시글 상세보기 오류 - boardId: {}", id, e);
            redirectAttributes.addFlashAttribute("error", "게시글을 불러올 수 없습니다: " + e.getMessage());
            return "redirect:/board?type=" + type;
        }
    }
    
    /**
     * 게시글 수정 페이지
     */
    @GetMapping("/edit/{id}")
    public String editPage(@PathVariable Long id, 
                          @RequestParam(name = "type", required = false) String type,
                         HttpSession session,
                         Model model,
                         RedirectAttributes redirectAttributes) {
        try {
            // 로그인 체크
            Long memberId = (Long) session.getAttribute("memberId");
            if (memberId == null) {
                redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
                return "redirect:/member/login";
            }
            
            // 게시글 조회 (삭제된 것 포함)
            BoardDTO board = boardService.getBoardByIdIncludeDeleted(id);
            if (board == null) {
                redirectAttributes.addFlashAttribute("error", "수정할 게시글을 찾을 수 없습니다.");
                return "redirect:/board?type=" + (type != null ? type : "all");
            }
            
            // 삭제된 게시글인지 확인
            if (board.getIsDeleted() != null && board.getIsDeleted()) {
                redirectAttributes.addFlashAttribute("error", "삭제된 게시글은 수정할 수 없습니다.");
                return "redirect:/board/detail/" + id + "?type=" + (type != null ? type : "all");
            }
            
            log.info("수정 페이지 접근 - 게시글 ID: {}, 작성자 ID: {}, 요청자 ID: {}", id, board.getMemberId(), memberId);
            
            // 권한 체크
            MemberDTO loginMember = (MemberDTO) session.getAttribute("loginMember");
            boolean isAdmin = loginMember != null && "ADMIN".equals(loginMember.getRole());
            boolean isAuthor = board.getMemberId().equals(memberId);
            
            // 공지사항과 FAQ는 관리자만 수정 가능
            if (("NOTICE".equals(board.getCategory()) || "FAQ".equals(board.getCategory())) && !isAdmin) {
                log.warn("권한 없는 수정 시도 - 공지사항/FAQ 수정 권한 없음. 요청자: {}", memberId);
                redirectAttributes.addFlashAttribute("error", "해당 게시글을 수정할 권한이 없습니다.");
                return "redirect:/board/detail/" + id + "?type=" + (type != null ? type : "all");
            }
            
            // 일반 게시글은 작성자 본인 또는 관리자만 수정 가능
            if (!isAuthor && !isAdmin) {
                log.warn("권한 없는 수정 시도 - 게시글 작성자: {}, 요청자: {}", board.getMemberId(), memberId);
                redirectAttributes.addFlashAttribute("error", "작성자만 수정할 수 있습니다.");
                return "redirect:/board/detail/" + id + "?type=" + (type != null ? type : "all");
            }
            
            // 게시판 타입별 정보
            Map<String, String> currentBoardInfo = boardTypeInfo.getOrDefault(type != null ? type : "all", boardTypeInfo.get("all"));
            
            model.addAttribute("boardDTO", board);
            model.addAttribute("type", type != null ? type : "all");
            model.addAttribute("boardTitle", currentBoardInfo.get("title"));
            model.addAttribute("pageTitle", currentBoardInfo.get("title") + " 수정");
            
            return "board/edit";
        } catch (Exception e) {
            log.error("수정 페이지 로드 중 오류 발생 - boardId: {}", id, e);
            redirectAttributes.addFlashAttribute("error", "수정 페이지를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            return "redirect:/board?type=" + (type != null ? type : "all");
        }
    }
    
    /**
     * 게시글 수정 처리
     */
    @PostMapping("/edit/{id}")
    public String editBoard(@PathVariable Long id, 
                          @ModelAttribute BoardDTO boardDTO,
                          @RequestParam(defaultValue = "all") String type,
                          HttpSession session,
                          RedirectAttributes redirectAttributes) {
        try {
            // 로그인 체크
            Long memberId = (Long) session.getAttribute("memberId");
            if (memberId == null) {
                redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
                return "redirect:/member/login";
            }
            
            // 기존 게시글 정보 조회 (삭제된 것 포함)
            BoardDTO existingBoard = boardService.getBoardByIdIncludeDeleted(id);
            if (existingBoard == null) {
                redirectAttributes.addFlashAttribute("error", "수정할 게시글을 찾을 수 없습니다.");
                return getRedirectUrl(type);
            }
            
            // 삭제된 게시글인지 확인
            if (existingBoard.getIsDeleted() != null && existingBoard.getIsDeleted()) {
                redirectAttributes.addFlashAttribute("error", "삭제된 게시글은 수정할 수 없습니다.");
                return getRedirectUrl(type);
            }
            
            log.info("수정 요청 - 게시글 ID: {}, 작성자 ID: {}, 요청자 ID: {}", id, existingBoard.getMemberId(), memberId);
            
            // 권한 체크
            MemberDTO loginMember = (MemberDTO) session.getAttribute("loginMember");
            boolean isAdmin = loginMember != null && "ADMIN".equals(loginMember.getRole());
            boolean isAuthor = existingBoard.getMemberId().equals(memberId);
            
            // 공지사항과 FAQ는 관리자만 수정 가능
            if (("NOTICE".equals(existingBoard.getCategory()) || "FAQ".equals(existingBoard.getCategory())) && !isAdmin) {
                log.warn("권한 없는 수정 시도 - 공지사항/FAQ 수정 권한 없음. 요청자: {}", memberId);
                redirectAttributes.addFlashAttribute("error", "해당 게시글을 수정할 권한이 없습니다.");
                return "redirect:/board/detail/" + id + "?type=" + type;
            }
            
            // 일반 게시글은 작성자 본인 또는 관리자만 수정 가능
            if (!isAuthor && !isAdmin) {
                log.warn("권한 없는 수정 시도 - 게시글 작성자: {}, 요청자: {}", existingBoard.getMemberId(), memberId);
                redirectAttributes.addFlashAttribute("error", "작성자만 수정할 수 있습니다.");
                return "redirect:/board/detail/" + id + "?type=" + type;
            }
            
            // 수정할 게시글 정보 설정
            boardDTO.setBoardId(id);
            boardDTO.setMemberId(memberId);
            
            // 기본값 설정
            if (boardDTO.getIsNotice() == null) {
                boardDTO.setIsNotice(false);
            }
            if (boardDTO.getIsSecret() == null) {
                boardDTO.setIsSecret(false);
            }
            if (boardDTO.getIsActive() == null) {
                boardDTO.setIsActive(true);  // 활성 상태 유지
            }
            if (boardDTO.getIsDeleted() == null) {
                boardDTO.setIsDeleted(false);  // 삭제되지 않은 상태 유지
            }
            
            boardService.updateBoard(boardDTO);
            log.info("수정 완료 - 게시글 ID: {}", id);
            redirectAttributes.addFlashAttribute("message", "✅ 게시글이 성공적으로 수정되었습니다.");
            return "redirect:/board/detail/" + id + "?type=" + type;
        } catch (Exception e) {
            log.error("수정 처리 중 오류 발생 - boardId: {}", id, e);
            redirectAttributes.addFlashAttribute("error", "❌ 게시글 수정 중 오류가 발생했습니다: " + e.getMessage());
            return "redirect:/board/edit/" + id + "?type=" + type;
        }
    }
    
    /**
     * 게시글 삭제 처리
     */
    @PostMapping("/delete/{id}")
    public String deleteBoard(@PathVariable Long id,
                             @RequestParam(name = "type", required = false) String type,
                            HttpSession session,
                            RedirectAttributes redirectAttributes) {
        
        try {
            log.info("🚀 삭제 요청 시작 - 게시글 ID: {}", id);
            
            // 로그인 확인
            Long memberId = (Long) session.getAttribute("memberId");
            log.info("🔍 세션 확인 - memberId: {}", memberId);
            
            if (memberId == null) {
                log.warn("❌ 로그인 안됨 - 삭제 실패");
                redirectAttributes.addFlashAttribute("error", "로그인이 필요합니다.");
                return "redirect:/member/login";
            }
            
            // 게시글 조회 (삭제된 것 포함)
            BoardDTO board = boardService.getBoardByIdIncludeDeleted(id);
            log.info("🔍 게시글 조회 결과 - board: {}", board != null ? "존재함" : "없음");
            
            if (board == null) {
                log.warn("❌ 게시글 없음 - 삭제 실패");
                redirectAttributes.addFlashAttribute("error", "게시글을 찾을 수 없습니다.");
                return getRedirectUrl(type);
            }
            
            log.info("🔍 권한 체크 - 게시글 작성자: {}, 요청자: {}", board.getMemberId(), memberId);
            log.info("삭제 요청 - 게시글 ID: {}, 작성자 ID: {}, 요청자 ID: {}", id, board.getMemberId(), memberId);
            
            // 권한 체크
            MemberDTO loginMember = (MemberDTO) session.getAttribute("loginMember");
            boolean isAdmin = loginMember != null && "ADMIN".equals(loginMember.getRole());
            boolean isAuthor = board.getMemberId().equals(memberId);
            
            // 공지사항과 FAQ는 관리자만 삭제 가능
            if (("NOTICE".equals(board.getCategory()) || "FAQ".equals(board.getCategory())) && !isAdmin) {
                log.warn("❌ 권한 없는 삭제 시도 - 공지사항/FAQ 삭제 권한 없음. 요청자: {}", memberId);
                redirectAttributes.addFlashAttribute("error", "해당 게시글을 삭제할 권한이 없습니다.");
                return getRedirectUrl(type);
            }
            
            // 일반 게시글은 작성자 본인 또는 관리자만 삭제 가능
            if (!isAuthor && !isAdmin) {
                log.warn("❌ 권한 없는 삭제 시도 - 게시글 작성자: {}, 요청자: {}", board.getMemberId(), memberId);
                redirectAttributes.addFlashAttribute("error", "작성자만 삭제할 수 있습니다.");
                return getRedirectUrl(type);
            }
            
            log.info("✅ 권한 체크 통과 - 삭제 진행");
            
            // 삭제 실행
            Map<String, Object> deleteResult = boardService.deleteBoard(id);
            Boolean success = (Boolean) deleteResult.get("success");
            String message = (String) deleteResult.get("message");
            
            log.info("삭제 결과 - 성공: {}, 메시지: {}", success, message);
            
            if (success) {
                redirectAttributes.addFlashAttribute("message", "✅ " + message);
            } else {
                redirectAttributes.addFlashAttribute("error", "❌ " + message);
            }
            
            return getRedirectUrl(type);
            
        } catch (Exception e) {
            log.error("게시글 삭제 처리 중 오류 발생 - boardId: {}", id, e);
            redirectAttributes.addFlashAttribute("error", "❌ 게시글 삭제 중 오류가 발생했습니다: " + e.getMessage());
            return getRedirectUrl(type);
        }
    }
    
    /**
     * 리다이렉트 URL 생성 (중복 코드 제거)
     */
    private String getRedirectUrl(String type) {
        if ("all".equals(type)) {
            return "redirect:/board";
        } else {
            return "redirect:/board?type=" + type;
        }
    }
    
    /**
     * 게시글 추천/비추천
     */
    @PostMapping("/like/{id}")
    @ResponseBody
    public Map<String, Object> toggleLike(@PathVariable Long id, 
                                        @RequestParam String action) {
        Map<String, Object> result = new HashMap<>();
        try {
            if ("like".equals(action)) {
                boardService.incrementLikeCount(id);
                result.put("success", true);
                result.put("message", "추천되었습니다.");
            } else if ("dislike".equals(action)) {
                boardService.decrementLikeCount(id);
                result.put("success", true);
                result.put("message", "추천이 취소되었습니다.");
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "처리 중 오류가 발생했습니다.");
        }
        return result;
    }
    
    /**
     * 디버깅: 게시글 상태 확인
     */
    @GetMapping("/debug/board/{id}")
    @ResponseBody
    public Map<String, Object> debugBoardStatus(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            log.info("🔧 디버그 API 호출 - boardId: {}", id);
            
            // 삭제된 것 포함하여 조회
            BoardDTO board = boardService.getBoardByIdIncludeDeleted(id);
            if (board == null) {
                result.put("error", "게시글을 찾을 수 없습니다");
                log.warn("🔧 디버그 - 게시글을 찾을 수 없음: {}", id);
                return result;
            }
            
            result.put("boardId", board.getBoardId());
            result.put("title", board.getTitle());
            result.put("isDeleted", board.getIsDeleted());
            result.put("isDeletedType", board.getIsDeleted() != null ? board.getIsDeleted().getClass().getSimpleName() : "null");
            result.put("isDeletedValue", board.getIsDeleted() != null ? board.getIsDeleted().toString() : "null");
            result.put("isActive", board.getIsActive());
            result.put("isActiveType", board.getIsActive() != null ? board.getIsActive().getClass().getSimpleName() : "null");
            result.put("createdAt", board.getCreatedAt());
            
            // 삭제 조건 체크
            boolean wouldBeDeleted = board.getIsDeleted() != null && board.getIsDeleted();
            result.put("wouldBeConsideredDeleted", wouldBeDeleted);
            
            log.info("🔧 디버그 결과 - boardId: {}, isDeleted: {}, wouldBeDeleted: {}", 
                id, board.getIsDeleted(), wouldBeDeleted);
            
            return result;
        } catch (Exception e) {
            log.error("🔧 디버그 API 오류 - boardId: {}", id, e);
            result.put("error", "오류 발생: " + e.getMessage());
            return result;
        }
    }
    
    /**
     * 현재 로그인한 사용자 정보 조회
     */
    private MemberDTO getCurrentMember(HttpSession session) {
        return (MemberDTO) session.getAttribute(Constants.SESSION_MEMBER);
    }
    
    /**
     * 현재 로그인한 사용자 ID 조회 (기존 memberId 세션 키 사용)
     */
    private Long getCurrentMemberId(HttpSession session) {
        return (Long) session.getAttribute("memberId");
    }
    
    /**
     * 현재 사용자가 관리자인지 확인
     */
    private boolean isAdmin(HttpSession session) {
        MemberDTO loginMember = getCurrentMember(session);
        return loginMember != null && "ADMIN".equals(loginMember.getRole());
    }
    
    /**
     * 수정/삭제 권한 확인 (작성자 또는 관리자)
     */
    private boolean hasEditPermission(HttpSession session, Long authorMemberId) {
        Long currentMemberId = getCurrentMemberId(session);
        return (currentMemberId != null && currentMemberId.equals(authorMemberId)) || isAdmin(session);
    }


} 