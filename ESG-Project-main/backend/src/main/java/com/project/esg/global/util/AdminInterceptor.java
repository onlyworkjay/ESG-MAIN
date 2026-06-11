package com.project.esg.global.util;

import com.project.esg.admin.service.AdminService;
import com.project.esg.global.security.JwtUtils;
import com.project.esg.users.vo.LoginUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
public class AdminInterceptor implements HandlerInterceptor {
    @Autowired
    private JwtUtils jwt;

    @Autowired
    private AdminService service;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        System.out.println("start Interceptor");

        //1.Authorization Bearer 형태의 토큰을 꺼내옴(request가 보낸 요청의 전문을 가지고 있음)
        String token = request.getHeader("Authorization");

        //2. 빈토큰 및 Bearer로 시작여부 확인
        if(StringUtils.hasText(token)//공백("   "){hasLength도 있는데, 공백 안거름},null등을 검사하는 메소드
            && token.startsWith("Bearer ")//앞에 Bearer 하고 스페이스 붙었는지
        )
        {
            //Bearer 짤라내기(스페이스 포함해서 7)
            String cutToken = token.substring(7);
            try{
                LoginUser login = jwt.checkToken(cutToken);
                if(login != null){

                    String loginId = login.getLoginId();

                    boolean roleCheck = (service.getMemberRole(loginId)).equals(login.getRole());//status 검사 필요

//                    System.out.println(roleCheck);

                    if(roleCheck && "admin".equals(login.getRole())/*login.getRole().equals("ADMIN") null들어오면 걸림...*/){
                        return true;
                    }
                }
            }
            catch(Exception err){
                System.out.println("관리자 토큰 검증 실패");
            }
       }
       response.setStatus(403);
        response.setContentType("text/plain;charset=UTF-8");//응답 형식이나 (여기서는)한글 인코딩을 브라우저/프론트가 정확히 해석하지 못해서
       response.getWriter().write("관리자 권한 없음");
        return false;//excpetion 부분 차후 해결
    }
}
