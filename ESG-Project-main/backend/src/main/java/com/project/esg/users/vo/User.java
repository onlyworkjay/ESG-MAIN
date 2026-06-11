package com.project.esg.users.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value = "user")

public class User {
    private Long userId; //회원 식별자 --> 여기에서의 userId는 null
    private String loginId; // 로그인 아이디
    private String password; // 로그인 비밀번호
    private String nickname; // 닉네임
    private String email; //이메일
    private String status; //회원 상태
    private String role; // 회원 권한
    private String suspensionReason; // 정지사유
    private LocalDateTime createdAt; // 가입일
    private LocalDateTime updatedAt; // 수정일
    private LocalDateTime deletedAt; // 탈퇴일
    private String profileImg = "https://esg-project-site.s3.ap-northeast-2.amazonaws.com/profile_images/user_default.png"; //프로필 이미지


}
