package com.project.esg.admin.controller;

import com.project.esg.admin.dto.*;
import com.project.esg.admin.service.AdminService;
import com.project.esg.admin.vo.*;
import com.project.esg.global.util.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.accept.MediaTypeFileExtensionResolver;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.core.type.TypeReference;
//import com.fasterxml.jackson.databind.ObjectMapper;spring 4 이상은 아님

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin("*")
@RestController
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private AdminService service;
    @Autowired
    private FileUtils util;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MediaTypeFileExtensionResolver mediaTypeFileExtensionResolver;


    @PostMapping("/memberinfo")
    public ResponseEntity<?> memberInfo(@RequestParam("file") MultipartFile file) {
        System.out.println(file);
        String repo = "file/test1";
        String imageSaveRoute = null;
        try {
            imageSaveRoute = util.uploadMenuImage(file,repo);
            return ResponseEntity.ok(imageSaveRoute);
        } catch (IOException e) {
//            throw new RuntimeException(e);
            return ResponseEntity.badRequest().body("파일 업로드 실패");
        }
    }
    @GetMapping("/show")
    public ResponseEntity<?> getMemberInfo(@RequestParam String path){
        System.out.println(path);
        String fileUrl = util.getFileUrl(path);
        System.out.println(fileUrl);
        return  ResponseEntity.ok(fileUrl);
    }
    @GetMapping("/getAllergy")
    public ResponseEntity<?> getAllergyType(){
        List<Allergy> allergy = service.getAllergyType();
        return ResponseEntity.ok(allergy);
    }
    @GetMapping("/getBrand")
    public ResponseEntity<?> getBrandType(){
        List<AdminBrand> brand = service.getBrandType();
        return ResponseEntity.ok(brand);
    }
    @PostMapping("/insertMenue")
    public ResponseEntity<?> insertMenue(@RequestParam("file") MultipartFile file,
                                         @RequestParam("allergies")String allergiesJson,
                                         @RequestParam("menueInfo")String menueInfoJson){
        int result = 0;
        Menue menueInfo = objectMapper.readValue(menueInfoJson, Menue.class);//json객체 자바 객체로(현재 String인 Json으로 받음)
        List<Allergy> allergies = objectMapper.readValue(
                allergiesJson,
                new TypeReference<List<Allergy>>() {}//이 JSON은 그냥 List가 아니라, Allergy 객체들이 들어있는 List야 표시하는거
        );
//        String fileName ="burger/" + menueInfo.getName() + "_"
//                + UUID.randomUUID().toString().replace("-", "").substring(0, 8);//8문자 소환 + '-'를 ""로 바꿈
          String fileName="burger/";
        String fileUrl = null;
        try {
            fileUrl = util.uploadMenuImage(file,fileName);
            menueInfo.setImageUrl(fileUrl);
            result = service.insertMenue(menueInfo,allergies);
            if(result == 0){
                util.delete(fileUrl);
                return ResponseEntity.badRequest().body("메뉴 등록 중 문제 발생");
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
           if(fileUrl != null){
               util.delete(fileUrl);
            }
            e.printStackTrace();
            return ResponseEntity.badRequest().body("파일 업로드 실패 혹은 메뉴등록 실패");
        }

//    return ResponseEntity.ok(null);
    }
    @GetMapping("/selectUsers")
    public ResponseEntity<?> selectUsers(@RequestParam("page") Integer page,
                                         @RequestParam("searchMember") String searchMember,
                                         @RequestParam("userFilter") Integer userFilter,
                                         @RequestParam("orderBy") Integer orderBy,
                                         @RequestParam("searchFilter") Integer searchFilter){
        Search search = new Search();
        search.setPage(page);
        search.setSearchMember(searchMember);
        search.setUserFilter(userFilter);
        search.setOrderBy(orderBy);
        search.setSearchFilter(searchFilter);
        Map<String,Object> result = service.selectUsers(search);
        System.out.println(result);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/getMenueList")
    public ResponseEntity<?> getMenueList( SearchFilter search ){
        Map<String,Object> map = service.getMenueList(search);
        return ResponseEntity.ok(map);
    }
    @GetMapping("/getMenueDetail")
    public ResponseEntity<?> getMenueDetail(@RequestParam("productId") Integer productId ){
        MenueDto  menue= service.getMenueDetail(productId);
        String fileRepo=menue.getImageUrl();
        String fileUrl=util.getFileUrl(fileRepo);
        menue.setImageUrl(fileUrl);
        return ResponseEntity.ok(menue);
    }
    @PatchMapping("/updateMenue")
    public ResponseEntity<?> updateMenue(@RequestParam(value = "file", required = false) MultipartFile file,
                                         @RequestParam("menueDetail") String menueJson){

        MenueDto menue = objectMapper.readValue(menueJson,MenueDto.class);
        System.out.println(menue);
        int result;
        String originalPath = menue.getImageUrl();
        Integer productId= menue.getProductId();
        String s3Key =util.extractS3Key(originalPath);
        String dbS3key = service.getImageUrlDB(productId);
        if( file != null  && !file.isEmpty() && !dbS3key.equals(s3Key)){//파일 존재시 처리(null부터 검사, 아니면 nullpointexception)
            String fileName ="admin/" + menue.getName() + "_"
                    + UUID.randomUUID().toString().replace("-", "").substring(0, 8);//8문자 소환 + '-'를 ""로 바꿈
            String fileUrl = null;
            try {
                fileUrl = util.uploadMenuImage(file,fileName);
                if(fileUrl != null) {

                    menue.setImageUrl(fileUrl);
                    result = service.updateMenue(menue);
                    if (result == 0) {
                        util.delete(fileUrl);
                        return ResponseEntity.badRequest().body("메뉴 등록 중 문제 발생");
                    }
                }else{
                    return ResponseEntity.badRequest().body("파일 업로드 실패");
                }
                if (originalPath != null && !originalPath.contains("default.png")) {//originalPath에 default.png(공통사진), null이들어간 경우의 처리
                    util.delete(originalPath);
                    System.out.println("기존 파일 삭제");
                }

                System.out.println("controller 파일 바꿈 "+result);
                return ResponseEntity.ok(result);
            } catch (Exception e) {
                if(fileUrl != null){
                    util.delete(fileUrl);
                }
                e.printStackTrace();
                return ResponseEntity.badRequest().body("파일 업로드 실패 혹은 메뉴등록 실패");
            }
        }else{//파일 없을때 처리

            menue.setImageUrl(s3Key);
            result = service.updateMenue(menue);
            System.out.println("controller 파일 안바꿈"+result);
            return ResponseEntity.ok(result);
        }

    }
    @GetMapping("/getMemberDetail")
    public ResponseEntity<?> getMemberDetail(@RequestParam("userId") Integer userId ){
        Users users = service.getMemberDetail(userId);
        return ResponseEntity.ok(users);
    }
    @PatchMapping("/groundUser")
    public ResponseEntity<?> groundUser(@RequestBody SuspendDto suspend){
        int result = service.groundUser(suspend);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/getReportList")
    public ResponseEntity<?> getReportList(@RequestParam("page") Integer page, @RequestParam(required = false) String status){
        Map<String,Object> map = service.getReportList(page, status);
        return ResponseEntity.ok(map);
    }
    @PatchMapping("/hidePost")
    public ResponseEntity<?> hidePost(@RequestBody SuspendDto suspend){
        int result = service.hidePost(suspend);
        return ResponseEntity.ok(result);
    }
    @PatchMapping("/hideGram")
    public ResponseEntity<?> hideGram(@RequestBody SuspendDto suspend){
        int result = service.hideGram(suspend);
        return ResponseEntity.ok(result);
    }
    @PatchMapping("/denyReport")
    public ResponseEntity<?> denyReport(@RequestBody SuspendDto suspend){
        int result = service.denyReport(suspend);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(){
        Dashboard dash = service.getDashboard();
        return ResponseEntity.ok(dash);
    }
    @GetMapping("/getMenueReports")
    public ResponseEntity<?> getMenueReport(@RequestParam("page") Integer page,@RequestParam("status") String status){
        Map<String,Object> list = service.getMenueReport(page,status);
        return ResponseEntity.ok(list);
    }
    @PatchMapping("/menueReportResolved")
    public ResponseEntity<?> resolveMenueReport(@RequestBody MenueReport data){
        int result = service.resolveMenueReport(data);
        return ResponseEntity.ok(result);
    }
    @PatchMapping("/menueReportRejected")
    public ResponseEntity<?> rejectMenueReport(@RequestBody MenueReport data){
        int result = service.rejectMenueReport(data);
        return ResponseEntity.ok(result);
    }
    


}
