package com.project.esg.users.service;


import com.project.esg.global.security.JwtUtils;
import com.project.esg.global.util.EmailSender;
import com.project.esg.global.util.FileUtils;
import com.project.esg.post.dto.PostResponse;
import com.project.esg.post.vo.Post;
import com.project.esg.profile.dao.ProfileDao;
import com.project.esg.profile.dto.ProfileResponse;
import com.project.esg.users.dao.UserDao;
import com.project.esg.users.dto.AdminLoginRequest;
import com.project.esg.users.dto.UserFavoriteListResponse;
import com.project.esg.users.dto.UserResponse;
import com.project.esg.users.vo.LoginUser;
import com.project.esg.users.vo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import software.amazon.awssdk.services.s3.model.PutObjectRequest;
// 보안용 랜덤 숫자 생성기를 하겠다는 선언
import java.io.IOException;
import java.security.SecureRandom;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserDao userDao;

    @Autowired
    private BCryptPasswordEncoder bcrypt;


    @Autowired
    private FileUtils fileUtils;

    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;
    @Autowired
    private EmailSender emailSender;

    @Autowired
    //이미지 업데이트 및 기존 이미지 파일을 삭제시키기 위해 S3 config에서 데이터를 끌어오기
    private S3Client s3Client;

    @Autowired
    private ProfileDao profileDao;


    //회원가입(김경호)
    public int insertUser(User user) {
        //회원가입때 비밀번호 암호화 등록
        String password = user.getPassword();
        String encPw = bcrypt.encode(password);
        System.out.println("password = " + password);
        user.setPassword(encPw);
        System.out.println("encPw = " + encPw);


        int result = userDao.insertUser(user);
        return result;
    }

    //로그인(김경호)
    public LoginUser selectOneUser(User user) {
        //비밀번호 암호화의 순서
        //1. loginId로 DB 회원 조회
        //2. 조회 결과가 null이면 로그인 실패
        //3. 사용자가 입력한 평문 비밀번호와 DB의 암호화 비밀번호를 비교
        //4. 맞으면 회원 반환, 틀리면 null 반환

        //1. 아이디로 회원 조회
        User u = userDao.selectOneUser(user);


        //2.아이디가 없으면 로그인 실패
        if (u == null) {
            return null;
        }

        //2-2 등급이 마스터나 관리자인 경우 일반 로그인 사용 불가

        if ("master".equals(u.getRole()) || "admin".equals(u.getRole())) {
            System.out.println("일반 회원 로그인에서 사용할 수 없는 계정입니다.");
            return null;
        }

        //3.입력한 비밀번호와 데이터베이스에 저장된 암호화 비밀번호 비교
        boolean pwResult = BCrypt.checkpw(user.getPassword(), u.getPassword());

        //4. 비밀번호가 틀리면 로그인 실패
        if (!pwResult) {
            return null;
        }

        System.out.println("조회된 DB 회원 : " + u);
        System.out.println("DB status : " + u.getStatus());

        //4-1 정지된 회원은 로그인 이용할 수 없게 만들기
        if ("suspended".equals(u.getStatus())) {
            System.out.println("정지된 회원은 로그인 서비스를 이용할 수 없습니다.");

            LoginUser reject = new LoginUser();
            reject.setLoginId("rejected");


            return reject;
        }


        //5. 로그인할 때 토큰을 받기 위한 로직
        //아이디/비밀번호가 다 맞으면 토큰을 생성 (출입증 발급)
        //우리가 JwtUtils에 만들어둔 createToken 메서드를 그대로 활용
        LoginUser loginUser = jwtUtils.createToken(
                u.getUserId(),
                u.getLoginId(),
                u.getNickname(),
                u.getEmail(),
                u.getRole(),
                u.getProfileImg(),
                u.getCreatedAt()
        );


        //5. 아이디도 있고 비밀번호도 맞으면 로그인 성공
        return loginUser;
    }

    //토큰 전용 로직 (김경호)
    public User selectOneUserById(Long userId) {
        User u = userDao.selectOneUserById(userId);
        return u;
    }

    //중복된 이메일 체크 로직(김경호)
    public int checkEmail(String email) {
        return userDao.checkEmail(email);

    }

    //아이디 중복 체크 로직(김경호)
    public User selectOneLoginId(String loginId) {
        User u = userDao.selectOneLoginId(loginId);
        return u;
    }

    //관리자 로그인 페이지 (김경호)
    public UserResponse adminLogin(AdminLoginRequest request) {
        String loginId = request.getLoginId() == null ? "" : request.getLoginId().trim();
        String password = request.getPassword() == null ? "" : request.getPassword();

        // 1. loginId로 회원 조회
        User user = userDao.selectUserByLoginId(loginId);

        if (user == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "아이디 또는 비밀번호가 일치하지 않습니다."
            );
        }

        // 2. 비밀번호 검사
        boolean pwCheck = bCryptPasswordEncoder.matches(
                password,
                user.getPassword()
        );

        if (!pwCheck) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "아이디 또는 비밀번호가 일치하지 않습니다."
            );
        }

        // 3. 계정 상태 검사
        if (!"active".equals(user.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "사용할 수 없는 계정입니다."
            );
        }

        // 4. 관리자 권한 검사
        String role = user.getRole() == null ? "" : user.getRole().toLowerCase(Locale.ROOT);

        if (!"admin".equals(role) && !"master".equals(role)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "관리자 권한이 없습니다."
            );
        }

        // 5. 토큰 생성
        LoginUser loginUser = jwtUtils.createToken(
                user.getUserId(),
                user.getLoginId(),
                user.getNickname(),
                user.getEmail(),
                role,
                user.getProfileImg(),
                user.getCreatedAt()
        );

        // 6. 프론트로 보낼 응답 만들기
        UserResponse res = new UserResponse(
                loginUser.getLoginId(),
                loginUser.getNickname(),
                loginUser.getEmail(),
                loginUser.getRole(),
                loginUser.getProfileImg(),
                loginUser.getUserId(),
                loginUser.getToken(),
                loginUser.getEndTime(),
                loginUser.getCreatedAt()
        );

        return res;
    }

    //아이디 찾기 로직 (김경호)
    public String findIdByNicknameEmail(String email, String nickname) {
        //리엑트에서 이미 검증 로직이 있지만 여기에서도 해주는 이유
        //-> 리엑트에서는 언제든지 로직을 탈취하여 악용될 여지가 있다. 
        //-> 따라서 백엔드에서도 방어용 검사를 해줄 핗요가 있음
        //-> 따라서 값자체가 없으면 막는 로직 설정
        //->즉 공백 입력 방지, 앞뒤 공백 제거, 불필요한 DB 조회 방지, 백엔드 안정성
        if (email == null || nickname == null) {
            return null;
        }

        // 데이터를 조회하여 비교할 때 공백있는채로 하게 되면 일치하지 않을 위험이 있음
        //--> 따라서 앞뒤 공백을 제거하여 비교를 잘하기 위한 로직
        email = email.trim();
        nickname = nickname.trim();

        //앞서 trim에서 공백을 제거 했음에도 빈값일 경우 null처리하는 로직
        if (email.equals("") || nickname.equals("")) {
            return null;
        }

        String loginId = userDao.findIdByNicknameEmail(email, nickname);
        return loginId;
    }

    //비밀번호 찾기 로직(김경호)

    public boolean resetPassword(String loginId, String email) {
        // 객체 선언을 해줘야 밑에서 user을 정의할 수 있음
        User user = new User();
        user.setLoginId(loginId);
        user.setEmail(email);

        if (loginId == null || email == null) {
            return false;
        }
        //공백없이 처리
        loginId = loginId.trim();
        email = email.trim();

        // 빈 문자열 체크
        if (loginId.equals("") || email.equals("")) {
            return false;
        }

        //1. 아이디 + 이메일 일치 회원 확인
        Integer result = userDao.selectUserByLoginIdAndEmail(loginId, email);

        if (result == null) {
            return false;
        }

        //2.임시 비밀번호 생성
        //-> 일단 객체 생성 , 메서드는 아래에서 마저 만들기
        String tempPassword = createTempPassword(6);

        //3. 임시 비밀번호 암호화
        String resetEncPw = bcrypt.encode(tempPassword);

        //4. 암호화된 비밀번호를 user객체에 넣기
        user.setPassword(resetEncPw);

        //5. 데이터베이스 비밀번호 업데이트
        Integer updateResult = userDao.updateTempPassword(user);

        if (updateResult != 1) {
            throw new RuntimeException("임시 비밀번호를 업데이트 실패");
        }

        //5. 이메일 내용 작성
        String content = ""
                + "<h3>임시 비밀번호가 발급되었습니다.</h3>"
                + "<p>아래 임시 비밀번호로 로그인한 뒤, 반드시 비밀번호를 변경해주세요.</p>"
                + "<hr>"
                + "<p><strong>임시 비밀번호: " + tempPassword + "</strong></p>";

        //emailSender 메서드 형태에 맞게 사용
        emailSender.sendMail("임시 비밀번호 안내", email, content);


        return true;
    }

    // 임시 비밀번호 만들기의 메서드 생성
    //-> 랜덤 구문을 활용해서 비밀번호 생성
    private String createTempPassword(int length) {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ"
                + "abcdefghijkmnopqrstuvwxyz"
                + "23456789"
                + "!@#$%";

        SecureRandom random = new SecureRandom();

        StringBuffer sb = new StringBuffer();

        for (int i = 0; i < length; i++) {
            //chars 문자열 길이 안에서 랜덤 숫자 하나를 뽑겠다.는 의미
            int index = random.nextInt(chars.length());
            sb.append(chars.charAt(index));
        }
        return sb.toString();

    }


    // 재토큰 발행 로직 (로그인 로직과 통일)
    //=> 그렇게 하는 이유는 짧은 시간이라도 등급, 상태등이 변할 수 있기 때문
    public LoginUser refeshToken(String loginId) {
        // 1. 최신 정보를 가져옴
        User u = userDao.selectOneNewUser(loginId);
        // 2. 로그인 때와 동일한 JwtUtils 메서드 사용
        // 이 메서드가 내부적으로 새로운 Access Token을 만들어서 LoginUser에다가 달아줌
        //-> 조회해온 최신 정보 유저에다가 새로운 토큰을 넣어주는 거임
        if (u != null) {
            LoginUser newLogin = jwtUtils.createToken(
                    u.getUserId(),
                    u.getLoginId(),
                    u.getNickname(),
                    u.getEmail(),
                    u.getRole(),
                    u.getProfileImg(),
                    u.getCreatedAt()
            );
            return newLogin;
        }

        return null;
    }

    //이미지 파일 업로드 로직 (김경호)
    public String updateProfileImage(MultipartFile profileImg, String token) throws IOException {
        //이미지 파일 업로드 및 삭제 로직을 모두 구현시킨 뒤
        //추가적으로 구현한 기능
        //0-1 빈파일 처리 로직

        if (profileImg.isEmpty()) {
            throw new RuntimeException("파일이 없습니다.");
        }

        //0-2 이미지 파일외에는 올리지 못하게 막기
        String contentType = profileImg.getContentType();

        if (contentType == null ||
                !contentType.startsWith("image/")) {

            throw new RuntimeException(
                    "이미지 파일만 업로드 가능합니다."
            );
        }

        //0-3 이미지 크기를 제한시키는 로직
        if (profileImg.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException(
                    "5MB 이하 이미지만 업로드 가능합니다."
            );
        }


        //1.토큰 검증 -> 로그인하면서 토큰에 저장되어 있는 userId를 꺼내오기
        LoginUser loginUser = jwtUtils.checkToken(token);
        //2. userId 가져오기
        Long userId = loginUser.getUserId();
        //2-1 -> 기존 이미지 삭제를 위해 추가되는 로직
        //-> 기존 이미지 url조회
        String oldImageUrl = userDao.selectProfileImage(userId);

        //3.파일명 생성
        String fileName = UUID.randomUUID()
                + "-"
                + profileImg.getOriginalFilename();

        // 4. S3 업로드
        PutObjectRequest putObjectAclRequest =
                PutObjectRequest.builder()
                        .bucket("esg-project-site")//버킷 이름을 적는 곳
                        .key("profile_images/" + fileName)// 이미지가 저장되는 폴더 명칭
                        .contentType(profileImg.getContentType())
                        .build();
        s3Client.putObject(putObjectAclRequest,
                RequestBody.fromBytes(profileImg.getBytes())
        );

        //5. URL 생성
        String imageUrl =
                "https://esg-project-site.s3.ap-northeast-2.amazonaws.com/profile_images/"
                        + fileName;

        // 로그 확인
        System.out.println("imageUrl = " + imageUrl);

        //6. 데이터 베이스 저장
        userDao.updateProfileImage(userId, imageUrl);

        //6-1 기존이미지 프로필 삭제를 위해 새로 추가되는 로직
        //-> 이전 이미지 삭제, 아래에 있는 메서드의 기능들을 실행
        deleteOldProfileImage(oldImageUrl);

        // 7. URL 반환

        return imageUrl;
    }

    //삭제 전용 메서드 만들기 위에 있는   deleteOldProfileImage를 실행시키기 위한 로직 (김경호)
    private void deleteOldProfileImage(String oldImageUrl) {
        // URL 형식이 아니면(user_default.png 등) 바로 리턴
        if (oldImageUrl == null || !oldImageUrl.startsWith("http")) {
            return;
        }

        // 기본 이미지면 삭제 안함
        if (oldImageUrl.contains("user_default.png")) {
            return;
        }

        //이전이미지를 삭제하기 위해 S3안에 profile_images/에서 기존 이미지 파일을 특정하고 삭제
        try {
            // 방어 코드: 문자열 포함 여부를 먼저 확인
            //-> 그러나 이건 완전 해결책은 아님. s3에서 이전 이미지가 삭제되어야 함.
            int index = oldImageUrl.indexOf("profile_images/");
            if (index == -1) {
                System.out.println("이전 이미지 URL 형태가 올바르지 않아 S3 삭제를 건너뜁니다. (값: " + oldImageUrl + ")");
                return;
            }
            String oldKey =
                    oldImageUrl.substring(oldImageUrl.indexOf("profile_images/"));

            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket("esg-project-site")
                    .key(oldKey)
                    .build();
            s3Client.deleteObject(deleteRequest);

            System.out.println("이전 이미지 삭제 완료 : " + oldKey);


        } catch (Exception e) {
            System.out.println("이전 이미지 삭제 실패");
            e.printStackTrace();
            //삭제 실패해도 새 이미지 업로드는 성공 처리
        }
        System.out.println("oldImageUrl = " + oldImageUrl);
        System.out.println("index = " + oldImageUrl.indexOf("profile_images/"));

    }


    //기본프로필 이미지로 되돌리기 위한 로직 (김경호)
    public int resetDefaultProfileImage(String token) {
        // 1. JWT 토큰에서 로그인한 유저 정보 추출
        LoginUser loginUser = jwtUtils.checkToken(token);
        //-> 사용자의 이미지를 특정하기 위해 userId 설정.
        Long userId = loginUser.getUserId();

        //2.userId를 조회한 뒤 그 사용자의 이미지 파일을 특정하기
        String oldImageUrl = userDao.getProfileImgByUserId(userId);

        // 3. S3에서 기존 이미지 삭제 로직 실행
        // 미리 만들어 둔 private void deleteOldProfileImage(String oldImageUrl) 메서드를 여기서 호출.
        deleteOldProfileImage(oldImageUrl);

        // 4. S3 삭제가 끝나면, 마지막으로 DB의 프로필 이미지를 기본 이미지로 초기화.
        int result = userDao.resetDefaultProfileImage(userId);

        // 5. 최종 결과 반환 (컨트롤러로 1 또는 영향을 받은 행의 수 리턴)
        return result;

    }


    //기존 이메일 수정하고 새로운 이메일로 업데이트(김경호)
    public int updateEmail(User u) {
        int result = userDao.updateEmail(u);
        return result;
    }

    // 닉네임을 수정하기 위한 로직 (김경호)
    public int updateNickname(User u, String token) {
        //토큰 로직에서 현재 저장되어 있는 로그인 아이디를 호출
        LoginUser loginUser = jwtUtils.checkToken(token);

        if (loginUser == null) return -1;

        // 현재 닉네임과 동일한 경우 중복방지를 위한 로직
        //-> 이쯤에서 if문을 넣는 것이 맞는 이유 --> 다른 닉네임을 적으면 이 로직은 그냥 지나치고 바로 업데이트
        //-> 같은 닉네임을 적는 경우 여기에서 걸림-> 업데이트 이후 이 로직을 넣게되면 뒷북치는 느낌이라 좋지 않음
        /*
        *   if (loginUser.getNickname().equals(u.getNickname())) {
            return -1;
        }
        * --> 이 로직을 쓸 수 없는 이유, 최초로 저장된 닉네임값을 비교하기 떄문에
        * --> 다시 그 닉네임으로 업데이트 불가. 따라서 이 로직 말고
        * --> 다시 업데이트된 토큰을 받아 와서 비교해야함.
        * */

        // 2. 닉네임 비교용으로 기존에 있던 '로그인/조회용' DAO 메서드를 재활용.
        //-> 즉 리엑트에서 토큰과 함꼐 보내준 값
        User newNicknameUser = userDao.selectOneUser(u);

        //혹시나 DB에서 유저를 못 찾아와서 null이 반환될 경우를 대비
        if (newNicknameUser != null) {
            // 3. DB에서 가져온 '진짜 실시간 닉네임'이랑 '바꾸려는 닉네임' 비교
            if (newNicknameUser.getNickname().equals(u.getNickname())) {
                return -1;
            }
        }


        // 4. 다르면 정상 업데이트
        int result = userDao.updateNickname(u);


        return result;
    }

    //민지원 : 회원의 정지 여부를 2차 체크하는 인터셉터의 service부분 로직
    public User userCheckStatus(String loginId) {
        User user = userDao.userCheckStatus(loginId);
        return user;
    }

    // 장지혁: 최근 7일 동안 사용자 랭킹
    public List<Map<String, Object>> getWeeklyRanking() {
        return userDao.selectWeeklyRanking();
    }

    // 담당자: 장지혁
    public List<Map<String, Object>> getWeeklyPopularMenus() {
        return userDao.selectWeeklyPopularMenus();
    }


    // 내가 작성한 게시글 목록 조회(마이페이지용 - UserService 내부)
    public List<Post> getMyPosts(LoginUser user) {


        // 1. 해당 유저가 작성한 게시글 목록 조회 (user_id 기반)
        List<Post> myPosts = userDao.getPostsByUserId(user.getUserId());


        // 2. 껍데기(PostResponse) 없이 순수한 리스트 데이터만 딱 리턴!
        return myPosts;
    }

    //회원 탈퇴 로직 (김경호)
    public boolean deleteUser(String loginId) {
        // UserDao를 통해 DB에서 해당 loginId를 가진 회원 삭제 요청
        // 삭제 성공 시 보통 1(성공한 행의 개수)이 반환
        int result = userDao.deleteUser(loginId);
        // 성공적으로 1행 이상 지워졌다면 true, 실패했다면 false 반환
        return result > 0;

    }

    //즐겨찾기한 회원의 정보를 마이페이지로 끌어오기 (김경호)
    public List<UserFavoriteListResponse> getMyFavoriteList(LoginUser user) {
        if (user == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }

        // 1. 내가 즐겨찾기한 기본 유저 목록 조회
        List<UserFavoriteListResponse> favoriteList = userDao.getMyFavoriteUsers(user.getUserId());

        // 2. 각 즐겨찾기 유저들의 최근 게시글 및 최근 선택 메뉴 끌어오기
        for (UserFavoriteListResponse fav : favoriteList) {
            // ProfileDao 양식에 맞추기 위해 파라미터 세팅
            ProfileResponse param = new ProfileResponse();
            param.setUserId(fav.getTargetUserId());


            // 최근 게시글 5개 추출 및 바인딩
            fav.setPosts(profileDao.getProfilePost(param));
            // 최근 선택 메뉴(빵_tbl 등) 5개 추출 및 바인딩
            fav.setChoices(profileDao.getProfileChoice(param));
            // 만약 세 번째 이미지의 '최근 작성 후기'가 Gram 데이터라면 이것도 같이 넣어주세요!
           // fav.setGrams(profileDao.getProfileGram(param));
        }

        return favoriteList;
    }
}

