package com.project.esg.users.controller;


import com.project.esg.global.config.S3Config;
import com.project.esg.global.security.JwtUtils;
import com.project.esg.global.util.EmailSender;
import com.project.esg.post.dto.PostResponse;
import com.project.esg.post.service.PostService;
import com.project.esg.post.vo.Post;
import com.project.esg.users.dao.UserDao;
import com.project.esg.users.dto.AdminLoginRequest;
import com.project.esg.users.dto.UserFavoriteListResponse;
import com.project.esg.users.dto.UserResponse;
import com.project.esg.users.service.UserService;
import com.project.esg.users.vo.LoginUser;
import com.project.esg.users.vo.User;
import jakarta.mail.Multipart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@CrossOrigin("*")
@RestController
@RequestMapping(value = "/users")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtil;

    @Autowired
    private PostService postService;

    //4. 이메일 형식 검사 -> static이 쓰이는 경우 메서드 안이 아닌 클래스 내부에서 정의가 되어야 함
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    @Autowired
    private EmailSender emailSender;
    @Autowired
    private UserDao userDao;


    //회원가입(김경호)
    @PostMapping(value = "/join")
    public ResponseEntity<?> join(@RequestBody User user) {

        //1. 이메일 꺼내기
        String email = user.getEmail();
        //2. 이메일이 없거나 공백만 입력된 경우  null처리
        if (email == null || email.trim().isEmpty()) {
            user.setEmail(null);
        } else {
            //3. 이메일 앞뒤 공백 제거
            email = email.trim();

            //4. 이메일 형식 검사
            if (!EMAIL_PATTERN.matcher(email).matches()) {
                return ResponseEntity.badRequest().body("올바르지 않은 이메일 형식입니다.");
            }

            //5. 이메일 중복 검사
            int emailCount = userService.checkEmail(email);

            if (emailCount > 0) {
                return ResponseEntity.badRequest().body("이미 사용중인 이메일입니다.");
            }

        }

        //5. 정리된 이메일을 user 객체에 다시 저장
        user.setEmail(email);

        int result = userService.insertUser(user);

        if (result == 1) {
            return ResponseEntity.ok("회원가입 성공입니다.");
        } else {
            return ResponseEntity.ok("회원가입 실패입니다.");
        }
    }

    //아이디 중복 체크 로직(김경호)
    @GetMapping(value = "/check-id")
    public ResponseEntity<?> dupCheckId(@RequestParam String loginId) {
        User u = userService.selectOneLoginId(loginId);
        return ResponseEntity.ok(u != null);
    }

    //아이디 찾기 설정 (김경호)
    @PostMapping(value = "/find-id")
    public ResponseEntity<?> findId(@RequestBody User user) {
        // 아이디 하나로 회원 전체 정보를 가져오는게 아니기떄문에
        // 여기서는 이메일 인증을 통해 아이디 하나만을 조회하는 것이기 떄문에
        // String loginId로 처리
        //-> 그외에 추가하길 원한다면 service로직에서 추가해야할 변수 타입과 변수명을 적어주면 된다.
        //-> email, nickname 일치 검사는 mapper에서 하면 되기 떄문에, 컨트롤러에서는 결과만 받아서 수행하고 리엑트로 전달해 주는 역할만
        String loginId = userService.findIdByNicknameEmail(user.getEmail(), user.getNickname());


        if (loginId != null) {
            String title = "아이디 찾기 결과";
            String content = "<h3>회원님의 아이디는 : </h3><h2>" + loginId + "</h2>입니다.";

            emailSender.sendMail(title, user.getEmail(), content);

            // 이메일로 아이디를 보냈기 떄문에 굳이 프런트에 아이디를 줄 필요없음
            // 따라서 리턴할 값을 주지않고 공백처리 해도됨.
            // 하지만 json형태로 데이터가 오기 떄문에 객체 형태로 변환하기 위해서는
            // map형태를 쓰는게 좋음.
            // 그리고 Map.of()를 쓰면 키-값 쌍으로 여러 데이터를 쉽게 묶어서 반환 가능
            // 객체 클래스를 만들지 않아도 여러 필드를 한번에 보내기 좋음
            return ResponseEntity.ok(Map.of("message", "이메일로 아이디를 전송했습니다. "));
        } else {
            return ResponseEntity.status(404).body("아이디를 찾을 수 없습니다.");
        }
    }

    //비밀번호 찾기 설정
    @PostMapping(value = "/find-pw")
    public ResponseEntity<?> findPw(@RequestBody User user) {
        String loginId = user.getLoginId();
        String email = user.getEmail();

        boolean result = userService.resetPassword(loginId, email);
        if (result) {
            return ResponseEntity.ok("임시 비밀번호가 이메일로 발송되었습니다.");

        } else {
            return ResponseEntity.status(404).body("아이디와 이메일이 일치하지 않습니다.");
        }
    }

    //로그인(김경호)
    @PostMapping(value = "/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        System.out.println("로그인 요청 도착");
        System.out.println("입력 아이디 = " + user.getLoginId());
        System.out.println("입력 비밀번호 = " + user.getPassword());
        LoginUser u = userService.selectOneUser(user);
        System.out.println("DB 조회 결과 = " + u);

        // 1. 로그인 실패 처리 (u가 null인 경우) -> 401 Unauthorized
        if (u == null) {
            return ResponseEntity.status(401).body("아이디 또는 비밀번호가 일치하지 않거나 일반 회원 로그인이 불가능한 계정입니다.");
        }

        // 2. 정지된 계정 처리 -> 403 Forbidden
        // 안전하게 문자열 "rejected"를 앞에 두고 .equals()를 써서 NullPointerException을 방지합니다.
        if ("rejected".equals(u.getLoginId())) {
            return ResponseEntity.status(403).body("정지된 계정은 정지가 풀리기 이전 로그인 서비스를 이용할 수 없습니다.");
        }


        //비밀번호는 제외하고  그외에 정보는 정상적으로 리엑트로 넘어가게 하는 로직
        UserResponse res = new UserResponse(
                u.getLoginId(),
                u.getNickname(),
                u.getEmail(),
                u.getRole(),
                u.getProfileImg(),
                u.getUserId(),
                u.getToken(),
                u.getEndTime(),
                u.getCreatedAt()


        );


        return ResponseEntity.ok(res);

    }

    //관리자 로그인 페이지(김경호)
    @PostMapping("/adminlogin")
    //userResponse가 있지만 일반 회원 정보와 겹치지 않게 하기 위해 AdminLoginRequest를 하나 새로 만들고 관리
    public ResponseEntity<UserResponse> adminlogin(@RequestBody AdminLoginRequest request) {
        //user로 받아도 되지만 그렇게 되면 아이디나 패스워드 외에도 다른 정보까지 받아오게 된다.
        //-> 따라서 UserResponse클래스, DTO형 하나를 더 만들고 거기에 아이디와 패스워드 변수를 추가한다음
        //--> UserResponse에서 값을 받아와 연결
        UserResponse res = userService.adminLogin(request);
        return ResponseEntity.ok(res);
    }

    //재토큰 발행 로직 ( 토큰 만료 5분전에 메세지 띄우기)(김경호)
    @PostMapping(value = "/refresh")
    // Authentication authentication=> “현재 로그인한 사용자 정보”를 담고 있는 객체
    //직접적으로 Map<String, String> data 사용해서 받아오기.
    //일반적인 zustend에 있는 값을 이용해서 가져올 수가 없었음.
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> data) {
        // 1. 현재 인증된 사용자의 ID를 꺼내기
        String loginId = data.get("loginId");

        // 2. 서비스에게 "이 사용자 정보를 바탕으로 새 토큰 세트 좀 만들어줘"라고 요청
        // 기존에 로그인을 처리하던 서비스 메서드나, 새로 만든 리프레시 전용 메서드를 호출하기
        //Map<String, Object> = 여러 데이터를 한번에 보내기 위한 컨테이너
        //-> 즉 여기에서는 token,endTime을 보내야 해서 Map을 사용

        LoginUser newLogin = userService.refeshToken(loginId);

        // 3. 다시 프론트엔드(Zustand)로 새 토큰과 endTime을 던져줌

        if (newLogin != null) {
            return ResponseEntity.ok(newLogin);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인에 실패하였습니다.");
        }


    }

    //프로필 이미지 업데이트 로직 (김경호)
    @PostMapping(value = "/profile-image")
    public ResponseEntity<?> updateProfileImage(@RequestParam("profileImg") MultipartFile profileImg,
                                                @RequestHeader("Authorization") String token) {
        System.out.println("파일명:" + profileImg.getOriginalFilename());

        //service나 다른데서 던지기가 발생하면 다른곳에서도 연쇄적으로 던지기가 발생할 수 있다.
        //-> 따라서try catch구문을 통해서 예외처리를 하는 것이 중요하다
        try {
            // 에러가 날 수 있는 위험한 코드를 try 안에 넣습니다.
            String imageUrl = userService.updateProfileImage(profileImg, token);
            return ResponseEntity.ok(imageUrl);

        } catch (IOException e) {
            // 에러가 발생했을 때 실행할 안전장치
            e.printStackTrace(); // 서버 로그에 에러 원인 출력
            return ResponseEntity.status(500).body("이미지 업로드 중 오류가 발생했습니다.");
        }


    }

    //기본프로필 이미지로 되돌리기 위한 로직 (김경호)
    @PatchMapping(value = "/profile-image/default")
    public ResponseEntity<?> resetDefaultProfileImage(@RequestHeader("Authorization") String token) {
        int result = userService.resetDefaultProfileImage(token);
        System.out.println(token);
        return ResponseEntity.ok(result);

    }

    //마이페이지에서 이메일 수정을 짜기 위한 로직 (김경호)
    @PatchMapping(value = "/email")
    public ResponseEntity<?> updateEmail(@RequestBody User u) {
        //1. 업데이트 성공 여부 확인
        int result = userService.updateEmail(u);

        //2. 이메일 업데이트가 성공 했을 떄와 안했을떄의 메세지 만들기
        if (result > 0) {
            return ResponseEntity.ok("이메일 변경 성공");
        } else {
            return ResponseEntity.badRequest().body("이메일 변경 실패");
        }

    }

    // 닉네임을 수정하기 위한 로직 (김경호)
    @PatchMapping(value = "/nickname")
    //같은 아이디에서 닉네임을 중복 입력했을 경우 방지하기 위해 토큰에 저장되어있는 닉네임을 비교, 그러기 위해서는 프론트 헤더에 저장되어 있는
    //-> 닉네임을 받아야 하기 떄문에 여기에서 @RequestHeader("Authorization") String token추가. service에 u하고 token을 보냄.
    public ResponseEntity<?> updateNickname(@RequestBody User u, @RequestHeader("Authorization") String token) {

        int result = userService.updateNickname(u, token);
        // 닉네임이 중복될 경우 -1값을 프론트엔드로 반환. 프론트엔드 에서는 -1값을 받으면 ui에 표시
        if (result == -1) {
            return ResponseEntity.badRequest().body(-1);
        } else {
            return ResponseEntity.ok(result);
        }
    }


    // 최근 7일 동안 사용자 랭킹 출력 (담당자: 장지혁)
    @GetMapping("/ranking")
    public ResponseEntity<?> getWeeklyRanking() {
        return ResponseEntity.ok(userService.getWeeklyRanking());
    }

    // 최근 7일 동안 인기 메뉴 출력 (담당자: 장지혁)
    @GetMapping("/popular-menus")
    public ResponseEntity<?> getWeeklyPopularMenus() {
        return ResponseEntity.ok(userService.getWeeklyPopularMenus());
    }


    //게시글 전체 데이터를 마이페이지에서 띄우는 로직 (김경호)
    //이 로직에서는 따로 response를 하나 더 만들지 않고 그대로 post로직을 이용
    //-> 왜냐하면 우리가 조회(Select)를 요청하는 순간, MyBatis가 DB에 저장된 진짜 데이터들을 꺼내서
    //--> 이 빈 Post 객체에 값을 하나씩 다 채워주기 떄문. 즉 원래 초기에는 값들이 다 비어 있는 것이
    //-> 맞지만, 우리가 다시 조회를 요청하게 될 경우, 백엔드가 알아서 다 채워줌.
    //-> 따라서 그대로 진행해도 무방
    @GetMapping(value = "/my-posts")
    //PostResponse의 제네릭을 사용하여 Post에 들어있는 정보들을 끄집어와 실행.
    public ResponseEntity<PostResponse<List<Post>>> getMyPosts(@RequestHeader(name = "Authorization") String token) {
        System.out.println("받은 토큰 = " + token);
        //1. 토큰 검증
        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    //제네릭에서 리스트 형식으로 결과값을 주기 떄문에 body에서도 리엑트로 보낼 떄 리스트 형식으로 반환
                    .body(new PostResponse<>(false, "로그인 정보를 확인할 수 없습니다.", null));
        }


        //게시글을 이루는 요소를 전체 조회하지만 데이터베이스에서 필요한 요소만 보내기 떄문에 무겁지 않음
        List<Post> posts = userService.getMyPosts(user);

        // 3. 가져온 순수 리스트(posts)를 PostResponse에 이쁘게 포장하기
        PostResponse<List<Post>> postResponse = new PostResponse<>(true, "조회 성공", posts);

        // 4. 리액트로 전송!
        return ResponseEntity.ok(postResponse);
    }

    //회원 탈퇴 로직 (김경호)
    @DeleteMapping(value = "/delete")
    public ResponseEntity<?> deleteUser(@RequestParam("loginId") String loginId) {


        // 데이터가 잘 넘어왔는지 검증
        // 데이터가 잘 넘어왔나 검증
        if (loginId == null || loginId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("탈퇴할 유저의 아이디가 없습니다.");
        }

        try {
            // 서비스단으로 삭제할 아이디 전달하고 결과 받기 (성공하면 true, 실패하면 false)
            boolean isDeleted = userService.deleteUser(loginId);

            if (isDeleted) {
                return ResponseEntity.ok().body("회원 탈퇴 완료!");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("존재하지 않는 회원입니다.");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 내부 오류로 탈퇴 실패");
        }
    }

    //즐겨찾기한 회원의 정보를 마이페이지로 끌어오기 (김경호)
    @GetMapping(value = "/profile/favorite")
    public ResponseEntity<?> getFavoriteUser(@RequestHeader("Authorization") String token) {
        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        
        // 팀장이 설정한 리스트에 담겨져 있는 즐겨찾기 회원들의 정보들이 담겨져 있는 바구니를 사용해서 보내기
        List<UserFavoriteListResponse> result = userService.getMyFavoriteList(user);
        return ResponseEntity.ok(result);
    }

}









