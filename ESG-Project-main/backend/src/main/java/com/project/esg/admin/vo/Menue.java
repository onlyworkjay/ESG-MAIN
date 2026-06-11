package com.project.esg.admin.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("menue")
public class Menue {
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
    private Integer totalPage;
    private String brandName;
}
