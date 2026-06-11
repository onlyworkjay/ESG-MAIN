// 담당자: 장지혁

package com.project.esg.eat.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value = "eat")
public class Eat {
    private Integer productId;
    private Integer categoryId;
    private Integer brandId;
    private String brandName;
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
    private String createdAt;
    private String updatedAt;
    private String informerUserId;
    private String informerNickname;
    private List<String> allergies;
}
