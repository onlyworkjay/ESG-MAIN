/* 담당자: 장지혁 */

package com.project.esg.gram.controller;

import com.project.esg.gram.service.GramService;
import com.project.esg.gram.vo.Gram;
import com.project.esg.gram.vo.GramListItem;
import com.project.esg.gram.vo.GramListResponse;
import com.project.esg.gram.vo.GramReportResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@CrossOrigin(value = "*")
@RequestMapping(value = "/grams")
@RestController
public class GramController {
    @Autowired
    private GramService gramService;

    @GetMapping // 후기 게시글 목록
    public ResponseEntity<?> selectGramList(@ModelAttribute GramListItem request) {
        GramListResponse response = gramService.selectGramList(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/choices/{choiceId}/written")
    public ResponseEntity<?> hasWrittenChoiceReview(
            @PathVariable Integer choiceId,
            @RequestParam Integer userId) {
        boolean written = gramService.hasWrittenChoiceReview(choiceId, userId);
        return ResponseEntity.ok(Map.of("written", written));
    }

    //마이페이지에서 전체 후기 게시글 중 내가 작성한 게시글만 가져오기(김경호)
    @GetMapping(value = "/my-grams")
    public ResponseEntity<?> selectMyGramList(@ModelAttribute GramListItem request) {
        //마이페이지 전용 서비스 호충 로직
        GramListResponse response = gramService.selectMyGramList(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> insertGram(
            @ModelAttribute Gram gram,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        try {
            int result = gramService.insertGram(gram, files);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(error.getMessage());
        } catch (RuntimeException error) {
            return ResponseEntity.internalServerError().body(error.getMessage());
        }
    }

// 후기 등록
   @GetMapping(value = "/{gramNo}")
public ResponseEntity<?> selectOneGram(
        @PathVariable Integer gramNo,
        @RequestParam(value = "skipView", required = false, defaultValue = "false") boolean skipView) {

    Gram gram = gramService.selectOneGram(gramNo, skipView);
    return ResponseEntity.ok(gram);
}

    // 후기 수정하기
    @PutMapping(value = "/{gramNo}")
    public ResponseEntity<?> updateGram(
            @PathVariable Integer gramNo,
            @ModelAttribute Gram gram,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "deleteS3Keys", required = false) List<String> deleteS3Keys) {
        gram.setGramId(gramNo);
        gram.setDeleteS3Keys(deleteS3Keys);
        int result = gramService.updateGram(gram, files);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping(value = "/{gramNo}") // 후기 삭제하기
    public ResponseEntity<?> deleteGram(@PathVariable Integer gramNo) {
        int result = gramService.deleteGram(gramNo);
        return ResponseEntity.ok(result);
    }

    // 좋아요 토글
    @PostMapping(value = "/{gramId}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Integer gramId,
                                        @RequestBody Map<String, Object> body) {
        Integer userId = ((Number) body.get("userId")).intValue();
        return ResponseEntity.ok(gramService.toggleLike(userId, gramId));
    }

    // 좋아요 상태 조회
    @GetMapping(value = "/{gramId}/like")
    public ResponseEntity<?> getLikeStatus(@PathVariable Integer gramId,
                                           @RequestParam(required = false) Integer userId) {
        return ResponseEntity.ok(gramService.getLikeStatus(userId, gramId));
    }

    // 신고 등록
    @PostMapping(value = "/{gramId}/report")
    public ResponseEntity<?> insertReport(@PathVariable Integer gramId,
                                          @RequestBody Map<String, Object> body) {
        try {
            Integer userId = ((Number) body.get("userId")).intValue();
            String reason = (String) body.get("reason");
            int result = gramService.insertReport(userId, gramId, reason);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    // // 마이페이지 특정 유저의 신고 내역 조회 API(김경호)
    //-> @PathVariable을 쓸 때는  $을 넣지 않도록 주의
    @GetMapping(value = "/reports/user/{userId}")
    public ResponseEntity<?> getUserReports(@PathVariable Integer userId) {
        // 서비스 메서드를 호출하여 해당 유저의 신고 리스트를 가져오기
        List<GramReportResponse> list = gramService.selectUserReports(userId);
        // 프론트엔드에게 성공(200 OK) 상태와 함께 데이터를 리턴
        return ResponseEntity.ok(list);
    }


    // 댓글 목록 조회
    @GetMapping(value = "/{gramId}/comments")
    public ResponseEntity<?> selectComments(@PathVariable Integer gramId) {
        return ResponseEntity.ok(gramService.selectComments(gramId));
    }

    // 댓글 등록
    @PostMapping(value = "/{gramId}/comments")
    public ResponseEntity<?> insertComment(@PathVariable Integer gramId,
                                           @RequestBody Map<String, Object> body) {
        String content = (String) body.get("content");
        Integer writerId = (Integer) body.get("writerId");
        Integer parentNo = body.get("parentNo") != null ? ((Number) body.get("parentNo")).intValue() : null;
        int result = gramService.insertComment(content, gramId, writerId, parentNo);
        return ResponseEntity.ok(result);
    }

    // 댓글 수정
    @PutMapping(value = "/{gramId}/comments/{commentNo}")
    public ResponseEntity<?> updateComment(@PathVariable Integer commentNo,
                                           @RequestBody Map<String, Object> body) {
        String content = (String) body.get("content");
        int result = gramService.updateComment(commentNo, content);
        return ResponseEntity.ok(result);
    }

    // 댓글 삭제
    @DeleteMapping(value = "/{gramId}/comments/{commentNo}")
    public ResponseEntity<?> deleteComment(@PathVariable Integer commentNo) {
        int result = gramService.deleteComment(commentNo);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/check/{choiceId}")
    public ResponseEntity<?> checkWritable(
            @PathVariable Integer choiceId,
            @RequestParam Integer userId) {
        gramService.checkWritable(choiceId, userId);
        return ResponseEntity.ok().build();
    }
}
