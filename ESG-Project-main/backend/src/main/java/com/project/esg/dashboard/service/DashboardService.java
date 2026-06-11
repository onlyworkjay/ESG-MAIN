package com.project.esg.dashboard.service;

import com.project.esg.dashboard.dao.DashboardDao;
import com.project.esg.dashboard.dto.MainDashboardStats;
import com.project.esg.dashboard.dto.PopularComparisonCombo;
import com.project.esg.dashboard.dto.PopularComparisonComboRow;
import com.project.esg.dashboard.dto.PopularComparisonMenu;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {
    private final DashboardDao dashboardDao;

    public DashboardService(DashboardDao dashboardDao) {
        this.dashboardDao = dashboardDao;
    }

    // Controller가 요청한 메인 대시보드 집계 데이터를 DAO에서 가져옵니다.
    public MainDashboardStats getMainDashboardStats() {
        return dashboardDao.selectMainDashboardStats();
    }

    // Mapper는 메뉴별 row로 내려주고, Service에서 comboKey 기준으로 화면용 구조로 묶습니다.
    public List<PopularComparisonCombo> getPopularComparisonCombos() {
        List<PopularComparisonComboRow> rows = dashboardDao.selectPopularComparisonComboRows();
        Map<String, PopularComparisonCombo> comboMap = new LinkedHashMap<>();

        for (PopularComparisonComboRow row : rows) {
            PopularComparisonCombo combo = comboMap.computeIfAbsent(row.getComboKey(), (comboKey) -> {
                PopularComparisonCombo newCombo = new PopularComparisonCombo();
                newCombo.setComboKey(comboKey);
                newCombo.setCompareCount(row.getCompareCount());
                return newCombo;
            });

            PopularComparisonMenu menu = new PopularComparisonMenu();
            menu.setProductId(row.getProductId());
            menu.setDisplayOrder(row.getDisplayOrder());
            menu.setBrandName(row.getBrandName());
            menu.setProductName(row.getProductName());
            menu.setDescription(row.getDescription());
            menu.setImageUrl(row.getImageUrl());
            menu.setPrice(row.getPrice());
            menu.setKcal(row.getKcal());
            menu.setProtein(row.getProtein());
            menu.setSodium(row.getSodium());
            menu.setSugar(row.getSugar());
            menu.setSaturatedFat(row.getSaturatedFat());

            combo.getMenus().add(menu);
        }

        return new ArrayList<>(comboMap.values());
    }
}
