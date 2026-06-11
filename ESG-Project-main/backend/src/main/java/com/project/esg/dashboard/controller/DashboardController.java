package com.project.esg.dashboard.controller;

import com.project.esg.dashboard.dto.MainDashboardStats;
import com.project.esg.dashboard.dto.PopularComparisonCombo;
import com.project.esg.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // 메인 화면의 사용자 대시보드에서 필요한 집계 숫자를 한 번에 내려줍니다.
    @GetMapping("/main")
    public ResponseEntity<MainDashboardStats> getMainDashboardStats() {
        return ResponseEntity.ok(dashboardService.getMainDashboardStats());
    }

    // 메인 화면의 "오늘의 인기 비교 조합" 영역에 표시할 조합 목록입니다.
    @GetMapping("/popular-comparison-combos")
    public ResponseEntity<List<PopularComparisonCombo>> getPopularComparisonCombos() {
        return ResponseEntity.ok(dashboardService.getPopularComparisonCombos());
    }
}
