package com.project.esg.users.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//관리자 전용 로그인페이지에서 데이터를 받아오면 보안적인 설정을 추가하는 것
//즉 관리자 로그인 요청에서 필요한 데이터만 받기
//-> 그렇게 하는 이유는 user에 등록된 모든 데이터를 받아올 필요가 없기 때문. 따라서 필요한 것만 받아옴으로 효율적으로 운용
//-> 게다가 관리자 로직만 따로 관리함으로 분리가 잘됨.
@NoArgsConstructor
@AllArgsConstructor
@Data
public class AdminLoginRequest {
    private String loginId;
    private String password;
}
