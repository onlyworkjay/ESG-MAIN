package com.project.esg.post.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value = "post")

public class Post {
    private Long postId;
    private Long isNotice;
    private Long userId;
    private String title;
    private String content;
    private String status;
    private Long viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    /**
     * 게시글 상세 조회시 users 테이블의 nickname 매핑
     */
    private String writer;

    /**
     * 게시글 상세 조회시 post_files 테이블의 s3_key 목록 매핑
     */
    private List<String> s3keys;

    /**
     * 게시글 상세 조회시 post_likes 테이블의 총 개수 매핑
     */
    private Long likeCount;

    /**
     * 게시글 목록 조회시 로그인한 사용자가 이 게시글에 좋아요를 눌렀는지 여부
     */
    private Boolean isLike;

}
