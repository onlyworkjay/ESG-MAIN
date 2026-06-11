package com.project.esg.users.dao;

import com.project.esg.post.vo.Post;
import com.project.esg.users.dto.UserFavoriteListResponse;
import com.project.esg.users.vo.LoginUser;
import com.project.esg.users.vo.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Mapper
public interface UserDao {
    //회원가입 (김경호)
    int insertUser(User user);

    //로그인 (김경호)
    User selectOneUser(User user);

    //토큰 (김경호)
    User selectOneUserById(Long userId);

    //중복된 이메일 체크 (김경호)
    int checkEmail(String email);

    //아이디 중복 체크 (김경호)
    User selectOneLoginId(String loginId);

    //관리자 로그인 로직 (김경호)
    User selectUserByLoginId(String loginId);

    //아이디 찾기 로직 (김경호)
    String findIdByNicknameEmail(String email, String nickname);

    //비밀번호를 수정하기 위한 아이디와 이메일 일치로 수정 조건 설정(김경호)
    Integer selectUserByLoginIdAndEmail(@Param("loginId") String loginId, @Param("email") String email);

    //수정한 뒤 데이터베이스에 재저장 로직 (김경호)
    Integer updateTempPassword(User user);

    //재토큰 발행 로직 (김경건)
    User selectOneNewUser(String loginId);


    //이미지 프로필 파일 업로드 (김경호)
    void updateProfileImage(Long userId, String imageUrl);

    //기존 이미지 프로필 파일 삭제 로직 (김경호)
    String selectProfileImage(Long userId);

    //기존 이메일 수정하고 새로운 이메일로 업데이트(김경호)
    int updateEmail(User u);

    // 닉네임을 수정하기 위한 로직 (김경호)
    int updateNickname(User u);

    //민지원 추가, 회원의 정지 여부를 2차 확인하는 인터셉터용 db조회로직
    User userCheckStatus(String loginId);

    // 기본프로필로 바꾸기 전에 userId를 조회하고 이미지파일을 특정하기 위한 로직(김경호)
    String getProfileImgByUserId(Long userId);

    //기본프로필 이미지로 되돌리기 위한 로직 (김경호)
    int resetDefaultProfileImage(Long userId);


    // 담당자: 장지혁
    List<Map<String, Object>> selectWeeklyRanking();

    // 담당자: 장지혁
    List<Map<String, Object>> selectWeeklyPopularMenus();


    //리스트를 조회해 와서 마이페이지에 표시하기(김경호)
    List<Post> getPostsByUserId(Long userId);

    // //회원 탈퇴 로직 (김경호)
    int deleteUser(String loginId);

    //즐겨찾기한 회원의 정보를 마이페이지로 끌어오기 (김경호)
    List<UserFavoriteListResponse> getMyFavoriteUsers(Long userId);
}
