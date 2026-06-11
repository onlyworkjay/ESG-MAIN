package com.project.esg.admin.dao;

import com.project.esg.admin.dto.*;
import com.project.esg.admin.vo.*;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface AdminDao {
    

    List<AdminBrand> getBrandType();

    List<Allergy> getAllergyType();

    String getMemberRole(String loginId);

    int insertMenue(Menue menueInfo);

    int insertAllergies(Allergy allergies);

    int getProductId(String imageUrl);

    List<Users> selectUsers(Search search);

    double userCount(Search search);

    List<Menue> getMenueList(SearchFilter search);

    double menueCount(SearchFilter search);


    MenueDto getMenueDetail(Integer productId);

    List<AllergyDto> getAllergyById(Integer productId);

    int updateMenue(MenueDto menue);

    int insertAllergy(Map<String,Integer> map);

//    int updateAllergy(AllergyDto front);

//    int deleteAllergy(AllergyDto db);

    String getImageUrlDB(Integer productId);

    int deleteByAllergyId(Integer productId, Integer allergyId);

    Users getMemberDetail(Integer userId);

    int banUsersTbl(Integer userId,String suspensionReason);

//    int banUserReports(SuspendDto suspend);

    int banUserSuspension(SuspendDto suspend);

    List<ReportDto> getReportList(Integer offset, String status);

    int getReportTotalPage(String status);


    List<SuspendDto> getSuspendedList();

    void restoreStatus(Integer userId);

    int banUserReports(SuspendDto suspend);

    int clearReportsForDuplicates(SuspendDto suspend);

    int hidePostPosts(Integer postId);

    int hidePostPostReport(SuspendDto suspend);

    int clearPostReport(SuspendDto suspend);

    int hideGramGrams(Integer gramId);

    int hideGramGramReports(SuspendDto suspend);

    int clearGramReports(SuspendDto suspend);

    int denyPostReport(SuspendDto suspend);

    int denyGramReport(SuspendDto suspend);

    int denyUserReport(SuspendDto suspend);

    int getWholeMember();

    int countActiveUser();

    int countDeletedUser();

    int countPendingReports();

    int countTotalBrand();

    int countTotalMenue();

    List<SuspendDto> getCurrentReports();

    double countMenueReport(String status);

    List<MenueReport> getMenueReport(String status, int size,int offset);

    int resolveMenueReport(MenueReport data);

    int rejectMenueReport(MenueReport data);

    List<SuspendDto> getNewUpdates();

    int countAllGrams();

    int countAllPosts();
}
