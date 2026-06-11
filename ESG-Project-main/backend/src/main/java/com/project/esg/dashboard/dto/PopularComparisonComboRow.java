package com.project.esg.dashboard.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PopularComparisonComboRow {
    private String comboKey;
    private Integer compareCount;
    private Integer displayOrder;

    private Integer productId;
    private String brandName;
    private String productName;
    private String description;
    private String imageUrl;
    private Integer price;
    private Integer kcal;
    private Integer protein;
    private Integer sodium;
    private Double sugar;
    private Double saturatedFat;
}
