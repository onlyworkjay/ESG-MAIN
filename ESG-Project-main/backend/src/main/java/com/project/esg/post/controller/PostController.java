package com.project.esg.post.controller;

import com.project.esg.global.security.JwtUtils;
import com.project.esg.post.dto.ListDto;
import com.project.esg.post.dto.PostResponse;
import com.project.esg.post.dto.ReportDto;
import com.project.esg.post.dto.SearchDto;
import com.project.esg.post.service.PostService;
import com.project.esg.post.vo.Post;
import com.project.esg.users.vo.LoginUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@CrossOrigin(
        origins = {
                "http://localhost:5173"
        },
        allowCredentials = "true"
)
@RestController
@RequestMapping(value = "/posts")

public class PostController {
    @Autowired
    private PostService postService;
    @Autowired
    private JwtUtils jwtUtil;

    /// 게시글 등록 (한진호)
    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestHeader(name = "Authorization") String token,
            @ModelAttribute Post post,
            @RequestParam(required = false) List<MultipartFile> files) throws IOException {
        //1. 토큰검증
        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new PostResponse<>(false, "로그인 정보를 확인할 수 없습니다.(토큰 만료 또는 이상)", null));
        }



        //3. post 객체 검증 (제목이 비어있거나 또는 내용이 비어있을때)
        if ((post.getTitle() == null || post.getTitle().trim().isEmpty()) || (post.getContent() == null || post.getContent().trim().isEmpty())
        ) {
            return ResponseEntity.ok(new PostResponse<>(false, "게시글 데이터가 누락되었습니다.", null));
        }

        //4. 서비스 호출 게시물 등록 및 응답 반환
        PostResponse<?> result = postService.createPost(user, post, files);

        return ResponseEntity.ok(result);
    }

    /// 게시글 목록 보기(한진호)
    @GetMapping
    public ResponseEntity<PostResponse<ListDto>> getPostList(@RequestHeader(required = false, name = "Authorization") String token,
                                                             @ModelAttribute SearchDto params) {
        LoginUser user = jwtUtil.checkToken(token);

        if (user != null) {     //params.userId = 0L 이었지만 user.userId 로 바인딩
            params.setUserId(user.getUserId());
        }

        ListDto listDto = postService.getPostList(params);

        PostResponse<ListDto> result = new PostResponse<>(true, "조회성공", listDto);

        return ResponseEntity.ok(result);
    }


    /// 게시글 상세 보기(한진호)
    @GetMapping(value = "/{postId}")
    public ResponseEntity<PostResponse<Post>> getPost(@RequestHeader(required = false, name = "Authorization") String token,
                                                      @PathVariable long postId, HttpServletRequest request,
                                                      HttpServletResponse response) {

        //토큰에서 로그인정보 추출
        LoginUser user = jwtUtil.checkToken(token);

        //서비스 호출 및 응답 반환
        PostResponse<Post> result = postService.getPost(postId, user, request, response);

        return ResponseEntity.ok(result);
    }

    /// 게시글 수정(한진호)
    @PutMapping(value = "/{postId}")
    public ResponseEntity<PostResponse<?>> updatePost(@RequestHeader(name = "Authorization") String token,
                                                      @ModelAttribute Post post, @RequestParam(required = false) List<MultipartFile> files,
                                                      @RequestParam(required = false) List<String> deleteS3Keys, @PathVariable long postId) {
        /** 파일체크용
         if (files != null) {
         for (MultipartFile file : files) {
         System.out.println("\n파일명: " + file.getOriginalFilename());
         System.out.println("크기: " + file.getSize());
         System.out.println("타입: " + file.getContentType());
         }
         }
         */
        //1. 토큰검증
        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new PostResponse<>(false, "로그인 정보를 확인할 수 없습니다.(토큰 만료 또는 이상)", null));
        }
        //2. post 객체 검증 (제목이 비어있거나 또는 내용이 비어있을때)
        if ((post.getTitle() == null || post.getTitle().trim().isEmpty()) || (post.getContent() == null || post.getContent().trim().isEmpty())
        ) {
            return ResponseEntity.ok(new PostResponse<>(false, "게시글 데이터가 누락되었습니다.", null));
        }
        //3.서비스 호출 및 응답 반환
        PostResponse<?> result = postService.updatePost(user, post, files, deleteS3Keys, postId);

        return ResponseEntity.ok(result);
    }

    /// 게시글 삭제(한진호)
    @DeleteMapping(value = "/{postId}")
    public ResponseEntity<?> deletePost(@RequestHeader(name = "Authorization") String token,
                                        @PathVariable long postId) {
        //1.토큰검증
        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new PostResponse<>(false, "로그인 정보를 확인할 수 없습니다.(토큰 만료 또는 이상)", null));

        }
        //2.서비스 호출 및 응답 반환
        PostResponse<?> result = postService.deletePost(user, postId);

        return ResponseEntity.ok(result);
    }

    /// 게시글 좋아요 (한진호)
    @PostMapping(value = "/{postId}/likes")
    public ResponseEntity<?> addLike(@RequestHeader(name = "Authorization") String token,
                                     @PathVariable long postId) {
        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new PostResponse<>(false, "로그인 정보를 확인할 수 없습니다.(토큰 만료 또는 이상)", null));
        }
        PostResponse<?> result = postService.insertLike(user, postId);
        return ResponseEntity.ok(result);
    }

    /// 게시글 좋아요 취소하기 (한진호)
    @DeleteMapping(value = "/{postId}/likes")
    public ResponseEntity<?> removeLike(@RequestHeader(name = "Authorization") String token,
                                        @PathVariable long postId) {
        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new PostResponse<>(false, "로그인 정보를 확인할 수 없습니다.(토큰 만료 또는 이상)", null));
        }
        PostResponse<?> result = postService.deleteLike(user, postId);

        return ResponseEntity.ok(result);
    }

    /// 게시글 신고하기 (한진호)
    @PostMapping(value = "/{postId}/reports")
    public ResponseEntity<?> addPostReport(@RequestHeader(name = "Authorization") String token,
                                           @PathVariable long postId,
                                           @RequestBody ReportDto report) {
        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new PostResponse<>(false, "로그인 정보를 확인할 수 없습니다.(토큰 만료 또는 이상)", null));
        }
        if (report.getReason() == null || report.getReason().trim().isEmpty()) {
            return ResponseEntity.ok(new PostResponse<>(false, "신고 사유를 입력해 주세요.", null));
        }
        PostResponse<?> result = postService.insertReport(user, postId, report);

        return ResponseEntity.ok(result);
    }

    /// 게시글 신고 조회하기 (한진호)
    @GetMapping(value = "/{postId}/reports")
    public ResponseEntity<?> getReport(@RequestHeader(name = "Authorization") String token,
                                       @PathVariable Long postId) {
        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new PostResponse<>(false, "로그인 정보를 확인할 수 없습니다.(토큰 만료 또는 이상)", null));
        }
        PostResponse<?> result = postService.getReport(user, postId);
        return ResponseEntity.ok(result);
    }

    /// 게시글 신고 취소하기 (한진호)
    @DeleteMapping(value = "/{postId}/reports")
    public ResponseEntity<?> removeReport(@RequestHeader(name = "Authorization") String token,
                                          @PathVariable Long postId) {
        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new PostResponse<>(false, "로그인 정보를 확인할 수 없습니다.(토큰 만료 또는 이상)", null));
        }
        PostResponse<?> result = postService.deleteReport(user, postId);
        return ResponseEntity.ok(result);
    }
}