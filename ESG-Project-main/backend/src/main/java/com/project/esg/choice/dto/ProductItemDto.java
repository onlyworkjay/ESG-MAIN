package com.project.esg.choice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.ibatis.type.Alias;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Alias("productItem")
public class ProductItemDto {

    // 상품, 카테고리, 브랜드를 구분하는 기본 식별자입니다.
    private Integer productId;
    private Integer categoryId;
    private Integer brandId;

    // 화면에 보여줄 상품 기본 정보입니다.
    private String productName;
    private String description;
    private String status;
    private String imageUrl;

    // 비교하기/랜덤추첨 화면에서 사용하는 가격과 영양 정보입니다.
    private Integer price;
    private Integer weight;
    private Integer kcal;
    private Integer protein;
    private Integer sodium;

    private Double sugar;
    private Double saturatedFat;
    private Integer caffeine;

    // 상품 데이터 생성/수정 시각입니다.
    private String createdAt;
    private String updatedAt;

    // 상품 정보를 등록한 사용자 id입니다.
    private Integer informerUserId;

    // product_brands 테이블에서 조인해 가져온 브랜드명입니다.
    private String brand;
}
