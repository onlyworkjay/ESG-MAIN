package com.project.esg.admin.service;

import com.project.esg.admin.dao.AdminDao;
import com.project.esg.admin.dto.*;
import com.project.esg.admin.vo.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;

import java.awt.*;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {
    @Autowired
    private AdminDao dao;

    public List<Allergy> getAllergyType() {
        List<Allergy> allergy = dao.getAllergyType();
        return allergy;
    }

    public List<AdminBrand> getBrandType() {
        List<AdminBrand> brand = dao.getBrandType();
        return brand;
    }
    public String getMemberRole(String loginId){
        String result = dao.getMemberRole(loginId);
        return result;
    }
    @Transactional
    public int insertMenue(Menue menueInfo, List<Allergy> allergies) {
        int result;
        result = dao.insertMenue(menueInfo);
        if(result == 1){
            int gotMenueId = dao.getProductId(menueInfo.getImageUrl());
            for(Allergy alg : allergies){//제발 다음번엔 외우자for (타입 변수 : 반복대상)
                alg.setProductId(gotMenueId);
                result = dao.insertAllergies(alg);
            }
        }
        return result;
    }

    public Map<String, Object> selectUsers(Search search) {
        int page=search.getPage();
//        int userFilter = search.getUserFilter();
        System.out.println(page);
        int totalPage;

        int size = 10;
        totalPage = (int) Math.ceil(dao.userCount(search) / size);
        System.out.println(totalPage);
        int offset = 10 * page;//sql문에 직접 적으면 에러나서 미리 계산
        search.setSize(size);
        search.setOffset(offset);
        List<Users> result = dao.selectUsers(search);
        Map<String,Object> result1 = new HashMap<String,Object>();
        result1.put("Users",result);
        result1.put("totalPage",totalPage);
        System.out.println(result);
        return  result1;
    }

    public Map<String, Object> getMenueList(SearchFilter search) {
        int page=search.getPage();
        int size = 10;
        int totalPage = (int) Math.ceil(dao.menueCount(search) / size);
        int offset = 10 * page;
        search.setOffSet(offset);
        List<Menue> menues = dao.getMenueList(search);
        Map<String,Object> map = new HashMap<String,Object>();
        map.put("totalPage", totalPage);
        map.put("menues",menues);
        return map;
    }

    public MenueDto getMenueDetail(Integer productId) {
       MenueDto menue = dao.getMenueDetail(productId);
        return menue;
    }
    @Transactional
    public int updateMenue(MenueDto menue) {
//        int result =0;
//        List<AllergyDto> frontAllergy = menue.getAllergies();
//        Integer productId=menue.getProductId();
//        List<AllergyDto> dbAllergy = dao.getAllergyById(productId);
//        result = dao.updateMenue(menue);
//        if (frontAllergy == null || frontAllergy.isEmpty()) {
//            throw new RuntimeException("알러지 최소 1개 필요");
//        }
//        if(result ==1){
//
//        Map<Integer ,AllergyDto> dbMap = dbAllergy.stream()//조회해온 dbAllergy를 풀어쓴다(stream)(정확히는 흐름을 읽음)
//                .collect(Collectors.toMap(
//                        AllergyDto::getProductAllergyId,//pk를 map의 키로 담음(:: = 메서드 참조(람다식의 변형))
//                        dto -> dto//객체는 그대로 가져옴(AllergyDto)((dto) -> { return dto; }를 람다식으로(->) 풀어씀)
//                ));// collect ->그 흐름을 담을 그릇(객체?)->Collectors.toMap() Map형태로 담음
//        for(AllergyDto front:frontAllergy){
//            AllergyDto allergie =dbMap.get(front.getProductAllergyId());
//            if(allergie == null){
//                //insert
//                Map<String,Integer> map = new HashMap<String,Integer>();
//                map.put("productId",productId);
//                map.put("allergyId",front.getAllergyId());
//                result = dao.insertAllergy(map);
//            }else{
//                if(allergie.getAllergyId().equals(front.getAllergyId())){
//                    //pass(아무것도 안함);
//                }else {
//                    //update
//                    result = dao.updateAllergy(front);
//                }
//
//
//            }
//        }
//
//        Set<Integer> frontPks = frontAllergy.stream()//풀어쓰고
//                .map(AllergyDto::getProductAllergyId)//frontAllergy에서 productAllergyId들만 따로 뽑고
//                .filter(Objects::nonNull)//null 거르고
//                .collect(Collectors.toSet());//set에다가 담기
//
//        for(AllergyDto db : dbAllergy){
//            if(frontPks.isEmpty()){
//                System.out.println(frontAllergy);
//                System.out.println(frontPks + "비어있음");
//            }
//            if(!frontPks.isEmpty() && !frontPks.contains(db.getProductAllergyId())){//db에 있는게 front에 없는지
//                //delete//알러지 명과 비교 추가로 필요
//                System.out.println(frontPks);
//                result = dao.deleteAllergy(db);
//            }
//        }
//        }
//        System.out.println("service 끝단"+result);
//        return result;
//    }
//
//    public String getImageUrlDB(Integer productId) {
//        String s3key = dao.getImageUrlDB(productId);
//        return s3key;
//    }
        int result = 0;

        List<AllergyDto> frontAllergy = menue.getAllergies();
        Integer productId = menue.getProductId();
        List<AllergyDto> dbAllergy = dao.getAllergyById(productId);

        // 메뉴 업데이트
        result = dao.updateMenue(menue);

        if (frontAllergy == null || frontAllergy.isEmpty()) {
            throw new RuntimeException("알러지 최소 1개 필요");
        }

        if (result == 1) {

            // 🔥 1️⃣ DB 기준 allergyId 집합
            Set<Integer> dbIds = dbAllergy.stream()
                    .map(AllergyDto::getAllergyId)
                    .collect(Collectors.toSet());

            // 🔥 2️⃣ FRONT 기준 allergyId 집합
            Set<Integer> frontIds = frontAllergy.stream()
                    .map(AllergyDto::getAllergyId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            // =========================
            // ✅ INSERT (없는 것만 추가)
            // =========================
            for (Integer frontId : frontIds) {
                if (!dbIds.contains(frontId)) {
                    Map<String, Integer> map = new HashMap<>();
                    map.put("productId", productId);
                    map.put("allergyId", frontId);

                    dao.insertAllergy(map);
                }
            }

            // =========================
            // ✅ DELETE (없는 것 제거)
            // =========================
            for (Integer allergyId : dbIds) {
                if (!frontIds.contains(allergyId)) {
                    dao.deleteByAllergyId(productId, allergyId);
                }
            }
        }

        System.out.println("service 끝단" + result);
        return result;
}

    public String getImageUrlDB(Integer productId) {
        String s3key = dao.getImageUrlDB(productId);
        return s3key;
    }

    public Users getMemberDetail(Integer userId) {
        Users users = dao.getMemberDetail(userId);
        return users;
    }

    //회원 정지 적는곳
    @Transactional
    public int groundUser(SuspendDto suspend) {
        int result =0;
        if(suspend.getEndDate() != null && suspend.getSuspensionReason() != null){
            Integer originUserId = suspend.getUserId();
            Integer userId = suspend.getTargetUserId();
            String suspensionReason = suspend.getSuspensionReason();
            //users값 변경
            result = dao.banUsersTbl(userId,suspensionReason);
            System.out.println(result + "users");
            if(result == 1){
                String adminNote = "현재 회원은 " + suspensionReason + " 와 같은 사유로 인해 정지 되었습니다.";
                suspend.setAdminNote(adminNote);
//                suspend.setUserId(userId);
                suspend.setProcessedBy(originUserId);
                //userReports 값 변경
                result = dao.banUserReports(suspend);
                System.out.println(result + "user_report");
                if(result ==1){
                    //userSuspension값 등록
                    result = dao.banUserSuspension(suspend);
                    System.out.println(result + "user_suspension");
                    if(result == 1){
//                        int reportId= suspend.getReportId();
                        //userReports 동일 정지 처리
                        String newAdminNote = "이미 " + suspensionReason +" 의 사유로 정지된 회원입니다.";
                        suspend.setAdminNote(newAdminNote);
                        int clearResult=dao.clearReportsForDuplicates(suspend);//result가 여러개일 수 있어서
                        System.out.println(clearResult + "중복처리");
                        if(clearResult>=0){
                            return result;
                        }

                    }
                }
            }
            System.out.println("문제 발생");
            result=0;
        }
        return result;
    }

    public Map<String ,Object> getReportList(Integer page, String status) {
        int size = 5;
        int totalPage = (int)Math.ceil((double)dao.getReportTotalPage(status)/size);
        System.out.println(totalPage);
        int offset = 5 * page;
        List<ReportDto> report = dao.getReportList(offset,status);
        System.out.println(report);
        Map<String ,Object> map = new HashMap<String,Object>();
        map.put("totalPage",totalPage);
        map.put("reportList",report);
        return map;
    }
    @Transactional
    public int hidePost(SuspendDto suspend) {
        int result =0;
        Integer postId=suspend.getPostId();
        String oldAdminNote=suspend.getAdminNote();
        String preAdminNote = "현재 이 게시물은 "+oldAdminNote+" 의 사유로 숨김처리된 게시물입니다";
        suspend.setAdminNote(preAdminNote);
        result = dao.hidePostPosts(postId);
        System.out.println(result +"post");
        if(result==1){
            result = dao.hidePostPostReport(suspend);
            System.out.println(result+"post_report");
            String newAdminNote = "이미 " + oldAdminNote +" 의 사유로 숨겨진 게시물입니다.";
            suspend.setAdminNote(newAdminNote);
            if(result ==1 && dao.clearPostReport(suspend)>=0){
                System.out.println(result+"중복처리");
                return result;
            }
            result=0;
        }

        return result;
    }
    @Transactional
    public int hideGram(SuspendDto suspend) {
        int result =0;
        Integer gramId = suspend.getGramId();
        result = dao.hideGramGrams(gramId);
        if(result ==1){
            String oldAdminNote=suspend.getAdminNote();
            String newAdminNote = "현재 이 후기는 "+ oldAdminNote + "의 사유로 숨김처리 되었습니다.";
            suspend.setAdminNote(newAdminNote);
            result = dao.hideGramGramReports(suspend);
            String clearAdminNote = "이미 "+oldAdminNote+" 의 사유로 처리된 후기글입니다.";
            suspend.setAdminNote(clearAdminNote);
            if(result==1 && dao.clearGramReports(suspend)>=0){
                return result;
            }
            result =0;
        }
        return result;
    }
    @Transactional
    public int denyReport(SuspendDto suspend) {
        int result;
        System.out.println(suspend);
        String reportType = suspend.getReportType();
        if(reportType.equals(null) && reportType.equals("")){
            return -1;
        }
        if(reportType.equals("post")){
            result = dao.denyPostReport(suspend);
            return result;
        }else if(reportType.equals("gram")){
            result = dao.denyGramReport(suspend);
            return result;
        }else if(reportType.equals("user")){
            result = dao.denyUserReport(suspend);
            return result;
        }
        result =0;
        return result;
    }

    public Dashboard getDashboard() {
        Dashboard dash = new Dashboard();
        dash.setAllMembers(dao.getWholeMember());
        dash.setNewMember(dao.countActiveUser());
        dash.setDeletedMember(dao.countDeletedUser());
        dash.setPendingReports(dao.countPendingReports());
        dash.setAllBrands(dao.countTotalBrand());
        dash.setAllMenues(dao.countTotalMenue());
        dash.setGetNewReports(dao.getCurrentReports());
        dash.setGetNewUpdates(dao.getNewUpdates());
        dash.setAllGrams(dao.countAllGrams());
        dash.setAllPosts(dao.countAllPosts());
        return dash;
    }

    public Map<String,Object> getMenueReport(Integer page, String status) {
        int size = 6;
        int totalPage = (int)Math.ceil(dao.countMenueReport(status)/size);
        int offset = page * size;
        List<MenueReport> list=dao.getMenueReport(status,size,offset);
        Map<String,Object> map = new HashMap<>();
        map.put("totalPage",totalPage);
        map.put("mReportList",list);
        return map;
    }

    public int resolveMenueReport(MenueReport data) {
        int result = dao.resolveMenueReport(data);
        return result;
    }

    public int rejectMenueReport(MenueReport data) {
        int result = dao.rejectMenueReport(data);
        return result;
    }
}
