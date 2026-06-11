package com.project.esg.global.util;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

@Component
public class CookieUtils {
    // 쿠키조회
    public boolean alreadyViewed(HttpServletRequest request, long postId) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return false;
        }

        for (Cookie c : cookies) {
            if (c.getName().equals("view_" + postId)) {
                return true;
            }
        }
        return false;
    }

    // 쿠키생성
    public void createCookie(HttpServletResponse response, long postId, int cookieTime) {
        Cookie cookie = new Cookie("view_" + postId, "true");
        cookie.setMaxAge(cookieTime);
        cookie.setPath("/");
        response.addCookie(cookie);
    }
}
