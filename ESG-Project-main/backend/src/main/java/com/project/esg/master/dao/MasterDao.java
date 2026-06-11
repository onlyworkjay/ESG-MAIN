package com.project.esg.master.dao;

import com.project.esg.master.DTO.AdminDTO;
import com.project.esg.master.vo.AdminInfo;
import com.project.esg.master.vo.MasterBrand;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface MasterDao {
    int insertBrand(MasterBrand brand);

    List<MasterBrand> getBrandList();

    int deleteBrand(String brandName);

    String getPw(String loginId);

    int checkId(String loginId);

    int createAdmin(AdminInfo admin);

    List<AdminDTO> selectAdmins();

    int adminSuspend(Map<String, String> map);

    int restoreStatus(String loginId);

    int patchBrand(MasterBrand brand);

    int emailDupliCheck(String email);

    int nicknameDupCheck(String nickname);
}
