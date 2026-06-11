package com.project.esg.master.service;

import com.project.esg.master.DTO.AdminDTO;
import com.project.esg.master.dao.MasterDao;
import com.project.esg.master.vo.AdminInfo;
import com.project.esg.master.vo.MasterBrand;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class MasterService {
    @Autowired
    private MasterDao dao;
    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Transactional
    public int insertBrand(MasterBrand brand) {
        int result = dao.insertBrand(brand);
        return result;
    }

    public List<MasterBrand> getBrandList() {
        List<MasterBrand> result = dao.getBrandList();
        return result;
    }
    @Transactional
    public int deleteBrand(String brandName) {
        int result = dao.deleteBrand(brandName);
        return result;
    }

    public boolean checkInfo(Map<String,String> check) {
        int result;
        String pw = dao.getPw(check.get("loginId"));
//        System.out.println(pw);
//        System.out.println(check.get("pass"));
        boolean bool = BCrypt.checkpw(check.get("pass"),pw);
        return bool;
    }

    public boolean checkId(String loginId) {
        boolean bool = true;
        int result = dao.checkId(loginId);
        if(result>0){
            bool = false;
        }
        return  bool;
    }
    @Transactional
    public int createAdmin(AdminInfo admin) {
        String password =admin.getPassword();

        String encodedPw = bCryptPasswordEncoder.encode(password);
//        System.out.println(encodedPw);
        admin.setPassword(encodedPw);

        int result=dao.createAdmin(admin);

        return result;
    }

    public List<AdminDTO> selectAdmins() {
        List<AdminDTO> result = dao.selectAdmins();
        return result;
    }
    @Transactional
    public int adminSuspend(Map<String, String> map) {
        int result = dao.adminSuspend(map);
        return result;
    }
    @Transactional
    public int restoreStatus(String loginId) {
        int result = dao.restoreStatus(loginId);
        return  result;
    }
    @Transactional
    public int patchBrand(MasterBrand brand) {
        System.out.println(brand);
        int result = dao.patchBrand(brand);
        System.out.println(result);
        return result;
    }

    public Boolean emailDupCheck(String email) {
          int result = dao.emailDupliCheck(email);
        Boolean bool;
          if(result==0){
              bool = true;
          }else{
              bool=false;
          }

        return bool;
    }

    public Boolean nicknameDupCheck(String nickname) {
        int result = dao.nicknameDupCheck(nickname);
        Boolean bool;
        if(result==0){
            bool = true;
        }else{
            bool=false;
        }
        return bool;
    }
}
