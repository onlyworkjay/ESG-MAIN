package com.project.esg.post.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
/**
 * 게시글 목록 조회 시 페이징, 필터, 검색 조건을 한 번에 바인딩하는 DTO
 */
public class SearchDto {

    // 1. 페이징 관련 파라미터 (기본값 설정)
    private Integer page;           // 현재 페이지 번호 (백엔드 기준 0번부터 시작)
    private Integer naviSize;           // 한 페이지에 보여줄 게시글 개수

    // 2. 필터 및 정렬 관련 파라미터
    private String status;          // 게시글 상태 (예: 'active', 'deleted' 등)
    private Integer order;          // 정렬 기준 (기본값: 최신순 'latest', 좋아요순 'likes' 등)

    // 3. 검색 관련 파라미터
    private String searchType;      // 검색 조건 (예: 'title', 'content', 'writer')
    private String searchKeyword;   // 유저가 입력한 검색어

    // 4. 검색한 유저 정보
    private Long userId = 0L;       //비회원 기본값

    public int getOffset() {
        // 백엔드 page는 0부터 시작하므로 [현재페이지 * 페이지크기] 가 곧 시작 위치(Offset)가 됩니다.
        return this.page * this.naviSize;
    }
}