package com.project.esg.dashboard.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class PopularComparisonCombo {
    private String comboKey;
    private Integer compareCount;
    private List<PopularComparisonMenu> menus = new ArrayList<>();
}
