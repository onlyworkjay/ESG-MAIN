package com.project.esg.global.util;

import com.project.esg.admin.service.AdminService;
import com.project.esg.global.security.JwtUtils;
import com.project.esg.master.service.MasterService;
import com.project.esg.users.vo.LoginUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
public class MasterInterceptor implements HandlerInterceptor {
    @Autowired
    private AdminService admin;
    @Autowired
    private JwtUtils jwt;
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response , Object handler) throws IOException {
        String token = request.getHeader("Authorization");

        if (StringUtils.hasText(token)&& token.startsWith("Bearer ")){
            String cutToken = token.substring(7);
            try{
                LoginUser login = jwt.checkToken(cutToken);
                if(login != null){
                    String loginId = login.getLoginId();
                    boolean roleCheck = (admin.getMemberRole(loginId)).equals(login.getRole());
                    System.out.println(roleCheck);
                    if(roleCheck && "master".equals(login.getRole())){
                        return true;
                    }
                }
            }
            catch(Exception err){
                System.out.println("최고 관리자 권한 검증 실패");
            }
        }
        response.setStatus(403);
        response.setContentType("text/plain;charset=UTF-8");//응답 형식이나 (여기서는)한글 인코딩을 브라우저/프론트가 정확히 해석하지 못해서
        response.getWriter().write("최종 관리자 권한 없음");
        return false;
    }
}
