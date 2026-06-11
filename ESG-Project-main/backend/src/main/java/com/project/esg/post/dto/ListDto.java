package com.project.esg.post.dto;

import com.project.esg.post.vo.Post;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
/**
 * 게시글 목록 조회 시 페이징, 필터, 검색 조건을 한 번에 바인딩하는 DTO
 * 서버 -> 프론트 전용
 */
public class ListDto {
    private List<Post> posts;
    private List<Post> notices;
    private Long totalPage;

}