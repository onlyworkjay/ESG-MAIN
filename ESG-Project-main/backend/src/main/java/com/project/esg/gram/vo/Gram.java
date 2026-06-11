// 담당자: 장지혁

package com.project.esg.gram.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value="gram")

public class Gram {
    private Integer gramId;         // 글번호
    private Integer choiceId;       // 선택 아이디
    private Integer userId;         // 작성자
    private String nickname;
    private Integer productId;      // 상품 아이디
    private String title;           // 제목
    private String content;         // 내용
    private String status;          // 상태
    private String createdAt;       // 작성일
    private String updatedAt;       // 수정일
    private String deletedAt;       // 삭제일
    private String profileImg; // 작성자 프로필 이미지
    private List<String> images; // 이미지 경로 목록
    private Integer likeCount;  // 좋아요 수
    private Boolean liked;
    private Integer commentCount; // 댓글 수
    private String brandName;    // 브랜드명
    private String productName;  // 제품명
    private Integer viewCount; // 조회수
    private List<String> deleteS3Keys;
}
