package com.project.esg.users.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
// 이 클래스를 만든 목적. 보안을 위해 만듬. 지금 현재 로그인을 하면 비밀번호를 포함한 모든 정보를 리엑트로 모두 보내주고 있음
//-> 그렇게 되면 리엑트로 비밀번호도 넘어가게 되면서 보안적인 면에서 취약성을 보임.
//-> 따라서 그런 점을 방지하기 위해 비밀번호를 비롯한 중요 정보의 노출을 없애고 그외에 정보만 넘기는 로직.
public class UserResponse {
    private String loginId;
    private String nickname;
    private String email;
    private String role;
    private String profileImg;
    private Long userId;
    private String token;
    private Long endTime;
    private LocalDateTime createdAt;



}
