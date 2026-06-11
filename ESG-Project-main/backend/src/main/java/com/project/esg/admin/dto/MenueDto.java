package com.project.esg.admin.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@Getter
@Setter
@ToString
@Alias("menuedto")
public class MenueDto {
    private Integer productId;
    private Integer categoryId;
    private Integer brandId;
    private String name;
    private String description;
    private String status;
    private String imageUrl;
    private Integer price;
    private Integer weight;
    private Integer kcal;
    private Integer protein;
    private Integer sodium;
    private Integer sugar;
    private Integer saturatedFat;
    private Integer caffeine;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int informerUserId;
    private String brandName;
    private List<AllergyDto> allergies;
//    private Integer allergyId;
//    private String allergyName;
//    private String
}
