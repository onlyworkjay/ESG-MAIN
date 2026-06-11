package com.project.esg.users.controller;


import com.project.esg.global.security.JwtUtils;
import com.project.esg.users.service.UserService;
import com.project.esg.users.vo.LoginUser;
import com.project.esg.users.vo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//JWT토큰 인증을 받기 위한 로직
@RestController
@RequestMapping(value = "/auth")
public class AuthController {
   @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserService userService;

    //토큰 과는 별도로 헤더에 저장해놓고 서버에 맞춰 계속 업데이트할 변수값 저장 로직 설정
    //-> 헷갈리면 안되는게 이 로직은 로그인 직후에 저장된 zustand의 데이터값을 계속 유지시켜주는 역할이다.
    //-> 따라서 이 기능이 망가지면 로그인 떄 아무리 정보를 가져와도 새로고침할 떄마다 새로운 정보가 유지되지 않고 날아가 버린다.

     @GetMapping(value = "/me")
    public ResponseEntity<?> authMe(@RequestHeader("Authorization") String authorization){
         //  방어 조치: "Bearer " 공백까지 지우고, trim()으로 앞뒤 미세 공백까지 완벽 차단!
         //리액트에서 요청을 보낼 때 헤더에 "Bearer eyJhbG..." 형태로 Bearer와 토큰 사이에 공백 한 칸을 넣어서 보냄
         //-> 그런데 내가 이번에 String token = authorization.replace("Bearer",""); 이런 형식으로 짰음
         //-> "Bearer "를 지운 게 아니라 공백 없이 "Bearer"만 지웠기 때문에, 앞의 문자열은 날아가도 중간에 있던 공백 한 칸( )이 토큰 맨 앞에 그대로 살아남아  CheckToken(" eyJhbG...") 형태로 유입
         //-> 따라서 JJWT가 공백 에러를 뱉고 null을 반환, 그래서 trim을 사용
        String token = authorization.replace("Bearer","").trim();
        LoginUser u = jwtUtils.checkToken(token);
         User user = userService.selectOneUserById(u.getUserId());
         return   ResponseEntity.ok(user);
    }


}
