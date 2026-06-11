package com.project.esg.users.dto;


import com.project.esg.profile.dto.ProfileChoiceResponse;
import com.project.esg.profile.dto.ProfilePostResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
// 마이페이지에서 그대로 즐겨찾기 회원들의 정보를 끌어오기 위한 바구니 만들기
public class UserFavoriteListResponse {
    // 1. 즐겨찾기 자체 정보
    private Long targetUserId;
    private String description;
    private String createdAt;

    // 2. 타겟 유저의 프로필 메인 정보
    private String nickname;
    private String profileImg;
    private String status;

    // 3. 타겟 유저의 활동 정보 (상세 모달용)
    private List<ProfilePostResponse> posts;
    private List<ProfileChoiceResponse> choices;
}
