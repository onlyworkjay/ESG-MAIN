package com.project.esg.choice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChoiceDetailItemDto {
    private Long choiceId;
    private String choiceGroupId;
    private Long productId;
    private Integer gramWritten;
    private Integer isSelected;
    private Integer displayOrder;

    private String brand;
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
