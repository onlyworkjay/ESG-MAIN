package com.project.esg.users.controller;

import com.project.esg.global.util.EmailSender;
import com.project.esg.users.service.UserService;
import com.project.esg.users.vo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Random;
import java.util.regex.Pattern;

@CrossOrigin("*")
@RestController
@RequestMapping(value = "users")
//이메일 로직을 따로 만든 이유. 일반 회원가입로직에서는 이메일 인증이 없기 떄문에
//-> 그냥 userController쪽에서 처리하고
//-> 이메일 인증 로직을 따로 만들어 처리.
public class MailController {
    //1. 이메일 정규식 패턴을 클래스 상수로 선언
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    @Autowired
    public UserService userService;

    @Autowired
    public EmailSender sender;

    //회원가입에서 이메일 가입을 원할 떄 쓰는 인증방식 로직 (김경호)
    @PostMapping(value = "/email-verification")
    public ResponseEntity<?> sendMail(@RequestBody User u) {
        //2. 이메일 형식 1차 검증 수행
        String userEmail = u.getEmail();
        if (userEmail == null || userEmail.trim().isEmpty()) {
            //형식이 올바르지 않으면 400bad 리퀘스트와 함꼐 에러 메세지 변환
            return ResponseEntity.badRequest().body("올바르지 않은 이메일 형식입니다.");
        }

        //3. 검증 통과후 기존 메일 발송 로직 진행
        String emailTitle = "ESG 사이트 인증 메일입니다.";

        Random r = new Random();
        StringBuffer sb = new StringBuffer();

        //오직 숫자(0-9)로만 6자리 생성
        for(int i = 0; i<6; i++){
            int randomCode = r.nextInt(10);
            //기존 문자열과 섞던 방식에서 숫자 로직만 넣기
            sb.append(randomCode);
        }
        String authCode = sb.toString();
        String emailContent = "<h3>인증번호는 [<b>" + authCode + "</b>] 입니다.</h3>";

        //기존 u.getEmail() 또는 m.getMemberEmail()에 맞게 매개변수 확인 필요
        sender.sendMail(emailTitle, u.getEmail(),emailContent);
        return  ResponseEntity.ok(authCode);

    }



}
