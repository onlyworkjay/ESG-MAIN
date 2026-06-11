package com.project.esg.master.controller;

import com.project.esg.master.DTO.AdminDTO;
import com.project.esg.master.service.MasterService;
import com.project.esg.master.vo.AdminInfo;
import com.project.esg.master.vo.MasterBrand;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/master")
public class MasterController {
    @Autowired
    private MasterService service;
    @PostMapping("/createAdmin")
    public ResponseEntity<?> insertBrand(@RequestBody MasterBrand brand){
//        System.out.println(brand.getBrandName());
        int result = service.insertBrand(brand);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/getBrandList")
    public ResponseEntity<?> getBrandList(){
        List<MasterBrand> result = service.getBrandList();
        return ResponseEntity.ok(result);
    }
    @DeleteMapping("/deleteBrand")
    public ResponseEntity<?> deleteBrand(@RequestParam String brandName){
        int result = service.deleteBrand(brandName);
        return ResponseEntity.ok(result);
    }
    @PostMapping("/youHadMeAtHello/{loginId}")
    public ResponseEntity<?> checkInfo(@RequestBody String Pw,@PathVariable String loginId){
        Map<String,String> check = new HashMap<String, String>();
        check.put("loginId",loginId);
        check.put("pass",Pw);
        boolean result = service.checkInfo(check);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/checkId")
    public ResponseEntity<?> checkId(@RequestParam("loginId") String loginId){
        boolean result = service.checkId(loginId);
        return ResponseEntity.ok(result);
    }
    @PostMapping("/insertAdmin")
    public ResponseEntity<?> createAdmin(@RequestBody AdminInfo admin){
//        System.out.println(admin);
        int result = service.createAdmin(admin);
        return  ResponseEntity.ok(result);
    }
    @GetMapping("/selectAdmins")
    public ResponseEntity<?> selectAdmins(){
        List<AdminDTO> result = service.selectAdmins();
        return ResponseEntity.ok(result);
    }
    @PatchMapping("/suspend")
    public ResponseEntity<?> adminSuspend(@RequestParam String loginId,@RequestParam String suspensionReason){
        Map<String,String> map = new HashMap<String,String>();
        map.put("loginId",loginId);
        map.put("suspensionReason",suspensionReason);
        int result =service.adminSuspend(map);
        return ResponseEntity.ok(result);
    }
    @PatchMapping("/restoreStatus")
    public ResponseEntity<?> restoreStatus(@RequestParam String loginId){
        int result = service.restoreStatus(loginId);
        return ResponseEntity.ok(result);
    }
    @PatchMapping("/patchBrand")
    public ResponseEntity<?> patchBrand(@RequestBody MasterBrand brand){
//        System.out.println(brand);
        int result = service.patchBrand(brand);
        return ResponseEntity.ok(result);
    }
    @PostMapping("/emailDupCheck")
    public ResponseEntity<?> emailDupCheck(@RequestParam String email){
        Boolean bool = service.emailDupCheck(email);
        return ResponseEntity.ok(bool);
    }
    @PostMapping("/nicknameDupCheck")
    public ResponseEntity<?> nicknameDupCheck(@RequestParam String nickname){
        Boolean bool = service.nicknameDupCheck(nickname);
        return ResponseEntity.ok(bool);
    }

}
