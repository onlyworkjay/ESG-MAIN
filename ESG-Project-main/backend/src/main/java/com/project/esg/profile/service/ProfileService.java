package com.project.esg.profile.service;

import com.project.esg.profile.dao.ProfileDao;
import com.project.esg.profile.dto.*;
import com.project.esg.users.vo.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProfileService {
    @Autowired
    private ProfileDao profileDao;


    public ProfileResponse getProfile(LoginUser user, Long targetId) {
        ProfileResponse profile = new ProfileResponse();
        ProfileResponse requestParam = new ProfileResponse();
        requestParam.setUserId(targetId);

        if (user != null) {
            requestParam.setRequestId(user.getUserId());
        }


        // 1. 프로필 메인 정보 조회
        profile = profileDao.getProfileById(requestParam);
        if (profile == null) {
            throw new RuntimeException("조회실패");
        }

        // 2. 마스터/어드민 프로필 접근 제어
        boolean isMasterProfile = "master".equals(profile.getRole());
        boolean isAdminProfile = "admin".equals(profile.getRole());

        // 요청자(로그인 유저)의 권한 체크 (user가 null인지 먼저 확인하여 NullPointerException 방지)
        boolean isAdmin = user != null && ("admin".equals(user.getRole()) || "master".equals(user.getRole()));

        // 규칙 1: 마스터 프로필은 누구도 조회 불가 (원천 차단)
        if (isMasterProfile) {
            throw new RuntimeException("마스터 프로필은 접근할 수 없습니다.");
        }

        // 규칙 2: 조회 대상이 어드민인데, 요청자가 어드민/마스터가 아니면 차단 (일반유저 & 비회원 차단)
        if (isAdminProfile && !isAdmin) {
            throw new RuntimeException("접근 권한이 없습니다. 관리자 프로필은 조회할 수 없습니다.");
        }

        // 3. 로그인 유저 상태 및 본인 여부 체크
        if (user != null) {
            profile.setLogin(true);

            // 본인 프로필 여부 체크
            if (user.getUserId().equals(targetId)) {
                profile.setMe(true);
            }
        }

        // 4. 서브 데이터 조회 (게시글, 후기, 최근선택)
        List<ProfilePostResponse> posts = profileDao.getProfilePost(requestParam);
        List<ProfileGramResponse> grams = profileDao.getProfileGram(requestParam);
        List<ProfileChoiceResponse> choices = profileDao.getProfileChoice(requestParam);

        // 5. 데이터가 존재할 때만 profile 객체에 셋팅
        if (posts != null && !posts.isEmpty()) {
            profile.setPost(posts);
        }
        if (grams != null && !grams.isEmpty()) {
            profile.setGram(grams);
        }
        if (choices != null && !choices.isEmpty()) {
            profile.setChoice(choices);
        }
        return profile;
    }

    //즐겨찾기 등록 (작성자 : 한진호)
    public FavoriteResponse insertFavorite(LoginUser user, long targetId, FavoriteResponse param) {
        //순서 targetId 조회, 즐겨찾기추가 , 응답반환
        //해당 유저가 존재하는지 가져오기
        ProfileResponse profile = new ProfileResponse();

        profile.setUserId(targetId);
        profile = profileDao.getProfileById(profile);   //재사용
        //System.out.println(profile);
        //없는 타겟아이디 테스트시 null 반환
        if (profile == null) {
            throw new RuntimeException("즐겨찾기할 아이디를 찾을수 없어요.");
        }

        // 관리자의 경우 즐겨찾기 불가
        boolean isAdmin = "admin".equals(profile.getRole()) || "master".equals(profile.getRole());
        if (isAdmin) {
            throw new RuntimeException("즐겨찾기 할 수 없어요.");
        }

        param.setUserId(user.getUserId());
        param.setTargetUserId(targetId);

        int favoriteResult = profileDao.insertFavorite(param);

        if (favoriteResult <= 0) {
            throw new RuntimeException("즐겨찾기 중 오류발생.");
        }
        param.setResult(true);

        return param;
    }

    //즐겨찾기 삭제 (작성자 : 한진호)
    public FavoriteResponse deleteFavorite(LoginUser user, long targetId) {
        ProfileResponse profile = new ProfileResponse();
        profile.setUserId(targetId);
        profile = profileDao.getProfileById(profile);
        if (profile == null) {
            throw new RuntimeException("즐겨찾기할 취소 할 아이디를 찾을수 없어요.");
        }

        // 관리자의 경우 즐겨찾기 불가
        boolean isAdmin = "admin".equals(profile.getRole()) || "master".equals(profile.getRole());
        if (isAdmin) {
            throw new RuntimeException("즐겨찾기 취소 할 수 없어요.");
        }
        FavoriteResponse param = new FavoriteResponse();
        param.setTargetUserId(targetId);
        param.setUserId(user.getUserId());


        int favoriteResult = profileDao.deleteFavorite(param);
        if (favoriteResult <= 0) {
            throw new RuntimeException("즐겨찾기 취소 중 오료 발생");
        }

        return new FavoriteResponse(true);

    }

    //회원 신고 조회(작성자 : 한진호)
    public ReportResponse getReport(LoginUser user, long targetId) {
        ProfileResponse profile = new ProfileResponse();
        profile.setUserId(targetId);
        profile = profileDao.getProfileById(profile);
        if (profile == null) {
            throw new RuntimeException("신고조회할 회원을 찾을수 없어요.");
        }
        ReportSearchParam param = new ReportSearchParam(user.getUserId(), targetId);
        ReportResponse response = profileDao.getReportDetail(param);
        return response;
    }

    //회원 신고 등록 (작성자 :한진호)
    public ReportResponse insertReport(LoginUser user, long targetId, ReportRequest param) {
        //접수중인 신고가있는지 조회

        ReportSearchParam searchParam = new ReportSearchParam(user.getUserId(), targetId);
        ReportResponse checkReport = profileDao.getReportDetail(searchParam); //재사용

        if (checkReport != null) {
            throw new RuntimeException("이미 신고접수된 신고가 있어요.");
        }
        param.setUserId(user.getUserId());
        param.setTargetUserId(targetId);

        int reportResult = profileDao.insertReport(param);  //DB등록
        if (reportResult <= 0) {
            throw new RuntimeException("이미 신고중 오류 발생.");
        }
        ReportResponse response = profileDao.getReportDetail(searchParam);  // 재사용

        if (response == null) {  // 신고 등록후 접수된 신고내역을 전송하기 위한 객체
            throw new RuntimeException("이미 신고 조회중 오류 발생.");
        }

        return response;
    }

    //회원 신고 삭제 (작성자 : 한진호)
    public ReportDeleteResponse deleteReport(LoginUser user, long targetId, long reportId) {
        //접수 상태의 신고가 있는지 조회
        ReportSearchParam checkParam = new ReportSearchParam(user.getUserId(), targetId);
        ReportResponse checkReport = profileDao.getReportDetail(checkParam); //재사용

        if (checkReport == null) {
            throw new RuntimeException("이미 신고 취소되었거나 취소할 신고건이 없습니다.");
        }
        //조회한 신고와 삭제한 요청이 일치하는지 확인
        if(!checkReport.getReportId().equals(reportId)){
            throw new RuntimeException("요청을 처리할수 없습니다");
        }
        ReportDeleteParam param = new ReportDeleteParam();
        param.setUserId(user.getUserId());
        param.setReportId(reportId);
        param.setTargetUserId(targetId);
        int reportResult = profileDao.deleteReport(param);
        if(reportResult <= 0){
            throw new RuntimeException("취소중 오류발생");
        }
        ReportDeleteResponse response = new ReportDeleteResponse(true);
        return response;
    }
}

