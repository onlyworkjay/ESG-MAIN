// 담당자: 장지혁

package com.project.esg.favorite.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class Favorite {
    private Integer userId;
    private Integer productId;
    private String createdAt;
    private String description;
}