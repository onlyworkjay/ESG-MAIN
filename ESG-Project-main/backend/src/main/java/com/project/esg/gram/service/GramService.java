/* 담당자: 장지혁 */

package com.project.esg.gram.service;

import com.project.esg.global.util.FileUtils;
import com.project.esg.gram.dao.GramDao;
import com.project.esg.gram.vo.Gram;
import com.project.esg.gram.vo.GramListItem;
import com.project.esg.gram.vo.GramListResponse;
import com.project.esg.gram.vo.GramReportResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GramService {
    private static final int DAILY_GRAM_LIMIT = 3;

    @Autowired
    private GramDao gramDao;

    @Autowired
    private FileUtils fileUtil;

    public GramListResponse selectGramList(GramListItem request) {
        int offset = (request.getPage() - 1) * request.getSize();
        request.setOffset(offset);

        Integer totalCount = gramDao.selectGramCount(request);
        int totalPage = (int) Math.ceil(totalCount / (double) request.getSize());

        List<Gram> list = gramDao.selectGramList(request);

        // ✅ 이미지 S3 키 → URL 변환
        for (Gram gram : list) {
            if (gram.getImages() != null && !gram.getImages().isEmpty()) {
                List<String> urls = gram.getImages().stream()
                        .map(key -> fileUtil.getFileUrl(key))
                        .collect(Collectors.toList());
                gram.setImages(urls);
            }
        }

        return new GramListResponse(list, totalPage);
    }


    //마이페이지에서 후기 게시글이 뜨도록 하는 로직 구성 (김경호)
    public GramListResponse selectMyGramList(GramListItem request) {
        // 지혁씨가 만든 GramListResponse라는 클래스가
        // "내가 응답 데이터를 줄 때는 무조건 글 목록 리스트(list)랑 전체 페이지 수(totalPage)를
        // 세트로 묶어서 반환할 거야!"라고 아주 단단하게 규칙을 정해놨기 때문에 아래 코드 추가

        int offset = (request.getPage() - 1) * request.getSize();
        request.setOffset(offset);

        // 내 글 개수만 세는 카운트 쿼리가 따로 없다면, 우선 전체 카운트를 쓰거나
        // 임시로 totalCount 처리를 위해 지혁님 dao를 재사용하되, 리스트는 무조건 '내 글'만 가져옵니다.
        Integer totalCount = gramDao.selectGramCount(request);
        int totalPage = (int) Math.ceil(totalCount / (double) request.getSize());

        // 새로 만든 마이페이지 전용 DAO 호출!
        List<Gram> list = gramDao.selectMyGramList(request);

        // 이미지 S3 키 → URL 변환 (지혁씨 기존 로직 그대로 유지)
        for (Gram gram : list) {
            if (gram.getImages() != null && !gram.getImages().isEmpty()) {
                List<String> urls = gram.getImages().stream()
                        .map(key -> fileUtil.getFileUrl(key))
                        .collect(Collectors.toList());
                gram.setImages(urls);
            }
        }

        return new GramListResponse(list, totalPage);
    }

    @Transactional
    public int insertGram(Gram gram, List<MultipartFile> files) {
        checkWritable(gram.getChoiceId(), gram.getUserId());
        validateDailyGramLimit(gram);

        // choiceId로 productId 조회해서 gram에 세팅
        Integer productId = gramDao.selectProductIdByChoiceId(gram.getChoiceId());
        if (productId == null) {
            throw new IllegalArgumentException("선택한 메뉴 정보를 찾을 수 없습니다.");
        }
        gram.setProductId(productId);

        int result = gramDao.insertGram(gram);
        if (result <= 0) {
            throw new RuntimeException("후기 등록에 실패했습니다.");
        }

        Integer gramId = gram.getGramId();

        List<String> s3Keys = new ArrayList<>();
        int insertFile = 0;
        int insertFileDb = 0;

        if (files != null && !files.isEmpty()) {
            String fileRepo = "grams/" + gramId;
            try {
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        insertFile++;
                        String originalFileName = file.getOriginalFilename();
                        String s3Key = fileUtil.uploadReviewImage(file, fileRepo);
                        s3Keys.add(s3Key);
                        insertFileDb += gramDao.insertGramFile(originalFileName, s3Key, gramId);
                    }
                }
            } catch (Exception e) {
                for (String key : s3Keys) {
                    fileUtil.delete(key);
                }
                throw new RuntimeException("파일 업로드 중 오류 발생");
            }
        }

        if (insertFile != insertFileDb) {
            for (String key : s3Keys) {
                fileUtil.delete(key);
            }
            throw new RuntimeException("일부 파일 정보가 DB에 정상적으로 등록되지 않았습니다.");
        }
        gramDao.updateGramWritten(gram.getChoiceId()); // gram_written 0 → 1

        return result;
    }

    private void validateDailyGramLimit(Gram gram) {
        if (gram.getUserId() == null) {
            throw new IllegalArgumentException("후기 작성 회원 정보가 필요합니다.");
        }
        int todayGramCount = gramDao.countTodayGrams(gram.getUserId());
        if (todayGramCount >= DAILY_GRAM_LIMIT) {
            throw new IllegalArgumentException("하루 후기는 최대 3번까지 작성할 수 있습니다.");
        }
    }

    public boolean hasWrittenChoiceReview(Integer choiceId, Integer userId) {
        if (choiceId == null || userId == null) {
            throw new IllegalArgumentException("선택 기록과 회원 정보가 필요합니다.");
        }

        return gramDao.countActiveGramByChoiceIdAndUserId(choiceId, userId) > 0;
    }

  public Gram selectOneGram(int gramNo, boolean skipView) {
    Gram gram = gramDao.selectOneGram(gramNo);

    if (!skipView) {
        gramDao.updateViewCount(gramNo);
    }

    if (gram != null && gram.getImages() != null && !gram.getImages().isEmpty()) {
        List<String> urls = gram.getImages().stream()
                .map(key -> fileUtil.getFileUrl(key))
                .collect(Collectors.toList());
        gram.setImages(urls);
    }
    return gram;
}

    // 후기 수정하기
    @Transactional
    public int updateGram(Gram gram, List<MultipartFile> files) {
        int result = gramDao.updateGram(gram);

        // ✅ 삭제할 S3 파일 처리
        if (gram.getDeleteS3Keys() != null && !gram.getDeleteS3Keys().isEmpty()) {
            for (String s3Key : gram.getDeleteS3Keys()) {
                fileUtil.delete(s3Key);
                gramDao.deleteGramFileByS3Key(s3Key);
            }
        }

        if (files != null && !files.isEmpty()) {
            String fileRepo = "grams/" + gram.getGramId();
            try {
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        String originalFileName = file.getOriginalFilename();
                        String s3Key = fileUtil.uploadReviewImage(file, fileRepo);
                        gramDao.insertGramFile(originalFileName, s3Key, gram.getGramId());
                    }
                }
            } catch (IOException e) {
                throw new RuntimeException("파일 업로드 중 오류 발생");
            }
        }

        return result;
    }

    @Transactional
    public int deleteGram(Integer gramNo) {
        // ✅ 댓글 → 파일 → 후기 순서로 삭제 (외래키 제약 때문에 순서 중요)
        gramDao.deleteCommentsByGramId(gramNo);
        gramDao.deleteLikesByGramId(gramNo);
        gramDao.deleteReportsByGramId(gramNo);
        gramDao.deleteGramFiles(gramNo);
        return gramDao.deleteGram(gramNo);
    }

    // 좋아요 토글
    public Map<String, Object> toggleLike(Integer userId, Integer gramId) {
        int exists = gramDao.selectLikeExists(userId, gramId);
        if (exists > 0) {
            gramDao.deleteLike(userId, gramId);
        } else {
            gramDao.insertLike(userId, gramId);
        }
        int count = gramDao.selectLikeCount(gramId);
        boolean liked = gramDao.selectLikeExists(userId, gramId) > 0;
        return Map.of("liked", liked, "likeCount", count);
    }

    // 좋아요 상태 조회
    public Map<String, Object> getLikeStatus(Integer userId, Integer gramId) {
        int count = gramDao.selectLikeCount(gramId);
        boolean liked = userId != null && gramDao.selectLikeExists(userId, gramId) > 0;
        return Map.of("liked", liked, "likeCount", count);
    }

    // 신고하기
    public int insertReport(Integer userId, Integer gramId, String reason) {
        int exists = gramDao.selectReportExists(userId, gramId);
        if (exists > 0) {
            throw new IllegalArgumentException("이미 신고한 후기입니다.");
        }
        return gramDao.insertReport(userId, gramId, reason);
    }

    //신고한 이후 마이페이지에 표시하기 (김경호)
    public List<GramReportResponse> selectUserReports(Integer userId) {
        // DAO를 호출하여 DB에서 신고 내역 리스트를 받아옵니다.
        List<GramReportResponse> reportList = gramDao.selectUserReports(userId);
        return reportList;
    }


    // 댓글 목록 조회
    public List<Map<String, Object>> selectComments(Integer gramId) {
        return gramDao.selectComments(gramId);
    }

    // 댓글 등록
    public int insertComment(String content, Integer gramId, Integer writerId, Integer parentNo) {
        return gramDao.insertComment(content, gramId, writerId, parentNo);
    }

    // 댓글 수정
    public int updateComment(Integer commentNo, String content) {
        return gramDao.updateComment(commentNo, content);
    }

    // 댓글 삭제
    public int deleteComment(Integer commentNo) {
        return gramDao.deleteComment(commentNo);
    }

    public void checkWritable(Integer choiceId, Integer userId) {
        if (choiceId == null || userId == null) {
            throw new IllegalArgumentException("선택 기록과 회원 정보가 필요합니다.");
        }

        Map<String, Object> choice = gramDao.selectChoiceForCheck(choiceId);

        if (choice == null) {
            throw new IllegalArgumentException("유효하지 않은 choiceId입니다.");
        }

        // 조건 2: userId 검증
        Integer dbUserId = toInteger(choice.get("user_id"));
        if (dbUserId == null || !dbUserId.equals(userId)) {
            throw new IllegalArgumentException("본인의 선택 내역이 아닙니다.");
        }

        // 조건 4: is_selected = 1
        Integer isSelected = toInteger(choice.get("is_selected"));
        if (isSelected == null || isSelected != 1) {
            throw new IllegalArgumentException("선택되지 않은 항목입니다.");
        }

        // 조건 3: gram_written = 0
        Integer gramWritten = toInteger(choice.get("gram_written"));
        if (gramWritten == null || gramWritten != 0) {
            throw new IllegalArgumentException("이미 후기를 작성하셨습니다.");
        }

        // 조건 1: expires_at > 현재 시간
        LocalDateTime expiry = toLocalDateTime(choice.get("expires_at"));
        if (expiry == null) {
            throw new IllegalArgumentException("유효시간 정보가 없습니다.");
        }
        if (expiry.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("후기 작성 가능 시간이 만료되었습니다.");
        }
    }

    private Integer toInteger(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.intValue();
        }

        if (value instanceof Boolean bool) {
            return bool ? 1 : 0;
        }

        String str = value.toString();

        if ("true".equalsIgnoreCase(str)) {
            return 1;
        }

        if ("false".equalsIgnoreCase(str)) {
            return 0;
        }

        return Integer.parseInt(str);
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDateTime dateTime) {
            return dateTime;
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        return LocalDateTime.parse(value.toString().replace(" ", "T"));
    }
}
