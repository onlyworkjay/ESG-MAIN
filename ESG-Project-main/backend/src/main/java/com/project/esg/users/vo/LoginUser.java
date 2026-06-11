package com.project.esg.users.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
// 토큰 즉 출입증에 담길 정보 목록 클래스 생성
public class LoginUser {
    private Long userId;
    private String loginId;
    private String nickname;
    private String email;
    private String role;
    private Long endTime;
    private String token;
    private String profileImg;
    private LocalDateTime createdAt;
}
