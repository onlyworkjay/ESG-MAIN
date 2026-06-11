package com.project.esg.global.security;

import com.project.esg.users.vo.LoginUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.expire-hour}")
    private Integer expireHour;

    // SecretKey 생성을 공통 메서드로 분리하여 코드 중복 제거
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    // 새로 생성하는 토큰 로직
    public LoginUser createToken(Long userId, String loginId, String nickname, String email, String role, String profileImg, LocalDateTime createdAt) {

        SecretKey key = getSigningKey();

        Calendar calendar = Calendar.getInstance();
        Date startTime = calendar.getTime();

        calendar.add(Calendar.HOUR, expireHour);
        Date endTime = calendar.getTime();

        //회원가입일을 설정하는 로직
        //-> LoclaDateType인 경우 이대로 데이터베이스에서 저장을 하게 되면 문자열
        //-> 그대로 저장을 하게 된다. 따라서 자바에서는 이를 인식하지 못하고 그대로 null처리하게 된다.
        //-> 따라서 jwt에 LoclaDateType을 넣고 뺄때에는 가장 안전하게 String 형식으로 변환해서 다루거나, 타임스탬프로 다루는 것이 좋다.

        //1. 변수를 먼저 선언
        String createdAtStr;
        //2.만약 createdAt데이터가 null이 아니라면 (값이 존재한다면)
        if(createdAt != null){
            createdAtStr = createdAt.toString(); //문자열로 변환해서 저장
        }

        //3.만약 createdAt 데이터가 null이라면 (값이 비어있다면)
        else{
            createdAtStr ="";//빈문자열을 저장
        }


        String token = Jwts.builder()
                .issuedAt(startTime)
                .expiration(endTime)
                .signWith(key)
                .claim("userId", userId)
                .claim("loginId", loginId)
                .claim("nickname", nickname)
                .claim("email", email)
                .claim("role", role)
                .claim("profileImg", profileImg)
                .claim("createdAt", createdAtStr) //여기에서는 string으로 저장
                .compact();

        // 빌더 패턴 대용 혹은 깔끔한 데이터 세팅
        LoginUser login = new LoginUser();
        login.setToken(token);
        login.setUserId(userId);
        login.setLoginId(loginId);
        login.setNickname(nickname);
        login.setEmail(email);
        login.setRole(role);
        login.setProfileImg(profileImg);
        login.setEndTime(endTime.getTime());
        login.setCreatedAt(createdAt); //여기는 그대로 LocalDataTime으로 저장

        return login;
    }

    // 비교하고 검사하는 토큰 로직
    public LoginUser checkToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return null;
            }

            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            SecretKey key = getSigningKey();

            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // [치명적 에러 해결] 캐스팅 에러 방지를 위해 클래스 타입을 명시하여 안전하게 추출
            Long userId = claims.get("userId", Long.class);
            String loginId = claims.get("loginId", String.class);
            String nickname = claims.get("nickname", String.class);
            String email = claims.get("email", String.class);
            String role = claims.get("role", String.class);
            String profileImg = claims.get("profileImg", String.class);

            // String으로 안전하게 꺼낸 뒤 LocalDateTime으로 저장
            String createdAtStr = claims.get("createdAt", String.class);
            // --> 만약 회원가입일이 null 혹은 비어있는게 아닌 경우, 문자열 형태에서 다시 LocalDateTime으로 받아오게 하는 로직. 비어잇거나 null일 경우에는 null처리.
            LocalDateTime createdAt = (createdAtStr != null && !createdAtStr.isEmpty())? LocalDateTime.parse(createdAtStr): null;



            LoginUser login = new LoginUser();
            login.setUserId(userId);
            login.setLoginId(loginId);
            login.setNickname(nickname);
            login.setEmail(email);
            login.setRole(role);
            login.setProfileImg(profileImg);
            login.setToken(token);
            login.setCreatedAt(createdAt);


            if (claims.getExpiration() != null) {
                login.setEndTime(claims.getExpiration().getTime());
            }

            return login;

        } catch (ExpiredJwtException e) {
            System.out.println("토큰 만료됨: " + e.getMessage());
            // 컨트롤러나 필터에서 401 에러 처리를 유도할 수 있도록 설계 필요
            return null;
        } catch (JwtException e) {
            System.out.println("유효하지 않은 토큰 (위변조 등): " + e.getMessage());
            return null;
        } catch (Exception e) {
            System.out.println("토큰 검증 중 예상치 못한 에러 발생: " + e.getMessage());
            //어디서 터졌는지 추적하기 위해 StackTrace추가
            e.printStackTrace();
            return null;
        }
    }
}