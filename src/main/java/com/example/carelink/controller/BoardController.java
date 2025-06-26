package com.example.carelink.controller;

import com.example.carelink.common.PageInfo;
import com.example.carelink.dto.BoardDTO;
import com.example.carelink.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 정보 게시판 컨트롤러
 * 팀원 D 담당 - 완전 개선 버전
 */
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
                          @RequestParam(defaultValue = "all") String type) {
        
        // 게시판 타입 정보 설정
        Map<String, String> currentBoardInfo = boardTypeInfo.getOrDefault(type, boardTypeInfo.get("all"));
        String actualCategory = currentBoardInfo.get("category");
        
        // category 파라미터가 있으면 우선 사용, 없으면 type에서 가져온 category 사용
        if (category.isEmpty() && !actualCategory.isEmpty()) {
            category = actualCategory;
        }
        
        // 게시글 목록 조회 (페이징 포함)
        PageInfo<BoardDTO> pageInfo = boardService.getBoardList(page, keyword, category);
        
        // 인기 게시글 목록 조회 (해당 카테고리 내에서)
        List<BoardDTO> popularBoards = boardService.getPopularBoardsByCategory(category);
        
        // Model에 데이터 추가
        model.addAttribute("pageInfo", pageInfo);
        model.addAttribute("boardList", pageInfo.getList());
        model.addAttribute("popularBoards", popularBoards);
        model.addAttribute("keyword", keyword);
        model.addAttribute("category", category);
        model.addAttribute("type", type);
        model.addAttribute("currentPage", page);
        
        // 게시판 타입별 정보
        model.addAttribute("boardTitle", currentBoardInfo.get("title"));
        model.addAttribute("boardDescription", currentBoardInfo.get("description"));
        model.addAttribute("pageTitle", currentBoardInfo.get("title"));
        
        return "board/list";
    }
    
    /**
     * 게시글 작성 페이지
     */
    @GetMapping("/write")
    public String writePage(Model model, @RequestParam(defaultValue = "all") String type) {
        BoardDTO boardDTO = new BoardDTO();
        
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
        
        return "board/write";
    }
    
    /**
     * 게시글 등록 처리
     */
    @PostMapping("/write")
    public String writeBoard(@ModelAttribute BoardDTO boardDTO, 
                           @RequestParam(defaultValue = "all") String type,
                           RedirectAttributes redirectAttributes) {
        try {
            // 현재 로그인한 사용자 ID 설정 (실제로는 세션에서 가져와야 함)
            boardDTO.setMemberId(1L); // 임시로 1번 사용자로 설정
            
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
                           Model model) {
        try {
            BoardDTO board = boardService.getBoardById(id);
            // 조회수 증가
            boardService.incrementViewCount(id);
            
            // 이전글/다음글 조회
            BoardDTO prevBoard = boardService.getPreviousBoard(id, board.getCategory());
            BoardDTO nextBoard = boardService.getNextBoard(id, board.getCategory());
            
            model.addAttribute("board", board);
            model.addAttribute("prevBoard", prevBoard);
            model.addAttribute("nextBoard", nextBoard);
            model.addAttribute("type", type);
            model.addAttribute("page", page);
            model.addAttribute("pageTitle", board.getTitle());
            
            return "board/detail";
        } catch (Exception e) {
            model.addAttribute("error", "게시글을 불러올 수 없습니다: " + e.getMessage());
            return "redirect:/board?type=" + type;
        }
    }
    
    /**
     * 게시글 수정 페이지
     */
    @GetMapping("/edit/{id}")
    public String editPage(@PathVariable Long id, 
                         @RequestParam(defaultValue = "all") String type,
                         Model model) {
        try {
            BoardDTO board = boardService.getBoardById(id);
            model.addAttribute("boardDTO", board);
            model.addAttribute("type", type);
            model.addAttribute("pageTitle", "게시글 수정");
            return "board/edit";
        } catch (Exception e) {
            model.addAttribute("error", "게시글을 불러올 수 없습니다: " + e.getMessage());
            return "redirect:/board?type=" + type;
        }
    }
    
    /**
     * 게시글 수정 처리
     */
    @PostMapping("/edit/{id}")
    public String editBoard(@PathVariable Long id, 
                          @ModelAttribute BoardDTO boardDTO,
                          @RequestParam(defaultValue = "all") String type,
                          RedirectAttributes redirectAttributes) {
        try {
            boardDTO.setBoardId(id);
            boardService.updateBoard(boardDTO);
            redirectAttributes.addFlashAttribute("message", "게시글이 성공적으로 수정되었습니다.");
            return "redirect:/board/detail/" + id + "?type=" + type;
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "게시글 수정 중 오류가 발생했습니다: " + e.getMessage());
            return "redirect:/board/edit/" + id + "?type=" + type;
        }
    }
    
    /**
     * 게시글 삭제
     */
    @PostMapping("/delete/{id}")
    public String deleteBoard(@PathVariable Long id,
                            @RequestParam(defaultValue = "all") String type,
                            RedirectAttributes redirectAttributes) {
        try {
            boardService.deleteBoard(id);
            redirectAttributes.addFlashAttribute("message", "게시글이 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "게시글 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
        
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
} 