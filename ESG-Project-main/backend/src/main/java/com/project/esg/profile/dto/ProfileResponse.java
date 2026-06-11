package com.project.esg.profile.dto;

import com.project.esg.post.vo.Post;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 프론트에서 프로필 조회 요청시 주고받는 객체입니다

 */
@AllArgsConstructor
@NoArgsConstructor
@Data


public class ProfileResponse {
    private Long userId; //회원 식별자 --> 여기에서의 userId는 null
    private String nickname; // 닉네임
    private String status; //회원 상태
    private String role; // 회원 권한
    private LocalDateTime createdAt; // 가입일
    private String profileImg;


    private boolean isLogin = false;
    private boolean isMe = false;

    private List<?> post; //작성글
    private List<?> gram; //후기
    private List<?> choice; //최근선택한메뉴


    private Long requestId;
    private boolean isFavorite = false;
    private boolean isReported = false;


}
