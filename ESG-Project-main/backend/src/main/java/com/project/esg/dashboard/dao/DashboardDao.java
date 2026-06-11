package com.project.esg.dashboard.dao;

import com.project.esg.dashboard.dto.MainDashboardStats;
import com.project.esg.dashboard.dto.PopularComparisonComboRow;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DashboardDao {
    // 메인 사용자 대시보드에 표시할 브랜드/메뉴/오늘 선택/오늘 후기 수를 조회합니다.
    MainDashboardStats selectMainDashboardStats();

    // 오늘 같은 메뉴 구성으로 많이 비교된 조합을 메뉴 단위 row로 조회합니다.
    List<PopularComparisonComboRow> selectPopularComparisonComboRows();
}
