package com.example.carelink.controller;

import com.example.carelink.common.PageInfo;
import com.example.carelink.dto.BoardDTO;
import com.example.carelink.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 정보 게시판 컨트롤러
 * 팀원 D 담당
 */
@Controller
@RequestMapping("/board")
@RequiredArgsConstructor
public class BoardController {
    
    private final BoardService boardService;
    
    /**
     * 게시판 목록 페이지
     */
    @GetMapping
    public String listPage(Model model,
                          @RequestParam(defaultValue = "1") int page,
                          @RequestParam(defaultValue = "") String keyword,
                          @RequestParam(defaultValue = "") String category,
                          @RequestParam(defaultValue = "") String type) {
        
        // type 파라미터가 있으면 category로 변환
        if (!type.isEmpty()) {
            switch (type.toLowerCase()) {
                case "notice":
                    category = "NOTICE";
                    break;
                case "info":
                    category = "INFO";
                    break;
                case "qna":
                    category = "QNA";
                    break;
                case "faq":
                    category = "FAQ";
                    break;
            }
        }
        
        // 게시글 목록 조회 (페이징 포함)
        PageInfo<BoardDTO> pageInfo = boardService.getBoardList(page, keyword, category);
        
        // 인기 게시글 목록 조회
        List<BoardDTO> popularBoards = boardService.getPopularBoards();
        
        model.addAttribute("pageInfo", pageInfo);
        model.addAttribute("boardList", pageInfo.getList());
        model.addAttribute("popularBoards", popularBoards);
        model.addAttribute("keyword", keyword);
        model.addAttribute("category", category);
        model.addAttribute("currentPage", page);
        
        return "board/list";
    }
    
    /**
     * 게시글 작성 페이지
     */
    @GetMapping("/write")
    public String writePage(Model model) {
        model.addAttribute("boardDTO", new BoardDTO());
        return "board/write";
    }
    
    /**
     * 게시글 등록 처리
     */
    @PostMapping("/write")
    public String writeBoard(@ModelAttribute BoardDTO boardDTO) {
        boardService.insertBoard(boardDTO);
        return "redirect:/board";
    }
    
    /**
     * 게시글 상세보기
     */
    @GetMapping("/detail/{id}")
    public String detailPage(@PathVariable Long id, Model model) {
        BoardDTO board = boardService.getBoardById(id);
        // 조회수 증가
        boardService.incrementViewCount(id);
        model.addAttribute("board", board);
        return "board/detail";
    }
    
    /**
     * 게시글 수정 페이지
     */
    @GetMapping("/edit/{id}")
    public String editPage(@PathVariable Long id, Model model) {
        BoardDTO board = boardService.getBoardById(id);
        model.addAttribute("boardDTO", board);
        return "board/edit";
    }
    
    /**
     * 게시글 수정 처리
     */
    @PostMapping("/edit/{id}")
    public String editBoard(@PathVariable Long id, @ModelAttribute BoardDTO boardDTO) {
        boardDTO.setBoardId(id);
        boardService.updateBoard(boardDTO);
        return "redirect:/board/detail/" + id;
    }
    
    /**
     * 게시글 삭제
     */
    @PostMapping("/delete/{id}")
    public String deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
        return "redirect:/board";
    }
} 