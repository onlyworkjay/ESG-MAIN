package com.project.esg.admin.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("aBrand")
public class AdminBrand {
    private Integer brandId;
    private String brandName;
    private String description;
    private int itemCount;
}