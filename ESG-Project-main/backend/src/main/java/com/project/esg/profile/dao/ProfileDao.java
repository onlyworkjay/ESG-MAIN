package com.project.esg.profile.dao;

import com.project.esg.profile.dto.*;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ProfileDao {


    ProfileResponse getProfileById(ProfileResponse param);


    List<ProfilePostResponse> getProfilePost(ProfileResponse param);

    List<ProfileGramResponse> getProfileGram(ProfileResponse param);

    List<ProfileChoiceResponse> getProfileChoice(ProfileResponse param);

    int insertFavorite(FavoriteResponse param);

    int deleteFavorite(FavoriteResponse param);

    ReportResponse getReportDetail(ReportSearchParam param);

    int insertReport(ReportRequest param);

    int deleteReport(ReportDeleteParam param);
}
