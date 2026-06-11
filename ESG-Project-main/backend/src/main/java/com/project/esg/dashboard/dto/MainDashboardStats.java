package com.project.esg.dashboard.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MainDashboardStats {
    // 등록된 브랜드 수입니다.
    private Long brandCount;

    // 등록된 메뉴 수입니다.
    private Long menuCount;

    // 오늘 확정된 선택 수입니다. choices는 후보 메뉴가 여러 행으로 저장되므로 choice_group_id 기준으로 셉니다.
    private Long todayChoiceCount;

    // 오늘 작성된 후기 수입니다.
    private Long todayGramCount;
}
