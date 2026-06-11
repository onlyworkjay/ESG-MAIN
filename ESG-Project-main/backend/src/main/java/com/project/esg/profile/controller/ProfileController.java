package com.project.esg.profile.controller;


import com.project.esg.global.security.JwtUtils;
import com.project.esg.profile.dto.*;
import com.project.esg.profile.service.ProfileService;
import com.project.esg.users.vo.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 프로필은 user 도메인 이나 충돌우려를 고려해서 따로작성 이후 병합
 */
@CrossOrigin("*")
@RestController
@RequestMapping(value = "/")
public class ProfileController {
    @Autowired
    private ProfileService profileService;
    @Autowired
    private JwtUtils jwtUtil;


    //프로필 불러오기 (작성자 : 한진호)
    @GetMapping(value = "/profile/{targetId}")
    public ResponseEntity<?> getProfile(@RequestHeader(required = false, name = "Authorization") String token,
                                        @PathVariable Long targetId) {

        LoginUser user = jwtUtil.checkToken(token);

        ProfileResponse result = profileService.getProfile(user, targetId);

        return ResponseEntity.ok(result);
    }

    //즐겨찾기 등록 (작성자 : 한진호)
    @PostMapping(value = "/profile/favorite/{targetId}")
    public ResponseEntity<?> favoriteOn(@RequestHeader(name = "Authorization") String token,
                                        @PathVariable long targetId,
                                        @RequestBody FavoriteResponse param) {

        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            throw new RuntimeException("로그인 필요.");
        }

        FavoriteResponse result = profileService.insertFavorite(user, targetId, param);


        return ResponseEntity.ok(result);
    }

    //즐겨찾기 삭제 (작성자 : 한진호)
    @DeleteMapping(value = "/profile/favorite/{targetId}")
    public ResponseEntity<?> favoriteOff(@RequestHeader(name = "Authorization") String token,
                                         @PathVariable long targetId) {


        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            throw new RuntimeException("로그인 필요.");
        }
        FavoriteResponse result = profileService.deleteFavorite(user, targetId);
        return ResponseEntity.ok(result);
    }

    //회원 신고 조회(작성자 : 한진호)
    @GetMapping(value = "/profile/report/{targetId}")
    public ResponseEntity<?> getReport(@RequestHeader(name = "Authorization") String token,
                                       @PathVariable long targetId) {
        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            throw new RuntimeException("로그인 필요.");
        }
        ReportResponse result = profileService.getReport(user, targetId);

        return ResponseEntity.ok(result);
    }

    //회원 신고 등록 (작성자 : 한진호)
    @PostMapping(value = "/profile/report/{targetId}")
    public ResponseEntity<?> reportOn(@RequestHeader(name = "Authorization") String token,
                                      @PathVariable long targetId,
                                      @RequestBody ReportRequest param) {
        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            throw new RuntimeException("로그인 필요.");
        }
        ReportResponse result = profileService.insertReport(user, targetId, param);

        return ResponseEntity.ok(result);
    }

    //회원 신고 삭제 (작성자 : 한진호)

    @DeleteMapping(value ="/profile/report/{targetId}/{reportId}")
    public ResponseEntity<?> reportOff(@RequestHeader(name = "Authorization") String token,
                                       @PathVariable long targetId,
                                       @PathVariable long reportId){
        LoginUser user = jwtUtil.checkToken(token);
        if (user == null) {
            throw new RuntimeException("로그인 필요.");
        }

        ReportDeleteResponse result = profileService.deleteReport(user,targetId,reportId);


        return ResponseEntity.ok(result);
    }




}
