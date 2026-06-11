package com.project.esg.global.util;

import com.project.esg.global.security.JwtUtils;
import com.project.esg.users.service.UserService;
import com.project.esg.users.vo.LoginUser;
import com.project.esg.users.vo.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
public class UserInterceptor implements HandlerInterceptor {
    @Autowired
    private JwtUtils utils;
    @Autowired
    private UserService service;
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,Object handler) throws IOException {
        String token = request.getHeader("Authorization");
        if(token == null){
            return true;
        }
        //경호씨가 앞에 Bearer 붙임
        if (StringUtils.hasText(token)&& token.startsWith("Bearer ")){
            String cutToken = token.substring(7);
            try{
                LoginUser login = utils.checkToken(cutToken);
                if(login != null){
                    String loginId = login.getLoginId();
                    User check = service.userCheckStatus(loginId);
                    if(check.getStatus().equals("suspended")){
//                        String suspensionReason = check.getSuspensionReason();
                        response.setStatus(403);
                        response.setContentType("text/plain;charset=UTF-8");
                        response.getWriter().write("정지된 회원입니다.");
                        return false;
                    }
                    if (check.getStatus().equals("deleted")){
                        response.setStatus(403);
                        response.setContentType("text/plain;charset=UTF-8");
                        response.getWriter().write("이미 탈퇴한 회원입니다.");
                        return false;
                    }
                }
                    return true;
            }
            catch(Exception err){//Bearer 붙고 토큰 망가졌을때 처리
                response.setStatus(401);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("유효하지 않은 토큰입니다.");
                return false;
            }
        }
//
        return true;
    }
}
