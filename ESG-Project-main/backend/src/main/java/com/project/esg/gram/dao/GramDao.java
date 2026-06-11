// 담당자: 장지혁

package com.project.esg.gram.dao;

import com.project.esg.gram.vo.Gram;
import com.project.esg.gram.vo.GramListItem;
import com.project.esg.gram.vo.GramReportResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface GramDao {
    Integer selectProductIdByChoiceId(Integer choiceId);

    void deleteLikesByGramId(Integer gramId);

    void deleteReportsByGramId(Integer gramId);

    Integer selectGramCount(GramListItem request);

    List<Gram> selectGramList(GramListItem request);

    int insertGram(Gram gram); // 후기 작성

    int countTodayGrams(@Param("userId") Integer userId); // 하루 후기 작성 개수 조회

    int countActiveGramByChoiceIdAndUserId(
            @Param("choiceId") Integer choiceId,
            @Param("userId") Integer userId
    );

    Gram selectOneGram(Integer gramNo); // 후기 상세보기

    int updateViewCount(int gramNo); // 조회수 증가

    int updateGram(Gram gram); // 후기 수정

    int deleteGram(Integer gramNo); // 후기 삭제

    int deleteGramFiles(Integer gramId); // 후기 파일 삭제

    List<String> selectGramImages(Integer gramId); // 이미지 조회

    int insertGramFile(@Param("fileName") String fileName,
                       @Param("filePath") String filePath,
                       @Param("gramId") Integer gramId); // 파일 등록

    // 좋아요 추가
    int insertLike(@Param("userId") Integer userId, @Param("gramId") Integer gramId);

    // 좋아요 취소
    int deleteLike(@Param("userId") Integer userId, @Param("gramId") Integer gramId);

    // 좋아요 여부 확인
    int selectLikeExists(@Param("userId") Integer userId, @Param("gramId") Integer gramId);

    // 좋아요 수 조회
    int selectLikeCount(@Param("gramId") Integer gramId);

    // 후기 신고
    int insertReport(@Param("userId") Integer userId,
                     @Param("gramId") Integer gramId,
                     @Param("reason") String reason);


    // 신고 존재
    int selectReportExists(@Param("userId") Integer userId,
                           @Param("gramId") Integer gramId);
                           
    // 특정 유저의 신고 내역 조회(김경호)
    List<GramReportResponse> selectUserReports( Integer userId);


    // 댓글 관련
    List<Map<String, Object>> selectComments(@Param("gramId") Integer gramId); // 댓글 목록

    int insertComment(@Param("content") String content,
                      @Param("gramId") Integer gramId,
                      @Param("writerId") Integer writerId, // 댓글 등록
    @Param("parentNo") Integer parentNo); // 부모

    int updateComment(@Param("commentNo") Integer commentNo,
                      @Param("content") String content); // 댓글 수정

    int deleteComment(@Param("commentNo") Integer commentNo); // 댓글 삭제

    int deleteCommentsByGramId(@Param("gramId") Integer gramId); // 후기 삭제 시 댓글 일괄 삭제

    List<Gram> selectMyGramList(GramListItem request);

    int deleteGramFileByS3Key(String s3Key);

    Map<String, Object> selectChoiceForCheck(Integer choiceId);

    int updateGramWritten(Integer choiceId);

    int expireOldGrams();
}
